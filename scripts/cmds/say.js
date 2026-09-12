const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
 config: {
 name: "say",
 version: "2.1",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 0,
 shortDescription: "Text to voice (Google TTS)",
 longDescription: "যেকোনো টেক্সটকে ভয়েসে কনভার্ট করে",
 category: "media",
 guide: {
 en: "{pn} <text>\nEx: {pn} কেমন আছো?\nReply করেও ব্যবহার করা যাবে"
 }
 },

 onStart: async function ({ api, event, args }) {
 const threadID = event.threadID;
 const messageID = event.messageID;

 try {
 let text = args.join(" ").trim();
 if (!text) text = event.messageReply?.body;

 if (!text) return api.sendMessage("❌ দয়া করে কিছু লিখো যেটা ভয়েসে বলবো\nEx: say আমি ভালো আছি", threadID, messageID);

 if (text.length > 200) text = text.substring(0, 200);

 const cacheDir = path.join(__dirname, "cache");
 if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

 const filePath = path.join(cacheDir, `say_${Date.now()}.mp3`);

 // Fixed Google TTS with headers
 const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=tw-ob`;

 const response = await axios.get(url, {
 responseType: "arraybuffer",
 headers: {
 "User-Agent": "Mozilla/5.0",
 "Referer": "https://translate.google.com/"
 }
 });

 fs.writeFileSync(filePath, Buffer.from(response.data));

 return api.sendMessage(
 {
 body: `🔊 ${text}`,
 attachment: fs.createReadStream(filePath)
 },
 threadID,
 () => {
 if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
 },
 messageID
 );

 } catch (e) {
 console.log("Say error:", e.message);
 return api.sendMessage("❌ ভয়েস বানাতে সমস্যা হয়েছে, আবার চেষ্টা করো", event.threadID, event.messageID);
 }
 }
};