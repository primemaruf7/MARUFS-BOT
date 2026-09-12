const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "filecmd",
    aliases: ["file"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 2,
    shortDescription: "𝐕𝐢𝐞𝐰 𝐜𝐨𝐝𝐞 𝐨𝐟 𝐚 𝐜𝐨𝐦𝐦𝐚𝐧𝐝",
    longDescription: "𝐕𝐢𝐞𝐰 𝐭𝐡𝐞 𝐫𝐚𝐰 𝐬𝐨𝐮𝐫𝐜𝐞 𝐜𝐨𝐝𝐞 𝐨𝐟 𝐚𝐧𝐲 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐢𝐧 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝𝐬 𝐟𝐨𝐥𝐝𝐞𝐫",
    category: "tool",
    guide: "{pn} <commandName>"
  },

  onStart: async function ({ args, message }) {
    const cmdName = args[0];
    if (!cmdName) return message.reply(
      "❌ | 𝐏𝐥𝐞𝐚𝐬𝐞 𝐩𝐫𝐨𝐯𝐢𝐝𝐞 𝐭𝐡𝐞 𝐜𝐨𝐦𝐦𝐚𝐧𝐝 𝐧𝐚𝐦𝐞.\n" +
      "𝐄𝐱𝐚𝐦𝐩𝐥𝐞: 𝐟𝐢𝐥𝐞𝐜𝐦𝐝 𝐟𝐥𝐮𝐱𝐬𝐧𝐞𝐥𝐥"
    );

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath)) return message.reply(
      `❌ | 𝐂𝐨𝐦𝐦𝐚𝐧𝐝 "${cmdName}" 𝐧𝐨𝐭 𝐟𝐨𝐮𝐧𝐝 𝐢𝐧 𝐭𝐡𝐢𝐬 𝐟𝐨𝐥𝐝𝐞𝐫.`
    );

    try {
      const code = fs.readFileSync(cmdPath, "utf8");

      if (code.length > 19000) {
        return message.reply(
          "⚠️ | 𝐓𝐡𝐢𝐬 𝐟𝐢𝐥𝐞 𝐢𝐬 𝐭𝐨𝐨 𝐥𝐚𝐫𝐠𝐞 𝐭𝐨 𝐝𝐢𝐬𝐩𝐥𝐚𝐲."
        );
      }

      return message.reply({
        body: `📄 | 𝐒𝐨𝐮𝐫𝐜𝐞 𝐜𝐨𝐝𝐞 𝐨𝐟 "${cmdName}.js":\n\n${code}`
      });
    } catch (err) {
      console.error(err);
      return message.reply(
        "❌ | 𝐄𝐫𝐫𝐨𝐫 𝐫𝐞𝐚𝐝𝐢𝐧𝐠 𝐭𝐡𝐞 𝐟𝐢𝐥𝐞."
      );
    }
  }
};