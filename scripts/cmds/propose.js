const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "propose",
    version: "1.0.0",
    author: "Mohammad Maruf",
    countDown: 10,
    role: 0,
    description: "Romantic proposal with profile pictures",
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
    // TARGET DETECTION
    // ==========================================

    let targetID;

    // Reply
    if (
      type === "message_reply" &&
      messageReply
    ) {
      targetID = messageReply.senderID;
    }

    // Mention
    else if (
      mentions &&
      Object.keys(mentions).length > 0
    ) {
      targetID =
        Object.keys(mentions)[0];
    }

    // UID
    else if (
      args &&
      args[0]
    ) {
      targetID = args[0];
    }

    if (!targetID) {
      return api.sendMessage(
        "💌 কাকে propose করবে?\n\n" +
        "👤 কাউকে mention করো\n" +
        "↩️ অথবা তার message-এ reply দাও! ❤️",
        threadID,
        messageID
      );
    }

    // ==========================================
    // SELF CHECK
    // ==========================================

    if (
      String(targetID) ===
      String(senderID)
    ) {
      return api.sendMessage(
        "😂 নিজেকেই propose করছো?\n\n" +
        "নিজের প্রেমে পড়ে গেছো নাকি? 🫠❤️",
        threadID,
        messageID
      );
    }

    try {

      // ==========================================
      // USER INFORMATION
      // ==========================================

      const [
        senderInfo,
        targetInfo
      ] = await Promise.all([
        usersData.get(senderID),
        usersData.get(targetID)
      ]);

      const senderName =
        senderInfo?.name ||
        "The Boy";

      const targetName =
        targetInfo?.name ||
        "The Girl";

      // ==========================================
      // BACKGROUND IMAGE
      // ==========================================

      const bgURL =
        "https://i.ibb.co/spGW0X4W/2a692ed961de.jpg";

      // ==========================================
      // FACEBOOK PROFILE IMAGE
      // ==========================================

      const getAvatar = (uid) =>
        `https://graph.facebook.com/${uid}/picture` +
        `?width=512&height=512` +
        `&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

      // ==========================================
      // DOWNLOAD IMAGES
      // ==========================================

      const [
        bgResponse,
        boyResponse,
        girlResponse
      ] = await Promise.all([

        axios.get(
          bgURL,
          {
            responseType: "arraybuffer",
            timeout: 20000
          }
        ),

        axios.get(
          getAvatar(senderID),
          {
            responseType: "arraybuffer",
            timeout: 20000
          }
        ),

        axios.get(
          getAvatar(targetID),
          {
            responseType: "arraybuffer",
            timeout: 20000
          }
        )

      ]);

      // ==========================================
      // LOAD IMAGES
      // ==========================================

      const background =
        await loadImage(
          bgResponse.data
        );

      const boyAvatar =
        await loadImage(
          boyResponse.data
        );

      const girlAvatar =
        await loadImage(
          girlResponse.data
        );

      // ==========================================
      // CANVAS
      // ==========================================

      const WIDTH = background.width;
      const HEIGHT = background.height;

      const canvas =
        createCanvas(
          WIDTH,
          HEIGHT
        );

      const ctx =
        canvas.getContext("2d");

      // ==========================================
      // ORIGINAL BACKGROUND
      // ==========================================

      ctx.drawImage(
        background,
        0,
        0,
        WIDTH,
        HEIGHT
      );

      // ==========================================
      // DRAW PROFILE FUNCTION
      // ==========================================

      function drawProfile(
        image,
        x,
        y,
        size
      ) {

        const radius =
          size / 2;

        // ------------------------------
        // Outer glow
        // ------------------------------

        ctx.save();

        ctx.shadowColor =
          "rgba(255, 20, 70, 0.95)";

        ctx.shadowBlur =
          18;

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

        ctx.restore();

        // ------------------------------
        // Red border
        // ------------------------------

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          radius + 3,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "#e51b3e";

        ctx.fill();

        // ------------------------------
        // White inner border
        // ------------------------------

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          radius + 1,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "#ffffff";

        ctx.fill();

        // ------------------------------
        // Clip avatar
        // ------------------------------

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
          image,
          x - radius,
          y - radius,
          size,
          size
        );

        ctx.restore();

        // ------------------------------
        // Highlight
        // ------------------------------

        ctx.save();

        ctx.globalAlpha =
          0.22;

        ctx.fillStyle =
          "#ffffff";

        ctx.beginPath();

        ctx.arc(
          x - radius * 0.32,
          y - radius * 0.35,
          radius * 0.16,
          0,
          Math.PI * 2
        );

        ctx.fill();

        ctx.restore();
      }

      // ==========================================
      // EXACT PROFILE POSITIONS
      // ==========================================
      //
      // Image = 480 x 640
      //
      // GIRL FACE:
      // X ≈ 153
      // Y ≈ 169
      //
      // BOY FACE:
      // X ≈ 315
      // Y ≈ 267
      //
      // ==========================================

      // 👩 Mention / Reply target
      // Girl's face

      drawProfile(
        girlAvatar,
        153,
        169,
        58
      );

      // 👨 Command sender
      // Boy's face

      drawProfile(
        boyAvatar,
        315,
        267,
        58
      );

      // ==========================================
      // SMALL HEART
      // ==========================================

      function drawHeart(
        x,
        y,
        size
      ) {

        ctx.save();

        ctx.shadowColor =
          "#ff1744";

        ctx.shadowBlur =
          10;

        ctx.fillStyle =
          "#ff1744";

        ctx.beginPath();

        ctx.moveTo(
          x,
          y + size * 0.3
        );

        ctx.bezierCurveTo(
          x - size * 0.9,
          y - size * 0.3,
          x - size * 0.65,
          y - size,
          x,
          y - size * 0.35
        );

        ctx.bezierCurveTo(
          x + size * 0.65,
          y - size,
          x + size * 0.9,
          y - size * 0.3,
          x,
          y + size * 0.3
        );

        ctx.fill();

        ctx.restore();
      }

      drawHeart(
        235,
        215,
        10
      );

      // ==========================================
      // NAME LABEL
      // ==========================================

      function drawLabel(
        name,
        x,
        y,
        width
      ) {

        ctx.save();

        ctx.fillStyle =
          "rgba(0,0,0,0.65)";

        ctx.beginPath();

        ctx.roundRect(
          x - width / 2,
          y - 13,
          width,
          26,
          13
        );

        ctx.fill();

        ctx.strokeStyle =
          "rgba(255,255,255,0.8)";

        ctx.lineWidth =
          1;

        ctx.stroke();

        ctx.textAlign =
          "center";

        ctx.fillStyle =
          "#ffffff";

        ctx.font =
          "bold 11px Arial";

        let shortName =
          name;

        if (
          shortName.length > 20
        ) {
          shortName =
            shortName.substring(
              0,
              18
            ) + "...";
        }

        ctx.fillText(
          shortName,
          x,
          y + 4
        );

        ctx.restore();
      }

      // Girl name

      drawLabel(
        targetName,
        153,
        211,
        120
      );

      // Boy name

      drawLabel(
        senderName,
        315,
        309,
        120
      );

      // ==========================================
      // SMALL "BOY / GIRL" LABEL
      // ==========================================

      ctx.textAlign =
        "center";

      ctx.font =
        "bold 9px Arial";

      ctx.fillStyle =
        "#ffffff";

      ctx.fillText(
        "💗 GIRL",
        153,
        228
      );

      ctx.fillText(
        "💙 BOY",
        315,
        326
      );

      // ==========================================
      // SAVE
      // ==========================================

      const cacheDir =
        path.join(
          __dirname,
          "cache"
        );

      if (
        !fs.existsSync(cacheDir)
      ) {
        fs.mkdirSync(
          cacheDir,
          {
            recursive: true
          }
        );
      }

      const outputPath =
        path.join(
          cacheDir,
          `propose_${Date.now()}.png`
        );

      fs.writeFileSync(
        outputPath,
        canvas.toBuffer(
          "image/png"
        )
      );

      // ==========================================
      // SEND MESSAGE
      // ==========================================

      return api.sendMessage(
        {
          body:
            `💌 𝐏𝐑𝐎𝐏𝐎𝐒𝐀𝐋 𝐀𝐋𝐄𝐑𝐓 💌\n\n` +
            `👨 ${senderName}\n` +
            `❤️ is proposing to\n` +
            `👩 ${targetName}\n\n` +
            `💍 Will she say YES? 👀❤️`,

          attachment:
            fs.createReadStream(
              outputPath
            )
        },

        threadID,

        () => {

          try {

            if (
              fs.existsSync(
                outputPath
              )
            ) {
              fs.unlinkSync(
                outputPath
              );
            }

          } catch (err) {
            console.error(
              "Cleanup Error:",
              err
            );
          }

        },

        messageID
      );

    } catch (error) {

      console.error(
        "PROPOSE ERROR:",
        error
      );

      return api.sendMessage(
        "❌ Proposal image তৈরি করতে সমস্যা হয়েছে।\n\n" +
        "আবার try করো। ❤️",
        threadID,
        messageID
      );
    }
  }
};