const axios = require("axios");

module.exports = {
 config: {
 name: "setavt",
 aliases: ["changeavt", "setavatar", "avt"],
 version: "1.4",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 5,
 role: 2,
 description: { en: "Change bot avatar" },
 category: "owner",
 guide: {
 en: "{pn} [image url | reply image] [caption]\nEx: {pn} https://example.com/img.jpg Hello\nReply to image: {pn}"
 }
 },

 langs: {
 en: {
 cannotGetImage: "❌ | Error while getting image url",
 invalidImageFormat: "❌ | Invalid image format",
 changedAvatar: "✅ | Changed bot avatar successfully"
 },
 bn: {
 cannotGetImage: "❌ | ছবির লিংক থেকে ছবি আনতে সমস্যা হয়েছে",
 invalidImageFormat: "❌ | ছবির ফরম্যাট সঠিক না",
 changedAvatar: "✅ | বটের প্রোফাইল পিক চেঞ্জ হয়ে গেছে"
 }
 },

 onStart: async function ({ message, event, api, args, getLang }) {
 const imageURL = (args[0] || "").startsWith("http")? args.shift() : event.attachments[0]?.url || event.messageReply?.attachments[0]?.url;
 const expirationAfter =!isNaN(args[args.length - 1])? args.pop() : null;
 const caption = args.join(" ");

 if (!imageURL) return message.SyntaxError();

 let response;
 try {
 response = await axios.get(imageURL, { responseType: "stream" });
 } catch (err) {
 return message.reply(getLang("cannotGetImage"));
 }

 if (!response.headers["content-type"]?.includes("image"))
 return message.reply(getLang("invalidImageFormat"));

 response.data.path = "avatar.jpg";

 api.changeAvatar(response.data, caption, expirationAfter? expirationAfter * 1000 : null, (err) => {
 if (err) return message.err(err);
 return message.reply(getLang("changedAvatar"));
 });
 }
};