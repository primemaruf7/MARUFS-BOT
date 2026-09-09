module.exports = {
  config: {
    name: "activemember",
    aliases: ["am"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 0,
    shortDescription: "Show top active members",
    longDescription: "Show the top 15 active members by message count",
    category: "box chat",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;

    try {
      const threadInfo = await api.getThreadInfo(threadID, {
        participantIDs: true
      });

      const messageCounts = {};

      for (const id of threadInfo.participantIDs) {
        messageCounts[id] = 0;
      }

      const messages = await api.getThreadHistory(threadID, 1000);

      for (const message of messages) {
        if (messageCounts[message.senderID] !== undefined) {
          messageCounts[message.senderID]++;
        }
      }

      const topUsers = Object.entries(messageCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      let result = `╭─❖ 𝐀𝐜𝐭𝐢𝐯𝐞 𝐌𝐞𝐦𝐛𝐞𝐫𝐬
│
`;

      const mentions = [];

      for (let i = 0; i < topUsers.length; i++) {
        const [userID, count] = topUsers[i];

        try {
          const userInfo = await api.getUserInfo(userID);
          const name = userInfo[userID]?.name || "Unknown User";

          result += `├─➤ ${i + 1}. ${name}\n`;
          result += `│   └─ 💬 ${count} messages\n`;

          mentions.push({
            tag: name,
            id: userID,
            type: "user"
          });

          if (i < topUsers.length - 1) {
            result += `│\n`;
          }
        } catch {
          result += `├─➤ ${i + 1}. Unknown User\n`;
          result += `│   └─ 💬 ${count} messages\n│\n`;
        }
      }

      result += `╰─❖ 𝐌𝐚𝐫𝐮𝐟'𝐬 𝐁𝐨𝐭`;

      return api.sendMessage(
        {
          body: result,
          mentions
        },
        threadID
      );

    } catch (error) {
      console.error(error);

      return api.sendMessage(
        "➜ Failed to get active member list.",
        threadID,
        event.messageID
      );
    }
  }
};