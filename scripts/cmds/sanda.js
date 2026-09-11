const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "sanda",
    version: "1.0.0",
    author: "Mohammad Maruf",
    countDown: 5,
    role: 0,
    shortDescription: "Make someone an official Sanda 😂",
    category: "Fun",
    guide: {
      en: "{pn} @mention or reply"
    }
  },

  onStart: async function ({ event, message, api }) {
    let targetID;

    // Mention
    if (event.mentions && Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    // Reply
    if (event.type === "message_reply" && event.messageReply) {
      targetID = event.messageReply.senderID;
    }

    if (!targetID) {
      return message.reply(
        "😂 কাকে Sanda বানাবি?\n\n👉 কাউকে Tag কর অথবা তার message-এ Reply দে!"
      );
    }

    if (targetID === event.senderID) {
      return message.reply(
        "🪞 নিজের মাথার উপর নিজের ছবিই বসাবি নাকি? 😂\n\nনিজেকে Sanda বানানো নিষেধ!"
      );
    }

    const folder = path.join(__dirname, "NAFIJ");

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    const outputPath = path.join(
      folder,
      `sanda_${targetID}_${Date.now()}.png`
    );

    try {
      // ==========================================
      // SANDA IMAGE
      // ==========================================

      const sandaURL =
        "https://raw.githubusercontent.com/alkama844/res/refs/heads/main/image/sanda.jpg";

      // ==========================================
      // FACEBOOK PROFILE PICTURE
      // ==========================================

      const avatarURL =
        `https://graph.facebook.com/${targetID}/picture` +
        `?width=512&height=512` +
        `&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const [sandaBuffer, avatarBuffer] = await Promise.all([
        axios
          .get(sandaURL, {
            responseType: "arraybuffer"
          })
          .then(res => res.data),

        axios
          .get(avatarURL, {
            responseType: "arraybuffer"
          })
          .then(res => res.data)
      ]);

      const sanda = await loadImage(sandaBuffer);
      const avatar = await loadImage(avatarBuffer);

      // ==========================================
      // CANVAS
      // ==========================================

      const canvas = createCanvas(800, 1000);
      const ctx = canvas.getContext("2d");

      // ==========================================
      // BACKGROUND
      // ==========================================

      const bg = ctx.createLinearGradient(0, 0, 0, 1000);

      bg.addColorStop(0, "#160000");
      bg.addColorStop(0.5, "#4a0000");
      bg.addColorStop(1, "#080808");

      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, 800, 1000);

      // Red glow
      ctx.save();

      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#ff0000";

      ctx.beginPath();
      ctx.arc(400, 440, 360, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // ==========================================
      // HEADER
      // ==========================================

      ctx.textAlign = "center";

      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 32px Arial";
      ctx.fillText("⚠️ OFFICIAL SANDA ALERT ⚠️", 400, 65);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 62px Arial";
      ctx.fillText("SANDA", 400, 135);

      ctx.fillStyle = "#ff3333";
      ctx.font = "bold 28px Arial";
      ctx.fillText("THE MOST WANTED SANDA 😂", 400, 175);

      // ==========================================
      // SANDA IMAGE
      // ==========================================

      /*
       * Sanda image is placed in the center.
       * Profile picture will be placed above
       * Sanda's head.
       */

      const imageX = 100;
      const imageY = 210;
      const imageW = 600;
      const imageH = 560;

      // Image shadow
      ctx.save();

      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 35;

      ctx.drawImage(
        sanda,
        imageX,
        imageY,
        imageW,
        imageH
      );

      ctx.restore();

      // ==========================================
      // PROFILE PICTURE ON SANDA'S HEAD
      // ==========================================

      const profileSize = 170;

      // Change these 2 values if you want
      // to move the profile picture.
      const profileX = 315;
      const profileY = 235;

      // Outer red circle
      ctx.save();

      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 25;

      ctx.beginPath();

      ctx.arc(
        profileX + profileSize / 2,
        profileY + profileSize / 2,
        profileSize / 2 + 10,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#ff3030";
      ctx.fill();

      ctx.restore();

      // Black border
      ctx.beginPath();

      ctx.arc(
        profileX + profileSize / 2,
        profileY + profileSize / 2,
        profileSize / 2 + 3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#000000";
      ctx.fill();

      // Circular profile
      ctx.save();

      ctx.beginPath();

      ctx.arc(
        profileX + profileSize / 2,
        profileY + profileSize / 2,
        profileSize / 2,
        0,
        Math.PI * 2
      );

      ctx.clip();

      ctx.drawImage(
        avatar,
        profileX,
        profileY,
        profileSize,
        profileSize
      );

      ctx.restore();

      // ==========================================
      // "THAT'S YOU" ARROW
      // ==========================================

      ctx.strokeStyle = "#ffcc00";
      ctx.fillStyle = "#ffcc00";
      ctx.lineWidth = 6;

      ctx.beginPath();
      ctx.moveTo(180, 225);
      ctx.lineTo(295, 285);
      ctx.stroke();

      // Arrow head
      ctx.beginPath();
      ctx.moveTo(295, 285);
      ctx.lineTo(270, 270);
      ctx.lineTo(278, 300);
      ctx.closePath();
      ctx.fill();

      ctx.textAlign = "left";

      ctx.font = "bold 22px Arial";
      ctx.fillText("THAT'S YOU 😂", 80, 210);

      // ==========================================
      // SANDA STAMP
      // ==========================================

      ctx.save();

      ctx.translate(610, 690);
      ctx.rotate(-0.12);

      ctx.strokeStyle = "#ff3030";
      ctx.lineWidth = 8;

      ctx.strokeRect(-110, -48, 220, 96);

      ctx.fillStyle = "#ff3030";
      ctx.textAlign = "center";
      ctx.font = "bold 30px Arial";

      ctx.fillText("CERTIFIED", 0, -5);
      ctx.fillText("SANDA 😂", 0, 32);

      ctx.restore();

      // ==========================================
      // FUNNY INFORMATION
      // ==========================================

      ctx.textAlign = "center";

      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 26px Arial";

      ctx.fillText(
        "🚨 SANDALIST DETECTED 🚨",
        400,
        825
      );

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 21px Arial";

      ctx.fillText(
        "Common Sense: ❌ NOT FOUND",
        400,
        870
      );

      ctx.fillText(
        "Sanda Power: ██████████ 100%",
        400,
        910
      );

      ctx.fillText(
        "Escape Chance: 0.01% 😂",
        400,
        950
      );

      // ==========================================
      // BORDER
      // ==========================================

      ctx.strokeStyle = "#ff3030";
      ctx.lineWidth = 7;

      ctx.strokeRect(
        18,
        18,
        764,
        964
      );

      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 2;

      ctx.strokeRect(
        32,
        32,
        736,
        936
      );

      // ==========================================
      // SAVE IMAGE
      // ==========================================

      const buffer = canvas.toBuffer("image/png");

      fs.writeFileSync(outputPath, buffer);

      // ==========================================
      // USER NAME
      // ==========================================

      const userInfo = await api.getUserInfo(targetID);

      const name =
        userInfo[targetID]?.name || "Unknown Sanda";

      // ==========================================
      // SEND
      // ==========================================

      return message.reply(
        {
          body:
            `🚨 SANDA DETECTED 🚨\n\n` +
            `👤 Subject: ${name}\n` +
            `🦥 Status: Official Sanda\n` +
            `💀 Sanda Power: 100%\n\n` +
            `😂 পালানোর আর কোনো উপায় নেই!`,

          attachment: fs.createReadStream(outputPath)
        },

        () => {
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (e) {
            console.error("Cleanup Error:", e);
          }
        }
      );

    } catch (err) {
      console.error("Sanda Error:", err);

      return message.reply(
        "❌ Sanda image বানাতে সমস্যা হয়েছে! 😂\n\nআবার try করো।"
      );
    }
  }
};