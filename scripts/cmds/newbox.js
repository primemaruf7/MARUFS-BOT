module.exports = {
 config: {
 name: "newbox",
 aliases: ["nb"],
 version: "2.0.2",
 author: "𝐌𝐚𝐑𝐮𝐅",
 role: 2,
 description: "Silent group create",
 category: "group"
 },

 onStart: async ({ api, event }) => {
 const { senderID, mentions, body } = event;
 const ids = Object.keys(mentions);
 if (ids.length < 1) return;

 const members = [...new Set([senderID,...ids])];
 if (members.length < 2) return;

 let name = body.replace(/^\S+\s+/, "");
 for (const i in mentions) name = name.replace(mentions[i], "").trim();
 if (!name) return;

 api.createNewGroup(members, name, () => {});
 }
};