const { findUid } = global.utils;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "adduser",
    aliases: ["add"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 0,
    description: {
      en: "Add users to the current group."
    },
    category: "box chat",
    guide: {
      en: "{pn} <uid>\n{pn} <uid1> <uid2>\nReply to a user's message and use {pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const threadID = String(event.threadID);
    const messageID = event.messageID;

    const react = emoji => {
      return new Promise(resolve => {
        try {
          api.setMessageReaction(
            emoji,
            messageID,
            () => resolve(),
            true
          );
        } catch {
          resolve();
        }
      });
    };

    const addUser = uid => {
      return new Promise((resolve, reject) => {
        try {
          api.addUserToGroup(String(uid), threadID, err => {
            if (err) return reject(err);
            resolve();
          });
        } catch (err) {
          reject(err);
        }
      });
    };

    let uids = [];

    if (event.messageReply?.senderID) {
      uids.push(String(event.messageReply.senderID));
    }

    if (Array.isArray(event.args)) {
      for (const arg of event.args) {
        const value = String(arg).trim();

        if (/^\d+$/.test(value)) {
          uids.push(value);
        } else if (
          /(facebook\.com|fb\.com|m\.facebook\.com)/i.test(value)
        ) {
          try {
            const uid = await findUid(value);
            if (uid) uids.push(String(uid));
          } catch {}
        }
      }
    }

    uids = [...new Set(uids)];

    if (!uids.length) {
      return react("❌");
    }

    await react("⏳");
    await sleep(300);

    let members = [];

    try {
      const threadData = global.db?.allThreadData?.find(
        t => String(t.threadID) === threadID
      );

      if (Array.isArray(threadData?.members)) {
        members = threadData.members;
      }
    } catch {}

    const success = [];
    const failed = [];
    const already = [];

    for (const uid of uids) {
      const member = members.find(
        m => String(m.userID ?? m.id ?? "") === uid
      );

      if (
        member &&
        (member.inGroup === true || member.isMember === true)
      ) {
        already.push(uid);
        continue;
      }

      try {
        await addUser(uid);
        success.push(uid);
      } catch {
        failed.push(uid);
      }

      await sleep(700);
    }

    if (success.length && !failed.length) {
      await react("✅");
    } else if (success.length && failed.length) {
      await react("⚠️");
    } else if (!success.length && already.length && !failed.length) {
      await react("⚠️");
    } else {
      await react("❌");
    }
  }
};