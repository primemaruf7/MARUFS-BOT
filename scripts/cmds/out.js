"use strict";

module.exports = {
 config: {
 name: "out",
 version: "1.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 2,
 shortDescription: "Remove bot from group",
 longDescription: "Remove the bot from the current or specified group.",
 category: "owner",
 guide: {
 en: "{pn} [threadID (optional)]",
 },
 },

 onStart: async function ({ api, event, args }) {
 const botID = api.getCurrentUserID();
 const targetThread = args[0] || event.threadID;

 try {
 await api.sendMessage(
 "👋 বিদায় সবাই...\n" +
 "🤖 আমি এখন এই গ্রুপ থেকে বের হয়ে যাচ্ছি।\n" +
 "💙 সবাই ভালো থাকবেন, সুস্থ থাকবেন!\n" +
 "✨ আবার দেখা হবে ইনশাআল্লাহ।",
 targetThread
 );

 await api.removeUserFromGroup(botID, targetThread);
 } catch (error) {
 console.error(error);

 return api.sendMessage(
 "❌ বের হতে পারলাম না!\n" +
 "⚠️ হয়তো আমি অ্যাডমিন নই অথবা কোনো সমস্যা হয়েছে।",
 event.threadID
 );
 }
 },
};