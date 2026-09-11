const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "propose2",
    version: "1.0.0",
    author: "Mohammad Maruf",
    countDown: 10,
    role: 0,
    description: "Stylish proposal card with profile pictures",
    category: "love",
    guide: {
      en: "{pn} @mention | Reply | [uid]"
    }
  },

  onStart: async function ({
    api,
    event,
    args,
    usersData
  }) {

    const {
      threadID,
      messageID,
      senderID,
      mentions,
      type,
      messageReply
    } = event;

    // ==========================================
    // FIND TARGET
    // ==========================================

    let targetID;

    if (
      type === "message_reply" &&
      messageReply
    ) {
      targetID = messageReply.senderID;
    }

    else if (
      mentions &&
      Object.keys(mentions).length > 0
    ) {
      targetID = Object.keys(mentions)[0];
    }

    else if (args && args[0]) {
      targetID = args[0];
    }

    if (!targetID) {
      return api.sendMessage(
        "💌 কাউকে Propose করতে হলে তাকে mention করো অথবা তার message-এ reply দাও! 💍",
        threadID,
        messageID
      );
    }

    // ==========================================
    // SELF CHECK
    // ==========================================

    if (String(targetID) === String(senderID)) {
      return api.sendMessage(
        "😂 নিজেকেই propose করছো?\n\nনিজেকে একটু সময় দাও আগে! 🫠❤️",
        threadID,
        messageID
      );
    }

    try {

      // ==========================================
      // USER INFORMATION
      // ==========================================

      const [senderInfo, targetInfo] =
        await Promise.all([
          usersData.get(senderID),
          usersData.get(targetID)
        ]);

      const senderName =
        senderInfo?.name || "Someone";

      const targetName =
        targetInfo?.name || "Someone";

      const senderGender =
        senderInfo?.gender;

      // ==========================================
      // AVATAR URL
      // ==========================================

      const getAvatar = (uid) =>
        `https://graph.facebook.com/${uid}/picture` +
        `?width=512&height=512` +
        `&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // ==========================================
      // LOAD AVATARS
      // ==========================================

      const [senderAvatar, targetAvatar] =
        await Promise.all([
          loadImage(getAvatar(senderID)),
          loadImage(getAvatar(targetID))
        ]);

      // ==========================================
      // CANVAS
      // ==========================================

      const WIDTH = 900;
      const HEIGHT = 1100;

      const canvas =
        createCanvas(WIDTH, HEIGHT);

      const ctx =
        canvas.getContext("2d");

      // ==========================================
      // PREMIUM BACKGROUND
      // ==========================================

      const bg =
        ctx.createLinearGradient(
          0,
          0,
          WIDTH,
          HEIGHT
        );

      bg.addColorStop(0, "#18001f");
      bg.addColorStop(0.35, "#4b123f");
      bg.addColorStop(0.7, "#8d315f");
      bg.addColorStop(1, "#210016");

      ctx.fillStyle = bg;
      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      // ==========================================
      // SOFT GLOW
      // ==========================================

      const glow =
        ctx.createRadialGradient(
          450,
          500,
          50,
          450,
          500,
          500
        );

      glow.addColorStop(
        0,
        "rgba(255,120,190,0.35)"
      );

      glow.addColorStop(
        1,
        "rgba(255,0,100,0)"
      );

      ctx.fillStyle = glow;

      ctx.fillRect(
        0,
        0,
        WIDTH,
        HEIGHT
      );

      // ==========================================
      // HEART PARTICLES
      // ==========================================

      function drawHeart(
        x,
        y,
        size,
        alpha = 1
      ) {

        ctx.save();

        ctx.globalAlpha = alpha;

        ctx.fillStyle = "#ffb6d9";

        ctx.beginPath();

        ctx.moveTo(
          x,
          y + size * 0.3
        );

        ctx.bezierCurveTo(
          x - size * 0.8,
          y - size * 0.2,
          x - size * 0.7,
          y - size,
          x,
          y - size * 0.45
        );

        ctx.bezierCurveTo(
          x + size * 0.7,
          y - size,
          x + size * 0.8,
          y - size * 0.2,
          x,
          y + size * 0.3
        );

        ctx.fill();

        ctx.restore();
      }

      const hearts = [
        [75, 100, 18, 0.7],
        [150, 210, 12, 0.5],
        [790, 115, 22, 0.75],
        [735, 250, 14, 0.55],
        [80, 560, 20, 0.5],
        [820, 570, 18, 0.6],
        [120, 800, 13, 0.5],
        [780, 810, 16, 0.6],
        [60, 930, 21, 0.5],
        [840, 950, 14, 0.6]
      ];

      hearts.forEach(h =>
        drawHeart(
          h[0],
          h[1],
          h[2],
          h[3]
        )
      );

      // ==========================================
      // TOP TITLE
      // ==========================================

      ctx.textAlign = "center";

      ctx.fillStyle = "#ffd9eb";

      ctx.font =
        "bold 27px Arial";

      ctx.fillText(
        "✦  A SPECIAL MESSAGE  ✦",
        WIDTH / 2,
        70
      );

      ctx.fillStyle = "#ffffff";

      ctx.font =
        "bold 72px Arial";

      ctx.fillText(
        "PROPOSAL",
        WIDTH / 2,
        145
      );

      ctx.fillStyle = "#ff9dcc";

      ctx.font =
        "bold 31px Arial";

      ctx.fillText(
        "A MOMENT WORTH REMEMBERING ❤️",
        WIDTH / 2,
        195
      );

      // ==========================================
      // AVATAR POSITIONS
      // ==========================================

      let leftAvatar;
      let rightAvatar;

      if (senderGender === 1) {

        leftAvatar = {
          img: senderAvatar,
          name: senderName,
          x: 220,
          y: 390
        };

        rightAvatar = {
          img: targetAvatar,
          name: targetName,
          x: 680,
          y: 390
        };

      } else {

        leftAvatar = {
          img: targetAvatar,
          name: targetName,
          x: 220,
          y: 390
        };

        rightAvatar = {
          img: senderAvatar,
          name: senderName,
          x: 680,
          y: 390
        };
      }

      // ==========================================
      // CONNECTING GLOW LINE
      // ==========================================

      ctx.save();

      ctx.shadowColor =
        "#ff75b7";

      ctx.shadowBlur = 20;

      ctx.strokeStyle =
        "#ff9dcc";

      ctx.lineWidth = 5;

      ctx.beginPath();

      ctx.moveTo(
        leftAvatar.x + 90,
        leftAvatar.y
      );

      ctx.bezierCurveTo(
        350,
        300,
        550,
        300,
        rightAvatar.x - 90,
        rightAvatar.y
      );

      ctx.stroke();

      ctx.restore();

      // ==========================================
      // AVATAR FUNCTION
      // ==========================================

      function drawAvatar(
        person,
        label
      ) {

        const x = person.x;
        const y = person.y;
        const radius = 90;

        // Outer glow

        ctx.save();

        ctx.shadowColor =
          "#ff55a8";

        ctx.shadowBlur = 35;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          radius + 12,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "#ff8fc7";

        ctx.fill();

        ctx.restore();

        // White border

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          radius + 5,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "#ffffff";

        ctx.fill();

        // Clip avatar

        ctx.save();

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.clip();

        ctx.drawImage(
          person.img,
          x - radius,
          y - radius,
          radius * 2,
          radius * 2
        );

        ctx.restore();

        // Label

        ctx.textAlign = "center";

        ctx.fillStyle =
          "#ffffff";

        ctx.font =
          "bold 20px Arial";

        ctx.fillText(
          label,
          x,
          y + 135
        );
      }

      // ==========================================
      // DRAW AVATARS
      // ==========================================

      drawAvatar(
        leftAvatar,
        leftAvatar.name
      );

      drawAvatar(
        rightAvatar,
        rightAvatar.name
      );

      // ==========================================
      // CENTER HEART
      // ==========================================

      ctx.save();

      ctx.shadowColor =
        "#ff006e";

      ctx.shadowBlur = 35;

      drawHeart(
        450,
        405,
        65,
        1
      );

      ctx.restore();

      // ==========================================
      // RING
      // ==========================================

      ctx.textAlign = "center";

      ctx.fillStyle =
        "#ffe4f1";

      ctx.font =
        "bold 28px Arial";

      ctx.fillText(
        "💍",
        450,
        520
      );

      // ==========================================
      // MESSAGE CARD
      // ==========================================

      const cardX = 85;
      const cardY = 590;
      const cardW = 730;
      const cardH = 250;

      // Card shadow

      ctx.save();

      ctx.shadowColor =
        "rgba(0,0,0,0.45)";

      ctx.shadowBlur = 30;

      ctx.fillStyle =
        "rgba(255,255,255,0.10)";

      ctx.beginPath();

      ctx.roundRect(
        cardX,
        cardY,
        cardW,
        cardH,
        30
      );

      ctx.fill();

      ctx.restore();

      // Card border

      ctx.strokeStyle =
        "rgba(255,190,220,0.55)";

      ctx.lineWidth = 2;

      ctx.beginPath();

      ctx.roundRect(
        cardX,
        cardY,
        cardW,
        cardH,
        30
      );

      ctx.stroke();

      // ==========================================
      // CARD TEXT
      // ==========================================

      ctx.textAlign = "center";

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 25px Arial";

      ctx.fillText(
        `${senderName}  →  ${targetName}`,
        WIDTH / 2,
        650
      );

      ctx.fillStyle =
        "#ffd4e8";

      ctx.font =
        "italic 27px Arial";

      ctx.fillText(
        "Will you be the special one",
        WIDTH / 2,
        710
      );

      ctx.fillText(
        "in my story? ❤️",
        WIDTH / 2,
        755
      );

      ctx.fillStyle =
        "#ff9dcc";

      ctx.font =
        "bold 24px Arial";

      ctx.fillText(
        "💗  SAY YES  •  SAY MAYBE  •  RUN 😂",
        WIDTH / 2,
        810
      );

      // ==========================================
      // BOTTOM AREA
      // ==========================================

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "bold 22px Arial";

      ctx.fillText(
        "❤️  MADE WITH COURAGE & A LITTLE BIT OF CRAZINESS  ❤️",
        WIDTH / 2,
        900
      );

      ctx.fillStyle =
        "#ffb6d9";

      ctx.font =
        "20px Arial";

      ctx.fillText(
        "If this message made you smile, the mission is complete ✨",
        WIDTH / 2,
        940
      );

      // ==========================================
      // FOOTER
      // ==========================================

      ctx.fillStyle =
        "rgba(0,0,0,0.30)";

      ctx.fillRect(
        0,
        990,
        WIDTH,
        110
      );

      ctx.fillStyle =
        "#ffd9eb";

      ctx.font =
        "bold 21px Arial";

      ctx.fillText(
        "✦  SPECIAL PROPOSAL CARD  ✦",
        WIDTH / 2,
        1030
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.font =
        "16px Arial";

      ctx.fillText(
        "Powered by Mohammad Maruf",
        WIDTH / 2,
        1060
      );

      // ==========================================
      // OUTER BORDER
      // ==========================================

      ctx.strokeStyle =
        "#ff9dcc";

      ctx.lineWidth = 5;

      ctx.strokeRect(
        15,
        15,
        WIDTH - 30,
        HEIGHT - 30
      );

      // ==========================================
      // SAVE
      // ==========================================

      const cacheDir =
        path.join(
          __dirname,
          "cache"
        );

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(
          cacheDir,
          { recursive: true }
        );
      }

      const cachePath =
        path.join(
          cacheDir,
          `propose_${Date.now()}.png`
        );

      fs.writeFileSync(
        cachePath,
        canvas.toBuffer("image/png")
      );

      // ==========================================
      // SEND MESSAGE
      // ==========================================

      return api.sendMessage(
        {
          body:
            `💌 PROPOSAL ALERT 💌\n\n` +
            `💗 ${senderName} has a special message for ${targetName}!\n\n` +
            `💍 What will the answer be? 👀❤️`,

          attachment:
            fs.createReadStream(
              cachePath
            )
        },

        threadID,

        () => {
          try {
            if (
              fs.existsSync(cachePath)
            ) {
              fs.unlinkSync(cachePath);
            }
          } catch (err) {
            console.error(
              "Cache cleanup error:",
              err
            );
          }
        },

        messageID
      );

    } catch (error) {

      console.error(
        "Propose Error:",
        error
      );

      return api.sendMessage(
        "❌ Proposal image তৈরি করতে সমস্যা হয়েছে। আবার চেষ্টা করো! ❤️",
        threadID,
        messageID
      );
    }
  }
};