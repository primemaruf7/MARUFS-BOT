const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "owner",
    version: "1.0.0",
    author: "Mohammad Maruf",
    role: 0,
    shortDescription: "Owner information with image",
    category: "Information",
    guide: {
      en: "owner"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerText = 
`╭━━━━ 👑 Oᴡɴᴇʀ Iɴғᴏ ━━━━╮

 🏷 Nᴀᴍᴇ
    └─ Mᴏʜᴀᴍᴍᴀᴅ Mᴀʀᴜғ 👑
 🎀 Nɪᴄᴋ
    └─ Mᴀʀᴜғ 🎀
 🎂 Aɢᴇ
    └─ 𝟷𝟼+ 😘
 💞 Rᴇʟᴀᴛɪᴏɴ
    └─ Sɪɴɢʟᴇ 🫶
 💼 Wᴏʀᴋ
    └─ Sᴛᴜᴅᴇɴᴛ 😎
 🎓 Eᴅᴜᴄᴀᴛɪᴏɴ
    └─ Sᴇᴄʀᴇᴛ 🤫
 📍 Lᴏᴄᴀᴛɪᴏɴ
    └─ Kᴜʀɪɢʀᴀᴍ, Kᴀᴄᴀᴋᴀᴛᴀ

╰━━━━━ 🔗 Cᴏɴᴛᴀᴄᴛ ━━━━━━╯

 📘 Fʙ  ➜ fb.com/itzmaruf1718
 💬 Tɢ  ➜ t.me/maruf_1718
 📞 Wᴀ  ➜ wa.me/maruf_1718`;

    const cacheDir = path.join(__dirname, "cache");
    const imgPath = path.join(cacheDir, "owner.jpg");
    const imgLink = "https://i.ibb.co/4ZJpvd8v/1c7596023722.jpg";

    try {
      await fs.ensureDir(cacheDir);

      const response = await axios.get(imgLink, {
        responseType: "arraybuffer"
      });

      await fs.writeFile(imgPath, response.data);

      api.sendMessage(
        {
          body: ownerText,
          attachment: fs.createReadStream(imgPath)
        },
        event.threadID,
        () => {
          if (fs.existsSync(imgPath)) {
            fs.unlinkSync(imgPath);
          }
        },
        event.messageID
      );
    } catch (e) {}
  }
};