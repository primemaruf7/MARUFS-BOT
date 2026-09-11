const axios = require("axios");

const API_URL = "https://mohammad-maruf.onrender.com";

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

 onStart: async function ({ message }) {
 try {
 const response = await axios.post(
 `${API_URL}/commands/runtime`,
 {
 input: {
 uptime: process.uptime()
 }
 },
 {
 timeout: 15000
 }
 );

 const data = response.data;

 if (!data || data.status !== "success") {
 return message.reply(
 data?.message || "❌ Failed to get bot runtime."
 );
 }

 return message.reply(data.message);
 } catch (error) {
 console.error("Runtime API Error:", error.message);

 return message.reply(
 "❌ Runtime service is currently unavailable."
 );
 }
 }
};