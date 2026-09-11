const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = function remoteCommand(apiUrl, commandName) {
  return {
    onStart: async function (context) {
      const {
        api,
        event,
        args,
        message
      } = context;

      try {
        if (!apiUrl) {
          return message.reply(
            "❌ Command configuration পাওয়া যায়নি।"
          );
        }

        const baseUrl = apiUrl.replace(/\/+$/, "");

        const response = await axios.post(
          `${baseUrl}/commands/${encodeURIComponent(commandName)}`,
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

        if (data.type === "image" && data.image) {
          const cacheDir = path.join(
            __dirname,
            "cache"
          );

          await fs.ensureDir(cacheDir);

          let extension = "png";

          if (data.mimeType === "image/jpeg") {
            extension = "jpg";
          } else if (data.mimeType === "image/webp") {
            extension = "webp";
          }

          const filePath = path.join(
            cacheDir,
            `cmd_${commandName}_${Date.now()}.${extension}`
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

        return message.reply(
          "❌ এই Command-টি বর্তমানে ব্যবহার করা যাচ্ছে না।\n\n» কিছুক্ষণ পরে আবার চেষ্টা করো। 😿"
        );
      }
    }
  };
};