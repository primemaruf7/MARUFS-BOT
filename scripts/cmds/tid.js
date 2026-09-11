module.exports = {
  config: {
    name: "tid",
    aliases: ["groupid"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    role: 0,
    description: {
      en: "Show the current group ID and group name."
    },
    category: "info",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event, threadsData, message }) {
    try {
      const threadID = event.threadID;

      if (!event.isGroup) {
        return message.reply("❌ এই command টি শুধু Group Chat-এ ব্যবহার করা যাবে।");
      }

      let threadName = "Unknown Group";

      try {
        const threadInfo = await threadsData.get(threadID);
        if (threadInfo?.threadName) {
          threadName = threadInfo.threadName;
        }
      } catch (e) {
        try {
          const info = await api.getThreadInfo(threadID);
          if (info?.threadName) {
            threadName = info.threadName;
          }
        } catch (e2) {}
      }

      return message.reply(
        `╭───────────────╮
   🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨
╰───────────────╯

📌 𝐍𝐚𝐦𝐞 » ${threadName}
🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃 » ${threadID}

╰───────────────╯`
      );
    } catch (error) {
      console.error("[TID]", error);
      return message.reply(
        `❌ Group ID বের করতে সমস্যা হয়েছে.\n\n🆔 𝐆𝐫𝐨𝐮𝐩 𝐈𝐃 » ${event.threadID}`
      );
    }
  }
};