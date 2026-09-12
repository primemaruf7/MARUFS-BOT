const { getTime } = global.utils;

module.exports = {
 config: {
 name: "thread",
 version: "1.6",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 0,
 description: { en: "Manage group chat in bot system" },
 category: "owner",
 guide: {
 en: "{pn} [find | -f | search | -s] <name>\n{pn} [find | -f] [-j | joined] <name>\n{pn} [ban | -b] [<tid>] <reason>\n{pn} unban [<tid>]\n{pn} info [<tid>]"
 }
 },

 langs: {
 en: {
 noPermission: "You don't have permission to use this feature",
 found: "🔎 Found %1 group matching \"%2\":\n%3",
 notFound: "❌ No group found matching: \"%1\"",
 hasBanned: "Group [%1 | %2] already banned:\n» Reason: %3\n» Time: %4",
 banned: "✅ Banned group [%1 | %2]:\n» Reason: %3\n» Time: %4",
 notBanned: "Group [%1 | %2] is not banned",
 unbanned: "✅ Unbanned group [%1 | %2]",
 missingReason: "❌ Ban reason cannot be empty",
 info: "» Box ID: %1\n» Name: %2\n» Created: %3\n» Total members: %4\n» Boy: %5\n» Girl: %6\n» Total messages: %7%8"
 }
 },

 onStart: async function ({ args, threadsData, message, role, event, getLang }) {
 const type = args[0];
 switch (type) {
 case "find":
 case "search":
 case "-f":
 case "-s": {
 if (role < 2) return message.reply(getLang("noPermission"));
 let allThread = await threadsData.getAll();
 let keyword = args.slice(1).join(" ");
 if (['-j', '-join'].includes(args[1])) {
 allThread = allThread.filter(thread => thread.members.some(member => member.userID == global.GoatBot.botID && member.inGroup));
 keyword = args.slice(2).join(" ");
 }
 const result = allThread.filter(item => item.threadID.length > 15 && (item.threadName || "").toLowerCase().includes(keyword.toLowerCase()));
 const resultText = result.reduce((i, thread) => i += `\n╭Name: ${thread.threadName}\n╰ID: ${thread.threadID}`, "");
 return message.reply(result.length > 0? getLang("found", result.length, keyword, resultText) : getLang("notFound", keyword));
 }

 case "ban":
 case "-b": {
 if (role < 2) return message.reply(getLang("noPermission"));
 let tid, reason;
 if (!isNaN(args[1])) {
 tid = args[1];
 reason = args.slice(2).join(" ");
 } else {
 tid = event.threadID;
 reason = args.slice(1).join(" ");
 }
 if (!tid) return message.SyntaxError();
 if (!reason) return message.reply(getLang("missingReason"));
 reason = reason.replace(/\s+/g, ' ');
 const threadData = await threadsData.get(tid);
 if (threadData.banned.status) return message.reply(getLang("hasBanned", tid, threadData.threadName, threadData.banned.reason, threadData.banned.date));
 const time = getTime("DD/MM/YYYY HH:mm:ss");
 await threadsData.set(tid, { banned: { status: true, reason, date: time } });
 return message.reply(getLang("banned", tid, threadData.threadName, reason, time));
 }

 case "unban":
 case "-u": {
 if (role < 2) return message.reply(getLang("noPermission"));
 let tid =!isNaN(args[1])? args[1] : event.threadID;
 if (!tid) return message.SyntaxError();
 const threadData = await threadsData.get(tid);
 if (!threadData.banned.status) return message.reply(getLang("notBanned", tid, threadData.threadName));
 await threadsData.set(tid, { banned: {} });
 return message.reply(getLang("unbanned", tid, threadData.threadName));
 }

 case "info":
 case "-i": {
 let tid =!isNaN(args[1])? args[1] : event.threadID;
 if (!tid) return message.SyntaxError();
 const threadData = await threadsData.get(tid);
 const createdDate = getTime(threadData.createdAt, "DD/MM/YYYY HH:mm:ss");
 const valuesMember = Object.values(threadData.members).filter(item => item.inGroup);
 const totalBoy = valuesMember.filter(item => item.gender == "MALE").length;
 const totalGirl = valuesMember.filter(item => item.gender == "FEMALE").length;
 const totalMessage = valuesMember.reduce((i, item) => i += item.count, 0);
 const infoBanned = threadData.banned.status? `\n- Banned: ${threadData.banned.status}\n- Reason: ${threadData.banned.reason}\n- Time: ${threadData.banned.date}` : "";
 return message.reply(getLang("info", threadData.threadID, threadData.threadName, createdDate, valuesMember.length, totalBoy, totalGirl, totalMessage, infoBanned));
 }

 default:
 return message.SyntaxError();
 }
 }
};