const remoteCommand = require("../../utils/remoteCommand");

module.exports = {
  config: {
    name: "runtime",
    aliases: ["rtm"],
    version: "2.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 0,
    role: 0,

    description: {
      en: "Show bot runtime."
    },

    category: "system",

    guide: {
      en: "{pn}"
    }
  },

  onStart: remoteCommand("runtime").onStart
};