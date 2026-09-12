"use strict";

const { getStreamsFromAttachment } = global.utils;

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 2,
    description: {
      en: "Send notification from admin to all groups"
    },
    category: "owner",
    guide: {
      en: "{pn} <message>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingMessage:
        "❌ Please enter the message you want to send to all groups.",

      sendingNotification:
        "📡 Sending notification to %1 groups...\n" +
        "⏳ Please wait...",

      sentNotification:
        "╭━━━━━━━━━━━━━━━━━━━━╮\n" +
        "      📊 NOTIFICATION REPORT\n" +
        "╰━━━━━━━━━━━━━━━━━━━━╯\n\n" +
        "✅ Successfully sent : %1 groups",

      errorSendingNotification:
        "❌ Failed : %1 groups\n%2"
    }
  },

  onStart: async function ({
    message,
    api,
    event,
    args,
    commandName,
    envCommands,
    threadsData,
    usersData,
    getLang
  }) {
    // Safely handle missing command config
    const commandConfig =
      envCommands?.[commandName] || {};

    const delayPerGroup =
      Number.isFinite(Number(commandConfig.delayPerGroup))
        ? Number(commandConfig.delayPerGroup)
        : 250;

    if (!args?.[0])
      return message.reply(getLang("missingMessage"));

    const senderID = event.senderID;

    const senderName =
      (await usersData.get(senderID, "name")) || "Admin";

    // Safely handle missing attachment arrays
    const eventAttachments = Array.isArray(event.attachments)
      ? event.attachments
      : [];

    const replyAttachments = Array.isArray(
      event.messageReply?.attachments
    )
      ? event.messageReply.attachments
      : [];

    const attachments = [
      ...eventAttachments,
      ...replyAttachments
    ].filter(
      item =>
        item &&
        ["photo", "png", "animated_image", "video", "audio"].includes(
          item.type
        )
    );

    let attachmentStreams = [];

    if (attachments.length > 0) {
      try {
        attachmentStreams =
          await getStreamsFromAttachment(attachments);
      } catch (error) {
        console.error("Attachment error:", error);
        attachmentStreams = [];
      }
    }

    const msgText = args.join(" ");

    const body =
      `╭━━━━━━━━━━━━━━━━━━━━╮\n` +
      `      📢 ADMIN NOTIFICATION\n` +
      `╰━━━━━━━━━━━━━━━━━━━━╯\n\n` +
      `💬 ${msgText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 ${senderName}`;

    const formSend = {
      body,
      mentions: [
        {
          tag: senderName,
          id: senderID
        }
      ]
    };

    if (
      Array.isArray(attachmentStreams) &&
      attachmentStreams.length > 0
    ) {
      formSend.attachment = attachmentStreams;
    }

    const botID = api.getCurrentUserID();

    const allThreads = await threadsData.getAll();

    const allThreadID = (Array.isArray(allThreads)
      ? allThreads
      : []
    ).filter(
      t =>
        t?.isGroup &&
        Array.isArray(t.members) &&
        t.members.some(
          m =>
            m?.userID == botID &&
            m?.inGroup
        )
    );

    message.reply(
      getLang(
        "sendingNotification",
        allThreadID.length
      )
    );

    let sendSucces = 0;
    const sendError = [];
    const wattingSend = [];

    for (const thread of allThreadID) {
      const tid = thread.threadID;

      try {
        wattingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });

        await new Promise(resolve =>
          setTimeout(resolve, delayPerGroup)
        );
      } catch (e) {
        sendError.push({
          threadIDs: [tid],
          errorDescription:
            e?.error ||
            e?.message ||
            String(e)
        });
      }
    }

    for (const sended of wattingSend) {
      try {
        await sended.pending;
        sendSucces++;
      } catch (e) {
        const errorDescription =
          e?.error ||
          e?.message ||
          String(e);

        const existingError = sendError.find(
          item =>
            item.errorDescription ===
            errorDescription
        );

        if (existingError) {
          existingError.threadIDs.push(
            sended.threadID
          );
        } else {
          sendError.push({
            threadIDs: [sended.threadID],
            errorDescription
          });
        }
      }
    }

    let msg = "";

    if (sendSucces > 0) {
      msg +=
        getLang(
          "sentNotification",
          sendSucces
        ) + "\n";
    }

    if (sendError.length > 0) {
      msg += getLang(
        "errorSendingNotification",
        sendError.reduce(
          (a, b) =>
            a + b.threadIDs.length,
          0
        ),
        sendError.reduce(
          (a, b) =>
            a +
            `\n • ${b.errorDescription}\n` +
            `   └ ${b.threadIDs.join(", ")}`,
          ""
        )
      );
    }

    if (msg)
      message.reply(msg);
  }
};