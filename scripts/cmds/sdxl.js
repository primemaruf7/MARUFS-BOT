const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "sdxl",
 aliases: ["imagine", "gen"],
 version: "2.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 10,
 role: 0,
 shortDescription: "Generate image with SDXL",
 longDescription: "Generate AI image with styles",
 category: "image",
 guide: {
 en: "{pn} <prompt> | <style>\nStyles: 3D, Anime, Cinematic, Comic, Fantasy, Realistic\nEx: {pn} a cat warrior | Anime"
 }
 },

 onStart: async function ({ api, event, args }) {
 const threadID = event.threadID;
 const messageID = event.messageID;

 let input = args.join(" ").split("|");
 let prompt = input[0]?.trim();
 let style = input[1]?.trim()?.toLowerCase() || "realistic";

 if (!prompt) return api.sendMessage(
 "❌ Prompt দাও\n\n📌 Use:\nsdxl a dragon flying | Anime\nsdxl cat in space | Cinematic\n\nStyles: 3D, Anime, Cinematic, Comic, Fantasy, Realistic",
 threadID, messageID
 );

 // style prompt enhance
 const styleMap = {
 "3d": "3d render, highly detailed, pixar style, ",
 "anime": "anime style, studio ghibli, detailed anime art, ",
 "cinematic": "cinematic lighting, epic, 8k, movie poster, ",
 "comic": "comic book style, bold lines, vibrant, ",
 "fantasy": "fantasy art, magical, detailed, ",
 "realistic": "ultra realistic, 8k, highly detailed, photorealistic, "
 };

 const stylePrompt = styleMap[style] || styleMap["realistic"] + style + ", ";
 const finalPrompt = encodeURIComponent(stylePrompt + prompt);

 const loading = await api.sendMessage(`⏳ Generating...\n🎨 Prompt: ${prompt}\n✨ Style: ${style}`, threadID);

 try {
 const cachePath = path.join(__dirname, "cache");
 if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath, { recursive: true });

 const filePath = path.join(cachePath, `sdxl_${Date.now()}.jpg`);

 // Working SDXL API - Pollinations
 const imageUrl = `https://image.pollinations.ai/prompt/${finalPrompt}?width=1024&height=1024&model=flux&nologo=true&enhance=true`;

 const res = await axios.get(imageUrl, { responseType: "arraybuffer", timeout: 60000 });
 fs.writeFileSync(filePath, res.data);

 return api.sendMessage(
 {
 body: `✅ Done!\n\n📝 Prompt: ${prompt}\n🎨 Style: ${style}`,
 attachment: fs.createReadStream(filePath)
 },
 threadID,
 () => {
 if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
 api.unsendMessage(loading.messageID);
 },
 messageID
 );

 } catch (e) {
 console.log(e.message);
 return api.sendMessage("❌ Image generate failed, আবার চেষ্টা করো।", threadID, messageID);
 }
 }
};