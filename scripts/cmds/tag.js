module.exports = {
 config: {
 name: "tag",
 category: "group",
 role: 0,
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 3,
 description: { en: "Tag members by name, reply or everyone" },
 guide: { en: "{p}tag [name] [msg]\n{p}tag all [msg]\nReply + {p}tag [msg]" }
 },

 onStart: async ({ api, event, usersData, threadsData, args }) => {
 const { threadID, messageID, messageReply } = event;
 try {
 const threadData = await threadsData.get(threadID);
 const seen = new Set();
 const members = threadData.members
 .filter(m => m.inGroup &&!seen.has(m.userID) && seen.add(m.userID))
 .map(m => ({ name: m.name, id: m.userID }));

 let tagUsers = [];
 let text = "";

 if (messageReply) {
 const uid = messageReply.senderID;
 const name = await usersData.getName(uid);
 tagUsers.push({ name, id: uid });
 text = args.join(" ");
 }
 else if (args[0] && ["all", "everyone", "cdi"].includes(args[0].toLowerCase())) {
 tagUsers = members;
 text = args.slice(1).join(" ");
 }
 else {
 if (!args[0]) return api.sendMessage("⚠️ Reply, name or all use korun.", threadID, messageID);
 const searchName = args[0].toLowerCase();
 text = args.slice(1).join(" ");
 tagUsers = members.filter(m => m.name.toLowerCase().includes(searchName));
 if (tagUsers.length === 0) return api.sendMessage("❌ User Not Found.", threadID, messageID);
 }

 const mentions = tagUsers.map(u => ({ tag: u.name, id: u.id }));
 const namesText = tagUsers.map(u => `${u.name}`).join(", ");

 const body = text
 ? `📌 ${text}\n\n👥 ${namesText}`
 : `👥 ${namesText}`;

 return api.sendMessage({ body, mentions }, threadID, messageReply? messageReply.messageID : messageID);

 } catch (error) {
 return api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
 }
 }
};