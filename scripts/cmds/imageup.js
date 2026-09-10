const axios = require("axios");
const API_KEY = "da78584a330dffab833e1d8fef56badc";

module.exports = {
  config: {
    name: "imageup",
    aliases: ["imgup"],
    version: "2.2.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 0,
    category: "tool"
  },

  onStart: async function ({ api, event }) {
    try {
      const reply = event.messageReply;
      if ( !reply || !reply.attachments || !reply.attachments.length ) {
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const attachment = reply.attachments.find(
        a => (a.type === "photo" || a.type === "image") && a.url
      );
      if (!attachment) {
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      api.setMessageReaction("📤", event.messageID, () => {}, true);

      const imageResponse = await axios.get(
        attachment.url,
        { responseType: "arraybuffer", timeout: 30000 }
      );
      const imageBuffer = Buffer.from(imageResponse.data);
      if (!imageBuffer.length) throw new Error("Empty image");

      const base64Image = imageBuffer.toString("base64");

      const form = new URLSearchParams();
      form.append("key", API_KEY);
      form.append("image", base64Image);
      
      const response = await axios.post(
        "https://api.imgbb.com/1/upload",
        form.toString(),
        { 
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          timeout: 60000 
        }
      );

      const data = response.data;
      if ( !data || !data.success || !data.data || !data.data.url ) {
        throw new Error("ImgBB upload failed");
      }

      const imageURL = data.data.url;

      api.setMessageReaction("✅", event.messageID, () => {}, true);
      return api.sendMessage(imageURL, event.threadID, () => {}, event.messageID);

    } catch (error) {
      console.error("IMGBB ERROR:", error);
      return api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};