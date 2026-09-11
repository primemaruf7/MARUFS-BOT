const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const API_URL = "https://mohammad-maruf.onrender.com";

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
          return message.reply(
            data?.message || "❌ command failed."
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

          const extension =
            data.mimeType === "image/jpeg"
              ? "jpg"
              : data.mimeType === "image/webp"
              ? "webp"
              : "png";

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
          `[RemoteCommand:${commandName}]`,
          error.message
        );

        return message.reply(
          "❌ command is currently unavailable."
        );
      }
    }
  };
};