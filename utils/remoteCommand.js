const axios = require("axios");

const API_URL = "https://mohammad-maruf.onrender.com";

module.exports = function remoteCommand(commandName) {
  return {
    onStart: async function (context) {
      const {
        event,
        args,
        message
      } = context;

      try {
        const response = await axios.post(
          `${API_URL}/commands/${encodeURIComponent(commandName)}`,
          {
            args: Array.isArray(args) ? args : [],

            event: {
              type: event?.type,
              senderID: event?.senderID,
              threadID: event?.threadID,
              messageID: event?.messageID,

              messageReply: event?.messageReply
                ? {
                    senderID: event.messageReply.senderID,
                    body: event.messageReply.body
                  }
                : null,

              mentions: event?.mentions || {}
            },

            input: {
              uptime: process.uptime()
            }
          },
          {
            timeout: 30000
          }
        );

        const data = response.data;

        if (!data || data.status !== "success") {
          return message.reply(
            data?.message || "❌ Remote command failed."
          );
        }

        return message.reply(data.message);
      } catch (error) {
        console.error(
          `[RemoteCommand:${commandName}]`,
          error.message
        );

        return message.reply(
          "❌ Remote command service is currently unavailable."
        );
      }
    }
  };
};