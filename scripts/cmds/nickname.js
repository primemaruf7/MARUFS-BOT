module.exports = {
 config: {
 name: "nickname",
 aliases: ["nick", "nn"],
 version: "1.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 0,
 role: 0,
 description: {
 en: "Reply to someone's message and set their group nickname silently."
 },
 category: "group",
 guide: {
 en: "কারো মেসেজে রিপ্লাই দিয়ে লিখো: {pn} <নতুন নাম>"
 }
 },

 onStart: async function ({ api, event, message, args }) {
 // রিপ্লাই চেক
 if (!event.messageReply) return;

 const newNickname = args.join(" ");
 if (!newNickname) return;

 const targetID = event.messageReply.senderID;
 const threadID = event.threadID;

 try {
 await api.changeNickname(newNickname, threadID, targetID);
 // সফল হলে কিছুই বলবে না, সাইলেন্ট
 } catch (error) {
 // শুধু এডমিন পারমিশন না থাকলে মেসেজ দিবে
 return message.reply("❌ নিকনেম সেট করতে পারি নাই। বটকে গ্রুপ এডমিন বানাও।");
 }
 }
};