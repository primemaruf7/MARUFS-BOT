const remoteCommand = require("../../remoteCommand");

const API_URL = "https://mohammad-maruf.vercel.app";

module.exports = {
  config: {
    name: "fork",
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 0,
    role: 0,

    shortDescription: "Fork Link",
    longDescription: "Responds when fork or repository is mentioned.",
    category: "config",

    guide: {
      en: "Type 'fork' or 'repository'"
    }
  },

  onStart: remoteCommand(
    API_URL,
    "fork"
  ).onStart,

  onChat: remoteCommand(
    API_URL,
    "fork"
  ).onChat
};