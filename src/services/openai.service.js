const {
  COMPLETION_TEMPLATE,
  COMPLETION_TEMPLATE_FOR_SUBMIT_FORM_RECOGNIZER,
} = require("../config/ai_tool.js");
const OpenAI = require("openai");
const {
  createBillFromRecognizer,
  checkMenusInBill,
} = require("./database.service.js");

const submitMessageToGPT = async ({ userID, messages, formRecMessage }) => {
  const payload_template = { ...COMPLETION_TEMPLATE };
  payload_template.messages = payload_template.messages.concat(messages);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const gptResponseMessage = await openai.chat.completions.create(
    payload_template
  );
  payload_template.messages.push(gptResponseMessage.choices[0].message);

  let messageToReplyCallback = "";
  if (gptResponseMessage?.choices?.[0]?.finish_reason === "tool_calls") {
    for (const toolCall of gptResponseMessage.choices[0].message.tool_calls) {
      let toolArg = JSON.parse(toolCall.function.arguments);
      toolArg = Object.keys(toolArg).length === 0 ? null : toolArg;
      console.log("toolArg", toolArg);
      const toolName = toolCall.function.name;
      const toolCallID = toolCall.id;

      let toolResponseText = "ฟีเจอร์นี้ยังไม่ได้พัฒนา";
      //   tool_call
      if (toolName === "create_bill" && formRecMessage) {
        const { billPublicId } = await createBillFromRecognizer(
          new Date(),
          formRecMessage
        );
        toolResponseText = `สร้างบิลเรียบร้อย สามารถตรวจสอบรายละเอียดด้วยเลยที่บิลนี้ : '${billPublicId}'`;
      } else if (toolName === "check_menus_in_bill") {
        const { bill_public_id } = toolArg;
        const billsData = await checkMenusInBill(bill_public_id);
        toolResponseText = `format this list or menus to be table that easier to read ${billsData}`;
      }
      payload_template.messages.push({
        role: "tool",
        content: [{ type: "text", text: toolResponseText }],
        tool_call_id: toolCallID,
      });
    }
    const responseAfterToolCall = await openai.chat.completions.create(
      payload_template
    );
    payload_template.messages.push(responseAfterToolCall.choices[0].message);
    messageToReplyCallback = responseAfterToolCall.choices[0].message.content;
  } else {
    messageToReplyCallback = gptResponseMessage.choices[0].message.content;
  }
  payload_template.messages.splice(0, 1);
  return {
    status: "success",
    message_to_reply: messageToReplyCallback,
    messages: payload_template.messages,
  };
};

const submitTextContentFormRecognizerToGPT = async (message) => {
  try {
    const payloadTemplate = {
      ...COMPLETION_TEMPLATE_FOR_SUBMIT_FORM_RECOGNIZER,
    };
    payloadTemplate.messages = payloadTemplate.messages.concat({
      role: "user",
      content: [{ text: message, type: "text" }],
    });
    const apiKey = process.env.OPENAI_API_KEY;
    const openai = new OpenAI({ apiKey });
    const gptResponseMessage = await openai.chat.completions.create(
      payloadTemplate
    );
    console.log("gptResponseMessage", gptResponseMessage);
    const messageToReply = gptResponseMessage.choices[0].message.content;
    console.log("messageToReply", gptResponseMessage.choices[0].message);
    return messageToReply
      ?.replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  } catch (err) {
    throw err;
  }
};

module.exports = {
  submitMessageToGPT,
  submitTextContentFormRecognizerToGPT,
};
