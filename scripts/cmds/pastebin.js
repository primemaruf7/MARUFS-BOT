const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["bin"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 0,
    shortDescription: "Upload command code",
    category: "tool",
    guide: "{pn} <commandName>"
  },

  onStart: async function ({ api, event, args }) {
    const name = args[0];

    if (!name) {
      return api.sendMessage(
        "➜ Please provide a command name.",
        event.threadID,
        event.messageID
      );
    }

    const file = path.join(__dirname, `${name}.js`);

    if (!fs.existsSync(file)) {
      return api.sendMessage(
        `➜ Command "${name}.js" not found.`,
        event.threadID,
        event.messageID
      );
    }

    try {
      const code = fs.readFileSync(file, "utf8");

      const { data } = await axios.post(
        "https://pastebin-xyz.vercel.app/api/paste",
        {
          content: code,
          title: `${name}.js`
        }
      );

      if (!data?.success || !data?.raw) {
        return api.sendMessage(
          "➜ Failed to upload code.",
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        `╭─❖ 𝐏𝐚𝐬𝐭𝐞𝐛𝐢𝐧
│
├─➤ 📁 𝐅𝐢𝐥𝐞 : ${name}.js
├─➤ 🔗 𝐋𝐢𝐧𝐤 : ${data.raw}
│
╰─❖ 𝐌𝐚𝐫𝐮𝐟'𝐬 𝐁𝐨𝐭`,
        event.threadID,
        event.messageID
      );

    } catch (error) {
      return api.sendMessage(
        "➜ Failed to connect to Pastebin API.",
        event.threadID,
        event.messageID
      );
    }
  }
};