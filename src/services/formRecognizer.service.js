const {
  AzureKeyCredential,
  DocumentAnalysisClient,
} = require("@azure/ai-form-recognizer");

const convertBase64ToBuffer = (base64Image) => {
  const base64Data = base64Image.replace(
    /^data:image\/(png|jpg|jpeg);base64,/,
    ""
  );
  const buffer = Buffer.from(base64Data, "base64");
  return buffer;
};

const readMenuFromReceiptImage = async (image = "") => {
  try {
    let formUrl = image;
    const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
    const key = process.env.AZURE_FORM_RECOGNIZER_KEY;
    if (!endpoint || !key) throw new Error("Key or Endpoint is missing.");
    if (formUrl.startsWith("data:")) {
      formUrl = convertBase64ToBuffer(formUrl);
    }

    const client = new DocumentAnalysisClient(
      endpoint,
      new AzureKeyCredential(key)
    );
    const poller = await client.beginAnalyzeDocument("prebuilt-read", formUrl);
    const poll = await poller.pollUntilDone();
    return poll;
  } catch (err) {
    throw err;
  }
};

module.exports = { readMenuFromReceiptImage };
