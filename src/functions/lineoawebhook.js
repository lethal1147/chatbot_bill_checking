const { app } = require("@azure/functions");

const {
  getUserProfile,
  getImageContent,
  replyMessage,
} = require("../services/line.service.js");
const {
  readMenuFromReceiptImage,
} = require("../services/formRecognizer.service");
const {
  submitTextContentFormRecognizerToGPT,
  submitMessageToGPT,
} = require("../services/openai.service.js");
const {
  getUserMessages,
  getUserByLineId,
  checkUserExists,
  createUser,
  updateUserMessage,
} = require("../services/database.service.js");

app.http("lineoawebhook", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    try {
      const requestText = await request.text();
      const bodyJson = JSON.parse(requestText);
      console.log("requestText", bodyJson);
      context.debug(bodyJson);

      const event = bodyJson.events[0];
      const replyToken = event.replyToken;
      const lineUserID = event.source.userId;
      let userMessage = event.message?.text ?? "Empty Message";
      const messasgeID = event.message?.id;

      const userProfile = await getUserProfile(lineUserID);
      const userExist = await checkUserExists(lineUserID);
      if (!userExist) await createUser(lineUserID, userProfile.displayName);
      const dbUser = await getUserByLineId(lineUserID);
      let userMessages = Array.from((await getUserMessages(lineUserID)) ?? []);
      userMessages = userMessages.slice(-10);
      userMessages = userMessages.filter(
        (item) => item.role !== "tool" && item?.tool_calls === undefined
      );
      let messageToReply = "Default Message";
      let formRecMessage = {};
      if (event?.message?.type === "image") {
        const imageBuffer = await getImageContent({ messageId: messasgeID });
        const { content } = await readMenuFromReceiptImage(imageBuffer);
        const messageToSubmit = await submitTextContentFormRecognizerToGPT(
          content
        );
        formRecMessage = JSON.parse(messageToSubmit);
        userMessages.push({
          role: "user",
          content: [{ type: "text", text: messageToSubmit }],
        });
        console.log("messageToSubmit", messageToSubmit);
      } else {
        userMessages.push({
          role: "user",
          content: [{ text: `${userMessage}`, type: "text" }],
        });
      }

      const submitToGptResponse = await submitMessageToGPT({
        userID: dbUser.id,
        messages: userMessages,
        formRecMessage: formRecMessage,
      });
      console.log("after submit");
      messageToReply = submitToGptResponse.message_to_reply;
      const updateRes = await updateUserMessage(
        lineUserID,
        submitToGptResponse.messages
      );
      console.log("after update user message", updateRes);

      const replyRespnoseText = await replyMessage({
        messageText: messageToReply,
        replyToken: replyToken,
        messageType: "text",
      });
      console.log("after reply", replyRespnoseText);
      return { body: JSON.stringify(replyRespnoseText), status: 200 };
    } catch (err) {
      console.log(err);
    }
  },
});
