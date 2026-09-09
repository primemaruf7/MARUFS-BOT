module.exports = {
 config: {
 name: "time",
 aliases: ["tm"],
 version: "4.0.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 description: "Shows the current time",
 category: "system"
 },

 onStart: async function ({ message }) {
 const now = new Date();

 const time = now.toLocaleTimeString("en-US", {
 timeZone: "Asia/Dhaka",
 hour: "2-digit",
 minute: "2-digit",
 hour12: true
 });

 return message.reply(`⏰ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭 𝐭𝐢𝐦𝐞 » ${time} » 💫🪽`);
 }
};