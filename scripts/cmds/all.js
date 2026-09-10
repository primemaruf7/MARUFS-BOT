module.exports = {
 config: {
 name: "all",
 version: "2.2.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 0,
 shortDescription: "Tag all members",
 longDescription: "Group er shobai ke ekshathe tag kore",
 category: "group",
 guide: { en: "{pn} [message]" }
 },

 onStart: async function ({ api, event, args, message }) {
 const { participantIDs } = event;
 const mentions = [];
 let body = args.join(" ") || "All";

 let i = 0;
 for (const uid of participantIDs) {
 const name = body[i] || " ";
 mentions.push({ tag: name, id: uid });
 i++;
 if(i >= body.length) i = 0;
 }

 api.setMessageReaction("📢", event.messageID, () => {}, true);
 return message.reply({ body, mentions });
 }
};