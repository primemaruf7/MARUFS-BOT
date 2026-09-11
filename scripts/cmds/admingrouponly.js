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

      if (!config.adminGroupOnly) {
        config.adminGroupOnly = {
          enable: false,
          groupIDs: []
        };
      }

      if (!Array.isArray(config.adminGroupOnly.groupIDs)) {
        config.adminGroupOnly.groupIDs = [];
      }

      const action = args[0]?.toLowerCase();

      if (!action || !["on", "off"].includes(action)) {
        const status =
          config.adminGroupOnly.enable === true
            ? "ON"
            : "OFF";

        return message.reply(
          `Admin Group Only: ${status}\n\nUse: adg on/off`
        );
      }

      const enable = action === "on";

      config.adminGroupOnly.enable = enable;

      await fs.writeJson(
        configPath,
        config,
        { spaces: 2 }
      );

      if (global.GoatBot?.config) {
        global.GoatBot.config.adminGroupOnly = {
          enable: config.adminGroupOnly.enable,
          groupIDs: [...config.adminGroupOnly.groupIDs]
        };
      }

      return message.reply(
        enable
          ? "✅ Admin Group Only is now ON."
          : "✅ Admin Group Only is now OFF."
      );
    }
    catch (error) {
      console.error("[ADMIN-GROUP-ONLY]", error);

      return message.reply(
        `❌ Failed to update settings.\n${error.message || error}`
      );
    }
  }
};