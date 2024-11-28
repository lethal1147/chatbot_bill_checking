const { app } = require("@azure/functions");
const { getUserByLineId } = require("../services/database.service.js");
const {
  getUserProfile,
  getImageContent,
} = require("../services/line.service.js");
const {
  readMenuFromReceiptImage,
} = require("../services/formRecognizer.service");

app.http("lineoawebhook", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const requestText = await request.text();
    const bodyJson = JSON.parse(requestText);
    context.debug(bodyJson);

    const event = bodyJson.events[0];
    const replyToken = event.replyToken;
    const lineUserID = event.source.userId;
    let userMessage = event.message?.text ?? "Empty Message";
    const messasgeID = event.message?.id;

    const dbUser = await getUserByLineId(lineUserID);
    const userProfile = await getUserProfile(lineUserID);
    const userExist = await checkUserExists(lineUserID);
    if (!userExist) await createUser(lineUserID, userProfile.displayName);
    let userMessages = Array.from((await getUserMessages(lineUserID)) ?? []);
    userMessages = userMessages.slice(-10);
    userMessages = userMessages.filter(
      (item) => item.role !== "tool" && item?.tool_calls === undefined
    );
    let messageToReply = "Default Message";
    if (event?.message?.type === "image") {
      const imageBuffer = await getImageContent({ messageId: messasgeID });
      const { content } = await readMenuFromReceiptImage(imageBuffer);
    }
    return { body: `Hello, !` };
  },
});
