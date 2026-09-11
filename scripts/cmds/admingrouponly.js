const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "admingrouponly",
    aliases: ["adg"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    role: 2,
    description: {
      en: "Turn Admin Group Only mode on or off."
    },
    category: "admin",
    guide: {
      en: "{pn} on/off"
    }
  },

  onStart: async function ({ args, message }) {
    try {
      const configPath = path.join(process.cwd(), "config.json");
      const config = await fs.readJson(configPath);

      if (!args[0] || !["on", "off"].includes(args[0].toLowerCase())) {
        const status = config.adminGroupOnly?.enable === true ? "ON" : "OFF";
        return message.reply(`Admin Group Only: ${status}\nUse: adg on/off`);
      }

      const status = args[0].toLowerCase() === "on";

      if (!config.adminGroupOnly) {
        config.adminGroupOnly = {
          enable: false,
          groupIDs: []
        };
      }

      config.adminGroupOnly.enable = status;

      await fs.writeJson(configPath, config, { spaces: 2 });

      return message.reply(
        status
          ? "Admin Group Only is now ON."
          : "Admin Group Only is now OFF."
      );
    } catch (error) {
      console.error("[ADMIN-GROUP-ONLY]", error);
      return message.reply("Failed to update config.");
    }
  }
};