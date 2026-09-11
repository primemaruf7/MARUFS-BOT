const remoteCommand = require("../../remoteCommand");

const API_URL = "https://mohammad-maruf.vercel.app";

module.exports = {
 config: {
 name: "up",
 aliases: ["uptime"],
 version: "1.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 0,
 role: 0,

 shortDescription: "Show bot uptime",
 longDescription: "Show bot uptime and system information.",
 category: "system",

 guide: {
 en: "{pn}"
 }
 },

 onStart: remoteCommand(
 API_URL,
 "up"
 ).onStart
};