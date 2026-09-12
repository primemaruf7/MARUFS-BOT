const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "webss",
 aliases: ["screenshot", "ss"],
 version: "1.2",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 10,
 role: 0,
 shortDescription: "Website screenshot",
 longDescription: "Take a screenshot of any website",
 category: "group",
 guide: {
 en: "{p}webss <url>\nExample: {p}webss google.com",
 },
 },

 onStart: async function ({ api, event, args, message }) {
 if (!args[0]) {
 return message.reply("❌ URL দাও!\n\nExample: webss google.com");
 }

 let url = args[0].trim();
 if (!url.startsWith("http://") &&!url.startsWith("https://")) {
 url = "https://" + url;
 }

 try { new URL(url); } catch {
 return message.reply("❌ Invalid URL!");
 }

 const { messageID, threadID } = event;
 await api.setMessageReaction("⏳", messageID, () => {}, true);

 const screenshotPath = path.join(__dirname, `../tmp/webss_${Date.now()}.png`);

 try {
 const encodedUrl = encodeURIComponent(url);
 const apiUrl = `https://s.wordpress.com/mshots/v1/${encodedUrl}?w=1280&h=900`;

 let imageBuffer;
 for (let i = 0; i < 6; i++) {
 const res = await axios.get(apiUrl, { responseType: "arraybuffer", timeout: 30000 });
 const buffer = Buffer.from(res.data);
 const isLoading = buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
 if (!isLoading && buffer.length > 5000) {
 imageBuffer = buffer;
 break;
 }
 await new Promise(r => setTimeout(r, 3000));
 }

 if (!imageBuffer) throw new Error("Screenshot ready হতে সময় লাগছে, আবার try করো");

 await fs.outputFile(screenshotPath, imageBuffer);
 await api.setMessageReaction("✅", messageID, () => {}, true);

 await message.reply({
 body: `✅ Screenshot Done\n🌐 ${url}`,
 attachment: fs.createReadStream(screenshotPath),
 });

 } catch (err) {
 await api.setMessageReaction("❌", messageID, () => {}, true);
 message.reply(`❌ Failed!\n${err.message}`);
 } finally {
 setTimeout(() => fs.remove(screenshotPath).catch(() => {}), 10000);
 }
 },
};