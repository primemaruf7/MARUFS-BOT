"use strict";

module.exports = {
  config: {
    name: "kick",
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 1,
    description: {
      en: "Kick member out of chat box"
    },
    category: "owner",
    guide: {
      en: "   {pn} @tags: use to kick tagged members"
    }
  },

  langs: {
    en: {
      needAdmin:
        "❌ Please make the bot an admin before using this feature."
    }
  },

  onStart: async function ({
    message,
    event,
    args,
    threadsData,
    api,
    getLang
  }) {
    const adminIDs = await threadsData.get(
      event.threadID,
      "adminIDs"
    );

    if (!adminIDs?.includes(api.getCurrentUserID())) {
      return message.reply(
        getLang("needAdmin")
      );
    }

    async function kickAndCheckError(uid) {
      try {
        await api.removeUserFromGroup(
          uid,
          event.threadID
        );
      } catch (e) {
        message.reply(
          getLang("needAdmin")
        );
        return "ERROR";
      }
    }

    if (!args[0]) {
      if (!event.messageReply)
        return message.SyntaxError();

      await kickAndCheckError(
        event.messageReply.senderID
      );
    } else {
      const uids = Object.keys(
        event.mentions || {}
      );

      if (uids.length === 0)
        return message.SyntaxError();

      if (
        await kickAndCheckError(
          uids.shift()
        ) === "ERROR"
      ) {
        return;
      }

      for (const uid of uids) {
        api.removeUserFromGroup(
          uid,
          event.threadID
        );
      }
    }
  }
};