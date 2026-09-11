const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_URL = "https://mohammad-maruf.vercel.app";

module.exports = function remoteCommand(commandName) {
  return {
    onStart: async function (context) {
      const {
        api,
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
            timeout: 60000
          }
        );

        const data = response.data;

        if (!data || data.status !== "success") {
          console.error(
            `[Command:${commandName}]`,
            data?.message || "Unknown error"
          );

          return message.reply(
            "❌ এই Command-টি এখন কাজ করছে না।\n\n» একটু পরে আবার চেষ্টা করো। 😿"
          );
        }

        if (
          data.type === "image" &&
          data.image
        ) {
          const cacheDir = path.join(
            __dirname,
            "../cache"
          );

          await fs.ensureDir(cacheDir);

          let extension = "png";

          if (data.mimeType === "image/jpeg") {
            extension = "jpg";
          } else if (
            data.mimeType === "image/webp"
          ) {
            extension = "webp";
          }

          const filePath = path.join(
            cacheDir,
            `remote_${commandName}_${Date.now()}.${extension}`
          );

          const imageBuffer = Buffer.from(
            data.image,
            "base64"
          );

          await fs.writeFile(
            filePath,
            imageBuffer
          );

          return api.sendMessage(
            {
              body: data.message || "",
              attachment: fs.createReadStream(
                filePath
              )
            },
            event.threadID,
            () => {
              fs.remove(filePath).catch(() => {});
            },
            event.messageID
          );
        }

        return message.reply(
          data.message || "✅ Done."
        );
      } catch (error) {
        console.error(
          `[Command:${commandName}]`,
          error
        );

        if (
          error.code === "ECONNABORTED" ||
          error.code === "ETIMEDOUT"
        ) {
          return message.reply(
            "⏳ Command-টি উত্তর দিতে দেরি করছে।\n\n» একটু পরে আবার চেষ্টা করো। 😿"
          );
        }

        if (error.response) {
          console.error(
            `[Command:${commandName}] HTTP ${error.response.status}`,
            error.response.data
          );
        }

        return message.reply(
          "❌ এই Command-টি বর্তমানে ব্যবহার করা যাচ্ছে না।\n\n» কিছুক্ষণ পরে আবার চেষ্টা করো। 😿"
        );
      }
    }
  };
};