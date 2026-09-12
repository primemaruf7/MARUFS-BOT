const fs = require("fs-extra");

module.exports = {
 config: {
 name: "restart",
 aliases: ["rs", "reboot"],
 version: "3.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 2,
 description: { en: "Restart bot stylish" },
 category: "owner"
 },

 onLoad: function ({ api }) {
 const pathFile = `${__dirname}/tmp/restart.txt`;
 if (fs.existsSync(pathFile)) {
 try {
 const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
 const sec = ((Date.now() - parseInt(time)) / 1000).toFixed(2);

 const msg = `✨ 𝗥𝗘𝗦𝗧𝗔𝗥𝗧 𝗗𝗢𝗡𝗘 ✨
━━━━━━━━━━━━━━━━━━━━━━
🔰 𝗕𝗢𝗧 𝗜𝗦 𝗡𝗢𝗪 𝗢𝗡𝗟𝗜𝗡𝗘
━━━━━━━━━━━━━━━━━━━━━━
⏰ 𝗧𝗶𝗺𝗲: ${sec}s
👑 𝗢𝘄𝗻𝗲𝗿: 𝐌𝐚𝐑𝐮𝐅
🚀 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗦𝘂𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝘆 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗲𝗱
━━━━━━━━━━━━━━━━━━━━━━`;

 api.sendMessage(msg, tid);
 fs.unlinkSync(pathFile);
 } catch (e) {
 console.log(e);
 }
 }
 },

 onStart: async function ({ api, event }) {
 const pathFile = `${__dirname}/tmp/restart.txt`;
 const dir = `${__dirname}/tmp`;
 if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

 fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);

 await api.sendMessage("🔄 𝗥𝗲𝘀𝘁𝗮𝗿𝘁𝗶𝗻𝗴 𝗕𝗼𝘁...\nচুপ করে বসে থাক 🫵😾", event.threadID);
 
 process.exit(2);
 }
};