const axios = require("axios");

module.exports = {
 config: {
 name: "tempmail",
 aliases: ["tmp", "mail"],
 version: "2.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 role: 0,
 countDown: 5,
 category: "tools",
 description: "Create temp mail with edit system",
 guide: "{pn} -> create mail\n{pn} inbox -> check inbox"
 }
};

const BASE = "https://api.mail.tm";
const userDB = new Map();

module.exports.onStart = async ({ event, api, args }) => {
 const { threadID, senderID } = event;
 const action = args[0]?.toLowerCase();

 try {
 if (action === "inbox" || action === "check") {
 const saved = userDB.get(senderID);
 if (!saved) return api.sendMessage("❌ মেইল নেই, আগে tmp লিখো", threadID, event.messageID);

 const { data } = await axios.get(`${BASE}/messages`, {
 headers: { Authorization: `Bearer ${saved.token}` }
 });

 const list = data["hydra:member"];
 if (!list.length) return api.sendMessage(`📭 Inbox খালি\n✉️ ${saved.mail}\n\n10s পর আবার tmp inbox লিখো`, threadID, event.messageID);

 let msg = `📬 ${saved.mail} এর Inbox:\n\n`;
 for (const m of list.slice(0, 3)) {
 const { data: full } = await axios.get(`${BASE}/messages/${m.id}`, {
 headers: { Authorization: `Bearer ${saved.token}` }
 });
 const clean = (full.text || full.html || "").replace(/<[^>]*>/g, "").substring(0, 500);
 msg += `📩 From: ${m.from.address}\n📌 ${m.subject}\n💬 ${clean}\n\n━━━━━━━━━━━━\n\n`;
 }
 return api.sendMessage(msg, threadID, event.messageID);
 }

 // Step 1: send loading msg
 const loadingMsg = await new Promise(resolve => {
 api.sendMessage("⏳ তোমার জন্য Temp Mail বানাচ্ছি...", threadID, (err, info) => resolve(info));
 });

 // Step 2: create account
 const { data: domData } = await axios.get(`${BASE}/domains`);
 const domain = domData["hydra:member"][0].domain;
 const user = `maruf_${Date.now().toString(36)}`;
 const mail = `${user}@${domain}`;
 const pass = `${user}@123#`;

 await axios.post(`${BASE}/accounts`, { address: mail, password: pass });
 const { data: tokenData } = await axios.post(`${BASE}/token`, { address: mail, password: pass });

 userDB.set(senderID, { mail, pass, token: tokenData.token });

 // Step 3: Edit that message
 const finalText = `✅ Temp Mail Ready!\n\n╭─ 📩 EMAIL ──╮\n│ ${mail}\n╰────────────╯\n\n📥 কোড / OTP নিতে লিখো:\n👉 tmp inbox\n\n💡 Tip: তোমার মেইলটা সেভ থাকবে, বার বার কপি লাগবে না।`;

 return api.editMessage(finalText, loadingMsg.messageID);

 } catch (e) {
 console.log(e.message);
 return api.sendMessage("❌ API busy, আবার চেষ্টা করো।", threadID, event.messageID);
 }
};