function sleep(time) {
 return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
 config: {
 name: "filteruser",
 version: "2.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 1,
 description: { en: "filter group members by number of messages or locked account" },
 category: "box chat",
 guide: { en: "{pn} [<number of messages> | die]" }
 },

 langs: {
 en: {
 needAdmin: "⚠️ | 𝑃𝑙𝑒𝑎𝑠𝑒 𝑚𝑎𝑘𝑒 𝑚𝑒 𝑎𝑑𝑚𝑖𝑛 𝑓𝑖𝑟𝑠𝑡 𝑏𝑜𝑠 🥺 𝑡ℎ𝑒𝑛 𝐼 𝑐𝑎𝑛 𝑑𝑜 𝑡ℎ𝑖𝑠",
 confirm: "⚠️ | 𝐴𝑟𝑒 𝑦𝑜𝑢 𝑠𝑢𝑟𝑒 𝑦𝑜𝑢 𝑤𝑎𝑛𝑡 𝑡𝑜 𝑘𝑖𝑐𝑘 𝑚𝑒𝑚𝑏𝑒𝑟𝑠 𝑤𝑖𝑡ℎ 𝑙𝑒𝑠𝑠 𝑡ℎ𝑎𝑛 %1 𝑚𝑒𝑠𝑠𝑎𝑔𝑒𝑠?\n𝑅𝑒𝑎𝑐𝑡 𝑡𝑜 𝑡ℎ𝑖𝑠 𝑚𝑒𝑠𝑠𝑎𝑔𝑒 𝑡𝑜 𝑐𝑜𝑛𝑓𝑖𝑟𝑚 💫",
 kickByBlock: "✅ | 𝑆𝑢𝑐𝑒𝑠𝑓𝑢𝑙𝑦 𝑟𝑒𝑚𝑜𝑣𝑒𝑑 %1 𝑑𝑒𝑎𝑐𝑡𝑖𝑣𝑎𝑡𝑒𝑑 𝑎𝑐𝑐𝑜𝑢𝑛𝑡𝑠",
 kickByMsg: "✅ | 𝑆𝑢𝑐𝑐𝑒𝑠𝑠𝑓𝑢𝑙𝑦 𝑘𝑖𝑐𝑘𝑒𝑑 %1 𝑚𝑒𝑚𝑏𝑒𝑟𝑠 𝑤𝑖𝑡ℎ 𝑙𝑒𝑠 𝑡ℎ𝑎𝑛 %2 𝑚𝑒𝑠𝑎𝑔𝑒𝑠",
 kickError: "❌ | 𝐹𝑎𝑖𝑙𝑒𝑑 𝑡𝑜 𝑘𝑖𝑐𝑘 %1 𝑚𝑒𝑚𝑏𝑒𝑟𝑠 𝑠𝑜𝑟𝑦 𝑏𝑜𝑠 😥\n%2",
 noBlock: "✅ | 𝑇ℎ𝑒𝑟𝑒 𝑎𝑟𝑒 𝑛𝑜 𝑑𝑒𝑎𝑐𝑡𝑖𝑣𝑎𝑡𝑒𝑑 𝑎𝑐𝑐𝑜𝑢𝑛𝑡𝑠 𝑖𝑛 𝑡ℎ𝑖𝑠 𝑔𝑟𝑜𝑢𝑝",
 noMsg: "✅ | 𝑁𝑜 𝑜𝑛𝑒 ℎ𝑎𝑠 𝑙𝑒𝑠𝑠 𝑡ℎ𝑎𝑛 %1 𝑚𝑒𝑠𝑎𝑔𝑒𝑠 𝑖𝑛 𝑡ℎ𝑖𝑠 𝑔𝑟𝑜𝑢𝑝"
 }
 },

 onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
 const threadData = await threadsData.get(event.threadID);
 if (!threadData.adminIDs.includes(api.getCurrentUserID()))
 return message.reply(getLang("needAdmin"));

 if (!isNaN(args[0])) {
 message.reply(getLang("confirm", args[0]), (err, info) => {
 global.GoatBot.onReaction.set(info.messageID, {
 author: event.senderID,
 messageID: info.messageID,
 minimum: Number(args[0]),
 commandName
 });
 });
 }

 else if (args[0] == "die") {
 const threadInfo = await api.getThreadInfo(event.threadID);
 const membersBlocked = threadInfo.userInfo.filter(user => user.type!== "User");
 const errors = [];
 const success = [];

 for (const user of membersBlocked) {
 if (user.type!== "User" &&!threadInfo.adminIDs.some(id => id == user.id)) {
 try {
 await api.removeUserFromGroup(user.id, event.threadID);
 success.push(user.id);
 } catch (e) {
 errors.push(user.name);
 }
 await sleep(700);
 }
 }

 let msg = "";
 if (success.length > 0) msg += `${getLang("kickByBlock", success.length)}\n`;
 if (errors.length > 0) msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
 if (msg == "") msg += getLang("noBlock");
 message.reply(msg);
 }

 else message.SyntaxError();
 },

 onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
 const { minimum = 1, author } = Reaction;
 if (event.userID!= author) return;

 const threadData = await threadsData.get(event.threadID);
 const botID = api.getCurrentUserID();
 const membersCountLess = threadData.members.filter(member =>
 member.count < minimum &&
 member.inGroup == true &&
 member.userID!= botID &&
 !threadData.adminIDs.some(id => id == member.userID)
 );

 const errors = [];
 const success = [];

 for (const member of membersCountLess) {
 try {
 await api.removeUserFromGroup(member.userID, event.threadID);
 success.push(member.userID);
 } catch (e) {
 errors.push(member.name);
 }
 await sleep(700);
 }

 let msg = "";
 if (success.length > 0) msg += `${getLang("kickByMsg", success.length, minimum)}\n`;
 if (errors.length > 0) msg += `${getLang("kickError", errors.length, errors.join("\n"))}\n`;
 if (msg == "") msg += getLang("noMsg", minimum);
 message.reply(msg);
 }
};