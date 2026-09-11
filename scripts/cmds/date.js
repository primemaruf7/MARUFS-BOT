module.exports = {
 config: {
  name: "date",
  aliases: ["dt"],
  version: "4.0.1",
  author: "𝐌𝐚𝐑𝐮𝐅",
  description: "Shows the current date (English + Bangla)",
  category: "system"
 },

 onStart: async function ({ message }) {
  const now = new Date();

  const dateEn = now.toLocaleDateString("en-US", {
   timeZone: "Asia/Dhaka",
   weekday: "long",
   year: "numeric",
   month: "long",
   day: "numeric"
  });

  const dateBn = now.toLocaleDateString("bn-BD", {
   timeZone: "Asia/Dhaka",
   weekday: "long",
   year: "numeric",
   month: "long",
   day: "numeric"
  });

  const reply = `📅  চলতি তারিখ (English): ${dateEn}\n🗓️  চলতি তারিখ (বাংলা): ${dateBn}\n\n✨  Maruf's Bot | Powered by Prime Maruf`;

  return message.reply(reply);
 }
};
