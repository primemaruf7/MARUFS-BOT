const axios = require("axios");

module.exports = {
 config: {
 name: "qrgen",
 version: "5.0.3",
 author: "𝐌𝐚𝐑𝐮𝐅",
 role: 0,
 category: "TOOL"
 },

 onStart: async function ({ api, event, args }) {
 const data = args.join(" ").trim();
 if (!data) return api.sendMessage("❌ qrgen Hello লিখো", event.threadID, event.messageID);

 try {
 // Direct QR URL - Messenger এ URL থেকেই ছবি দেখাবে
 const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(data)}`;
 
 // Method 1: URL দিয়ে Try করবে
 return api.sendMessage(
 {
 body: `✅ QR: ${data}`,
 attachment: await global.utils.getStreamFromURL(qrUrl)
 },
 event.threadID,
 event.messageID
 );

 } catch (e) {
 console.log("QR ERROR LOG:", e.message);
 // Fallback Method 2: যদি Stream fail করে, Link দেবে
 const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(data)}`;
 return api.sendMessage(`✅ QR Link (ছবি Download Error):\n${qrUrl}\n\nData: ${data}`, event.threadID, event.messageID);
 }
 }
};