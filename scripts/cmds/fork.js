const remoteCommand = require("../../remoteCommand");

const API_URL = "https://mohammad-maruf.vercel.app";

module.exports = {
 config: {
 name: "fork",
 aliases: ["repository"],
 version: "1.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 0,
 role: 0,

 shortDescription: "Fork Link",
 longDescription: "Show fork information.",
 category: "config",

 guide: {
 en: "{pn}"
 }
 },

 onStart: remoteCommand(
 API_URL,
 "fork"
 ).onStart
};