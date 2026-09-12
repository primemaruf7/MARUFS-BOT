const { getTime } = global.utils;

module.exports = {
 config: {
 name: "user",
 version: "1.5",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 2,
 description: { en: "Manage users in bot system" },
 category: "owner",
 guide: {
 en: "{pn} [find | -f | search | -s] <name>\n{pn} [ban | -b] [<uid> | @tag | reply] <reason>\n{pn} unban [<uid> | @tag | reply]"
 }
 },

 langs: {
 en: {
 noUserFound: "❌ No user found with name: \"%1\"",
 userFound: "🔎 Found %1 user matching \"%2\":\n%3",
 uidRequired: "❌ Uid required! Use: user ban <uid> <reason>",
 reasonRequired: "❌ Reason required!",
 userHasBanned: "⚠️ User [%1 | %2] already banned:\n» Reason: %3\n» Date: %4",
 userBanned: "✅ User [%1 | %2] has been banned:\n» Reason: %3\n» Date: %4",
 uidRequiredUnban: "❌ Uid required to unban",
 userNotBanned: "User [%1 | %2] is not banned",
 userUnbanned: "✅ User [%1 | %2] has been unbanned"
 }
 },

 onStart: async function ({ args, usersData, message, event, prefix, getLang }) {
 const type = args[0];
 switch (type) {
 // find user
 case "find":
 case "-f":
 case "search":
 case "-s": {
 const allUser = await usersData.getAll();
 const keyWord = args.slice(1).join(" ");
 if (!keyWord) return message.reply("❌ Name dao");
 const result = allUser.filter(item => (item.name || "").toLowerCase().includes(keyWord.toLowerCase()));
 const msg = result.reduce((i, user) => i += `\n╭Name: ${user.name}\n╰ID: ${user.userID}`, "");
 return message.reply(result.length == 0? getLang("noUserFound", keyWord) : getLang("userFound", result.length, keyWord, msg));
 }

 // ban user
 case "ban":
 case "-b": {
 let uid, reason;
 if (event.type == "message_reply") {
 uid = event.messageReply.senderID;
 reason = args.slice(1).join(" ");
 } else if (Object.keys(event.mentions).length > 0) {
 const { mentions } = event;
 uid = Object.keys(mentions)[0];
 reason = args.slice(1).join(" ").replace(mentions[uid], "");
 } else if (args[1]) {
 uid = args[1];
 reason = args.slice(2).join(" ");
 } else return message.SyntaxError();

 if (!uid) return message.reply(getLang("uidRequired"));
 if (!reason) return message.reply(getLang("reasonRequired"));

 reason = reason.replace(/\s+/g, ' ');
 const userData = await usersData.get(uid);
 const name = userData.name;
 if (userData.banned.status) {
 return message.reply(getLang("userHasBanned", uid, name, userData.banned.reason, userData.banned.date));
 }
 const time = getTime("DD/MM/YYYY HH:mm:ss");
 await usersData.set(uid, { banned: { status: true, reason, date: time } });
 return message.reply(getLang("userBanned", uid, name, reason, time));
 }

 // unban user
 case "unban":
 case "-u": {
 let uid;
 if (event.type == "message_reply") {
 uid = event.messageReply.senderID;
 } else if (Object.keys(event.mentions).length > 0) {
 uid = Object.keys(event.mentions)[0];
 } else if (args[1]) {
 uid = args[1];
 } else return message.SyntaxError();

 if (!uid) return message.reply(getLang("uidRequiredUnban"));
 const userData = await usersData.get(uid);
 const name = userData.name;
 if (!userData.banned.status) return message.reply(getLang("userNotBanned", uid, name));

 await usersData.set(uid, { banned: {} });
 return message.reply(getLang("userUnbanned", uid, name));
 }

 default:
 return message.SyntaxError();
 }
 }
};