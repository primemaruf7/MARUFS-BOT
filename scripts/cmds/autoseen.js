const fs = require("fs-extra");
const path = __dirname + "/cache/autoseen.json";

// Default ON
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify({ status: true }, null, 2));
}

module.exports = {
  config: {
    name: "autoseen",
    version: "3.1.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    role: 0,
    countDown: 0,
    category: "system",
    shortDescription: "Auto Seen",
    longDescription: "Auto seen on/off korbe"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const data = JSON.parse(fs.readFileSync(path));

    if (args[0] === "on") {
      data.status = true;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("✅ 𝐀𝐮𝐭𝐨𝐒𝐞𝐞𝐧 : 𝐎𝐍", threadID, messageID);
    }
    else if (args[0] === "off") {
      data.status = false;
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return api.sendMessage("❌ 𝐀𝐮𝐭𝐨𝐒𝐞𝐧 : 𝐎𝐅𝐅", threadID, messageID);
    }
    else {
      return api.sendMessage("⚠️ 𝐔𝐬𝐞 : autoseen on / off", threadID, messageID);
    }
  },

  onChat: async function ({ api, event }) {
    try {
      const data = JSON.parse(fs.readFileSync(path));
      if (data.status === true) {
        api.markAsReadAll();
      }
    } catch (e) {}
  },
};