const axios = require("axios");

module.exports = {
 config: {
 name: "prompt",
 aliases: ["p"],
 version: "5.2",
 author: "𝐌𝐚𝐑𝐮𝐅",
 role: 0,
 category: "AI",
 guide: "{pn} reply to image"
 },

 onStart: async ({ api, event }) => {
 const { threadID, messageID, messageReply } = event;
 if (!messageReply?.attachments?.[0]?.url) {
 return api.sendMessage("❌ ছবিতে Reply দিয়ে prompt লিখো", threadID, messageID);
 }

 try {
 api.setMessageReaction("⏳", messageID, () => {}, true);
 const imageUrl = messageReply.attachments[0].url;

 // WORKING VISION API - No Key Needed
 const res = await axios.post("https://gen.pollinations.ai/openai", {
 model: "openai",
 messages: [
 {
 role: "user",
 content: [
 { type: "text", text: "Describe this image in a very detailed Midjourney v6 prompt. Only give the prompt, no extra text. Include style, lighting, camera, details." },
 { type: "image_url", image_url: { url: imageUrl } }
 ]
 }
 ],
 max_tokens: 500
 }, {
 headers: { "Content-Type": "application/json" },
 timeout: 40000
 });

 const promptText = res.data?.choices?.[0]?.message?.content;
 if (!promptText) throw new Error("No prompt generated");

 api.setMessageReaction("✅", messageID, () => {}, true);
 return api.sendMessage(`🎨 𝗣𝗥𝗢𝗠𝗣𝗧:\n\n${promptText}`, threadID, messageID);

 } catch (e) {
 console.log("PROMPT ERROR:", e.response?.data || e.message);
 api.setMessageReaction("❌", messageID, () => {}, true);
 return api.sendMessage(`❌ Error: ${e.response?.data?.error?.message || e.message}`, threadID, messageID);
 }
 }
};