const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "sanda2",
    version: "1.0.0",
    author: "Mohammad Maruf",
    countDown: 5,
    role: 0,
    shortDescription: "Turn someone into an official Sanda 😂",
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
        "😂 কাকে Sanda বানাবি?\n\n👉 কাউকে tag কর অথবা তার message-এ reply দে!"
      );
    }

    if (targetID === event.senderID) {
      return message.reply(
        "🪞 নিজের নামই Sanda Report-এ দিচ্ছিস? 😂\n\nনিজেকে এতটা অপমান করিস না ভাই!"
      );
    }

    const baseFolder = path.join(__dirname, "NAFIJ");

    if (!fs.existsSync(baseFolder)) {
      fs.mkdirSync(baseFolder, { recursive: true });
    }

    const outputPath = path.join(
      baseFolder,
      `sanda_${targetID}_${Date.now()}.png`
    );

    try {
      const avatarUrl =
        `https://graph.facebook.com/${targetID}/picture` +
        `?width=512&height=512` +
        `&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      const avatarBuffer = await axios
        .get(avatarUrl, {
          responseType: "arraybuffer"
        })
        .then(res => res.data);

      const avatar = await loadImage(avatarBuffer);

      const canvas = createCanvas(800, 1000);
      const ctx = canvas.getContext("2d");

      // =========================
      // BACKGROUND
      // =========================

      const gradient = ctx.createLinearGradient(0, 0, 800, 1000);
      gradient.addColorStop(0, "#120000");
      gradient.addColorStop(0.45, "#310000");
      gradient.addColorStop(1, "#050505");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 1000);

      // Red warning stripes
      ctx.save();
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = "#ff0000";

      for (let i = -1000; i < 1000; i += 80) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 500, 0);
        ctx.lineTo(i - 500, 1000);
        ctx.lineTo(i - 580, 1000);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();

      // Border
      ctx.strokeStyle = "#ff3030";
      ctx.lineWidth = 8;
      ctx.strokeRect(20, 20, 760, 960);

      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, 730, 930);

      // =========================
      // TOP HEADER
      // =========================

      ctx.textAlign = "center";

      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 30px Arial";
      ctx.fillText("⚠  OFFICIAL SANDA DEPARTMENT  ⚠", 400, 80);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 62px Arial";
      ctx.fillText("SANDA", 400, 145);

      ctx.fillStyle = "#ff3030";
      ctx.font = "bold 34px Arial";
      ctx.fillText("DETECTION REPORT", 400, 190);

      // =========================
      // AVATAR MUGSHOT FRAME
      // =========================

      const avatarSize = 300;
      const avatarX = 250;
      const avatarY = 225;

      // Outer glow
      ctx.save();
      ctx.shadowColor = "#ff0000";
      ctx.shadowBlur = 30;

      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 12,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#ff3030";
      ctx.fill();

      ctx.restore();

      // Black frame
      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2 + 3,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = "#050505";
      ctx.fill();

      // Clip avatar
      ctx.save();

      ctx.beginPath();
      ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
      );

      ctx.clip();

      ctx.drawImage(
        avatar,
        avatarX,
        avatarY,
        avatarSize,
        avatarSize
      );

      ctx.restore();

      // =========================
      // MUGSHOT LABEL
      // =========================

      ctx.fillStyle = "#ff3030";
      ctx.fillRect(210, 535, 380, 55);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 27px Arial";
      ctx.fillText("⚠ SUSPICIOUS HUMAN ⚠", 400, 572);

      // =========================
      // RANDOM FUNNY DATA
      // =========================

      const sandaScore = Math.floor(Math.random() * 21) + 80;

      const funnyStatus = [
        "BORN TO BE SANDA",
        "CERTIFIED SANDALIST",
        "100% SUSPECTED SANDA",
        "NO HOPE DETECTED",
        "PROFESSIONAL SANDAMASTER"
      ];

      const status =
        funnyStatus[Math.floor(Math.random() * funnyStatus.length)];

      ctx.textAlign = "left";

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 25px Arial";
      ctx.fillText("SANDA LEVEL", 100, 650);

      ctx.fillStyle = "#ff3030";
      ctx.font = "bold 38px Arial";
      ctx.fillText(`${sandaScore}%`, 610, 650);

      // Progress bar
      ctx.fillStyle = "#222222";
      ctx.fillRect(100, 670, 600, 25);

      ctx.fillStyle = "#ff3030";
      ctx.fillRect(100, 670, 6 * sandaScore, 25);

      // Status
      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 23px Arial";
      ctx.fillText("STATUS:", 100, 750);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 25px Arial";
      ctx.fillText(status, 230, 750);

      // Funny findings
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 22px Arial";

      ctx.fillText("✓ Excessive Sanda Energy", 120, 810);
      ctx.fillText("✓ Common Sense: Missing", 120, 850);
      ctx.fillText("✓ Normal Behavior: Not Found", 120, 890);

      // =========================
      // BIG STAMP
      // =========================

      ctx.save();

      ctx.translate(590, 850);
      ctx.rotate(-0.12);

      ctx.strokeStyle = "#ff3030";
      ctx.lineWidth = 7;
      ctx.strokeRect(-120, -45, 240, 90);

      ctx.fillStyle = "#ff3030";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText("CERTIFIED", 0, -5);
      ctx.fillText("SANDA 😂", 0, 30);

      ctx.restore();

      // =========================
      // FOOTER
      // =========================

      ctx.textAlign = "center";

      ctx.fillStyle = "#777777";
      ctx.font = "18px Arial";
      ctx.fillText(
        "This report was generated by the Sanda Investigation Bureau.",
        400,
        945
      );

      ctx.fillStyle = "#ffcc00";
      ctx.font = "bold 20px Arial";
      ctx.fillText(
        "⚠ HANDLE WITH EXTREME FUN ⚠",
        400,
        970
      );

      // =========================
      // SAVE
      // =========================

      const buffer = canvas.toBuffer("image/png");

      fs.writeFileSync(outputPath, buffer);

      // User info
      const userInfo = await api.getUserInfo(targetID);

      const name =
        userInfo[targetID]?.name || "Unknown Sanda";

      return message.reply(
        {
          body:
            `🚨 SANDA ALERT 🚨\n\n` +
            `👤 Subject: ${name}\n` +
            `📋 Status: ${status}\n` +
            `💀 Sanda Level: ${sandaScore}%\n\n` +
            `😂 Investigation complete!`,

          attachment: fs.createReadStream(outputPath)
        },
        () => {
          try {
            if (fs.existsSync(outputPath)) {
              fs.unlinkSync(outputPath);
            }
          } catch (e) {
            console.error("File cleanup error:", e);
          }
        }
      );

    } catch (err) {
      console.error("Sanda Error:", err);

      return message.reply(
        "❌ Sanda investigation failed! 😂\n\nআবার চেষ্টা করো।"
      );
    }
  }
};