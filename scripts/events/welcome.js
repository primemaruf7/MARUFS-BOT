const { drive } = global.utils;
const { nickNameBot } = global.GoatBot.config;
const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

module.exports = {
  config: {
    name: "welcome",
    version: "8.0",
    author: "EryXenX",
    category: "events"
  },

  langs: {
    en: {
      defaultWelcomeMessage: "𝗪𝗲𝗹𝗰𝗼𝗺𝗲 {userName} 🎉\n┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄\n✦ Glad to have you here! Enjoy your stay and make great memories 🌸",
      botAddedMessage:
        "━━━━━━━━━━━━━━━━━━━\n🤖 ᴛʜᴀɴᴋ ʏᴏᴜ ғᴏʀ ᴀᴅᴅɪɴɢ ᴍᴇ ᴛᴏ ᴛʜᴇ ɢʀᴏᴜᴘ! 💖\n\n⚙️ ʙᴏᴛ ᴘʀᴇꜰɪx : /\n📜 ᴛʏᴘᴇ /help ᴛᴏ sᴇᴇ ᴀʟʟ ᴄᴏᴍᴍᴀɴᴅs\n\n✨ ʟᴇᴛ's ᴍᴀᴋᴇ ᴛʜɪs ɢʀᴏᴜᴘ ᴇᴠᴇɴ ᴍᴏʀᴇ ꜰᴜɴ ᴛᴏɢᴇᴛʜᴇʀ! 😄\n━━━━━━━━━━━━━━━━━━━"
    }
  },

  onStart: async ({ threadsData, message, event, api, usersData, getLang }) => {
    if (event.logMessageType !== "log:subscribe") return;

    const { threadID } = event;
    const threadData = await threadsData.get(threadID);
    if (!threadData.settings.sendWelcomeMessage) return;

    const addedMembers = event.logMessageData.addedParticipants;
    const threadName = threadData.threadName || "our group";
    const prefix = global.utils.getPrefix(threadID);
    const inviterID = event.author;

    for (const user of addedMembers) {
      const userID = user.userFbId;
      const botID = api.getCurrentUserID();

      if (userID == botID) {
        if (nickNameBot) await api.changeNickname(nickNameBot, threadID, botID);
        return message.send(getLang("botAddedMessage", prefix));
      }

      const userName = user.fullName;
      const inviterName = await usersData.getName(inviterID);
      const memberCount = event.participantIDs.length;

      let { welcomeMessage = getLang("defaultWelcomeMessage") } = threadData.data;

      welcomeMessage = welcomeMessage
        .replace(/\{userName\}/g, userName)
        .replace(/\{userTag\}/g, userName)
        .replace(/\{threadName\}/g, threadName)
        .replace(/\{memberCount\}/g, memberCount)
        .replace(/\{inviterName\}/g, inviterName);

      let welcomeImagePath = null;

      try {
        welcomeImagePath = await createWelcomeCard({
          userName,
          threadName,
          memberCount,
          inviterName,
          newUserID: userID,
          inviterID,
          threadID,
          api
        });
      } catch (err) {
        console.error("Welcome image creation failed:", err);
      }

      const form = {
        body: welcomeMessage,
        mentions: [{ tag: userName, id: userID }]
      };

      if (welcomeImagePath && fs.existsSync(welcomeImagePath)) {
        form.attachment = fs.createReadStream(welcomeImagePath);
      } else if (threadData.data.welcomeAttachment) {
        const attachments = threadData.data.welcomeAttachment
          .map(f => drive.getFile(f, "stream"));

        form.attachment = (await Promise.allSettled(attachments))
          .filter(({ status }) => status === "fulfilled")
          .map(({ value }) => value);
      }

      message.send(form);

      if (welcomeImagePath && fs.existsSync(welcomeImagePath)) {
        setTimeout(() => {
          try {
            fs.unlinkSync(welcomeImagePath);
          } catch (_) {}
        }, 5000);
      }
    }
  }
};

const ACCESS_TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";

async function downloadHighQualityProfile(userID) {
  try {
    const url = `https://graph.facebook.com/${userID}/picture?width=500&height=500&access_token=${ACCESS_TOKEN}`;

    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 10000
    });

    return Buffer.from(res.data, "binary");
  } catch {
    return null;
  }
}

async function downloadImage(url) {
  try {
    const res = await axios({
      method: "GET",
      url,
      responseType: "arraybuffer",
      timeout: 10000
    });

    return Buffer.from(res.data, "binary");
  } catch {
    return null;
  }
}

async function getGroupImage(threadID, api) {
  try {
    const info = await api.getThreadInfo(threadID);

    if (info.imageSrc) {
      const res = await axios({
        method: "GET",
        url: info.imageSrc,
        responseType: "arraybuffer",
        timeout: 10000
      });

      return Buffer.from(res.data, "binary");
    }
  } catch {}

  return null;
}

function unicodeToPlain(str) {
  if (!str) return "";

  const ranges = [
    [0x1D400, 0x1D419, "A"],
    [0x1D41A, 0x1D433, "a"],
    [0x1D434, 0x1D44D, "A"],
    [0x1D44E, 0x1D467, "a"],
    [0x1D468, 0x1D481, "A"],
    [0x1D482, 0x1D49B, "a"],
    [0x1D5D4, 0x1D5ED, "A"],
    [0x1D5EE, 0x1D607, "a"],
    [0x1D63C, 0x1D655, "A"],
    [0x1D656, 0x1D66F, "a"],
    [0x1D7CE, 0x1D7D7, "0"],
    [0xFF21, 0xFF3A, "A"],
    [0xFF41, 0xFF5A, "a"],
    [0xFF10, 0xFF19, "0"],
    [0x24B6, 0x24CF, "A"],
    [0x24D0, 0x24E9, "a"]
  ];

  const singles = {
    0x1D49C: "A",
    0x212C: "B",
    0x2102: "C",
    0x2145: "D",
    0x2130: "E",
    0x2131: "F",
    0x210A: "g",
    0x210B: "H",
    0x2110: "I",
    0x2111: "I",
    0x2112: "L",
    0x2113: "l",
    0x2115: "N",
    0x2118: "P",
    0x211A: "Q",
    0x211B: "R",
    0x211C: "R",
    0x2124: "Z",
    0x2128: "Z",
    0x2070: "0",
    0x00B9: "1",
    0x00B2: "2",
    0x00B3: "3",
    0x2074: "4",
    0x2075: "5",
    0x2076: "6",
    0x2077: "7",
    0x2078: "8",
    0x2079: "9"
  };

  let result = "";

  for (const char of str) {
    const cp = char.codePointAt(0);

    if (singles[cp] !== undefined) {
      result += singles[cp];
      continue;
    }

    let mapped = false;

    for (const [start, end, base] of ranges) {
      if (cp >= start && cp <= end) {
        const baseCode = base.codePointAt(0);

        result += String.fromCodePoint(
          baseCode + (cp - start)
        );

        mapped = true;
        break;
      }
    }

    if (!mapped) result += char;
  }

  return result;
}

function safeStr(str) {
  if (!str) return "";

  try {
    return Buffer.from(str, "latin1").toString("utf8");
  } catch {
    return str;
  }
}

function readableText(str) {
  return unicodeToPlain(safeStr(str));
}

function ordinal(n) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;

  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCircleAvatar(ctx, img, cx, cy, r) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  ctx.drawImage(
    img,
    cx - r,
    cy - r,
    r * 2,
    r * 2
  );

  ctx.restore();
}

function fitText(
  ctx,
  text,
  maxPx,
  maxSize = 34,
  minSize = 14,
  bold = true
) {
  let t = text;
  let size = maxSize;

  const weight = bold ? "bold" : "400";

  ctx.font = `${weight} ${size}px "Segoe UI", Arial`;

  while (
    ctx.measureText(t).width > maxPx &&
    size > minSize
  ) {
    size--;
    ctx.font = `${weight} ${size}px "Segoe UI", Arial`;
  }

  if (ctx.measureText(t).width > maxPx) {
    while (
      ctx.measureText(t + "…").width > maxPx &&
      t.length > 1
    ) {
      t = t.slice(0, -1);
    }

    t += "…";
  }

  return {
    text: t,
    size
  };
}

async function createWelcomeCard({
  userName,
  threadName,
  memberCount,
  inviterName,
  newUserID,
  inviterID,
  threadID,
  api
}) {
  const W = 1200;
  const H = 630;

  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  async function loadProfile(uid) {
    const buf = await downloadHighQualityProfile(uid);

    if (buf) {
      return loadImage(buf).catch(() => null);
    }

    try {
      const info = await api.getUserInfo([uid]);
      const src = info[uid]?.thumbSrc;

      if (src) {
        const b2 = await downloadImage(src);

        if (b2) {
          return loadImage(b2).catch(() => null);
        }
      }
    } catch {}

    return null;
  }

  const [
    newUserImg,
    inviterImg,
    groupImg
  ] = await Promise.all([
    loadProfile(newUserID),
    loadProfile(inviterID),
    getGroupImage(threadID, api).then(
      b => b ? loadImage(b).catch(() => null) : null
    )
  ]);

  const safeUser = readableText(userName);
  const safeInviter = readableText(inviterName);
  const safeGroup = readableText(threadName);

  ctx.fillStyle = "#070812";
  ctx.fillRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#090b18");
  bg.addColorStop(0.45, "#0d1020");
  bg.addColorStop(1, "#080912");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow1 = ctx.createRadialGradient(
    170,
    130,
    0,
    170,
    130,
    430
  );

  glow1.addColorStop(
    0,
    "rgba(0,220,255,0.20)"
  );

  glow1.addColorStop(
    1,
    "rgba(0,220,255,0)"
  );

  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, W, H);

  const glow2 = ctx.createRadialGradient(
    1050,
    510,
    0,
    1050,
    510,
    420
  );

  glow2.addColorStop(
    0,
    "rgba(145,70,255,0.20)"
  );

  glow2.addColorStop(
    1,
    "rgba(145,70,255,0)"
  );

  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, W, H);

  const rng = s => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  ctx.fillStyle = "rgba(255,255,255,0.025)";

  for (let i = 0; i < 350; i++) {
    ctx.beginPath();

    ctx.arc(
      rng(i * 3.17) * W,
      rng(i * 6.41) * H,
      rng(i * 9.23) * 1.5 + 0.2,
      0,
      Math.PI * 2
    );

    ctx.fill();
  }

  ctx.save();

  ctx.shadowColor = "rgba(0,220,255,0.35)";
  ctx.shadowBlur = 30;

  ctx.strokeStyle = "rgba(90,210,255,0.30)";
  ctx.lineWidth = 2;

  roundRect(
    ctx,
    12,
    12,
    W - 24,
    H - 24,
    28
  );

  ctx.stroke();

  ctx.restore();

  const outerX = 38;
  const outerY = 38;
  const outerW = W - 76;
  const outerH = H - 76;

  ctx.save();

  ctx.fillStyle = "rgba(255,255,255,0.025)";
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 35;

  roundRect(
    ctx,
    outerX,
    outerY,
    outerW,
    outerH,
    26
  );

  ctx.fill();

  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;

  roundRect(
    ctx,
    outerX,
    outerY,
    outerW,
    outerH,
    26
  );

  ctx.stroke();

  const leftW = 455;
  const leftX = outerX;
  const leftY = outerY;
  const leftH = outerH;

  ctx.save();

  const leftGrad = ctx.createLinearGradient(
    leftX,
    leftY,
    leftX + leftW,
    leftY + leftH
  );

  leftGrad.addColorStop(
    0,
    "rgba(0,220,255,0.075)"
  );

  leftGrad.addColorStop(
    0.5,
    "rgba(255,255,255,0.018)"
  );

  leftGrad.addColorStop(
    1,
    "rgba(145,70,255,0.075)"
  );

  ctx.fillStyle = leftGrad;

  roundRect(
    ctx,
    leftX,
    leftY,
    leftW,
    leftH,
    26
  );

  ctx.fill();

  ctx.restore();

  const dividerX = leftX + leftW;

  const divider = ctx.createLinearGradient(
    0,
    leftY + 30,
    0,
    leftY + leftH - 30
  );

  divider.addColorStop(
    0,
    "rgba(0,220,255,0)"
  );

  divider.addColorStop(
    0.25,
    "rgba(0,220,255,0.45)"
  );

  divider.addColorStop(
    0.75,
    "rgba(145,70,255,0.45)"
  );

  divider.addColorStop(
    1,
    "rgba(145,70,255,0)"
  );

  ctx.fillStyle = divider;
  ctx.fillRect(
    dividerX,
    leftY + 30,
    1.5,
    leftH - 60
  );

  const centerX = leftX + leftW / 2;

  ctx.save();

  ctx.textAlign = "center";
  ctx.font = 'bold 15px "Segoe UI", Arial';
  ctx.fillStyle = "rgba(0,220,255,0.80)";

  ctx.fillText(
    "✦  W E L C O M E  ✦",
    centerX,
    83
  );

  ctx.restore();

  const avatarR = 126;
  const avatarY = 278;

  ctx.save();

  const avatarGlow = ctx.createRadialGradient(
    centerX,
    avatarY,
    avatarR * 0.5,
    centerX,
    avatarY,
    avatarR + 50
  );

  avatarGlow.addColorStop(
    0,
    "rgba(0,220,255,0.18)"
  );

  avatarGlow.addColorStop(
    0.55,
    "rgba(100,100,255,0.08)"
  );

  avatarGlow.addColorStop(
    1,
    "rgba(0,0,0,0)"
  );

  ctx.fillStyle = avatarGlow;

  ctx.fillRect(
    centerX - 190,
    avatarY - 190,
    380,
    380
  );

  ctx.restore();

  ctx.save();

  ctx.shadowColor = "rgba(0,220,255,0.75)";
  ctx.shadowBlur = 28;

  const ring = ctx.createLinearGradient(
    centerX - avatarR,
    avatarY - avatarR,
    centerX + avatarR,
    avatarY + avatarR
  );

  ring.addColorStop(0, "#00eaff");
  ring.addColorStop(0.5, "#6c7bff");
  ring.addColorStop(1, "#a855f7");

  ctx.strokeStyle = ring;
  ctx.lineWidth = 5;

  ctx.beginPath();
  ctx.arc(
    centerX,
    avatarY,
    avatarR + 10,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;

  ctx.beginPath();

  ctx.arc(
    centerX,
    avatarY,
    avatarR + 20,
    0,
    Math.PI * 2
  );

  ctx.stroke();

  if (newUserImg) {
    drawCircleAvatar(
      ctx,
      newUserImg,
      centerX,
      avatarY,
      avatarR
    );
  } else {
    ctx.fillStyle = "#141827";

    ctx.beginPath();

    ctx.arc(
      centerX,
      avatarY,
      avatarR,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 75px Arial";
    ctx.fillStyle = "rgba(255,255,255,0.18)";

    ctx.fillText(
      "👤",
      centerX,
      avatarY
    );

    ctx.restore();
  }

  ctx.save();

  ctx.textAlign = "center";

  const userFit = fitText(
    ctx,
    safeUser,
    leftW - 55,
    34,
    15
  );

  ctx.font =
    `bold ${userFit.size}px "Segoe UI", Arial`;

  const userGrad = ctx.createLinearGradient(
    centerX - 150,
    0,
    centerX + 150,
    0
  );

  userGrad.addColorStop(0, "#ffffff");
  userGrad.addColorStop(0.5, "#e9faff");
  userGrad.addColorStop(1, "#a8eaff");

  ctx.fillStyle = userGrad;

  ctx.shadowColor = "rgba(0,220,255,0.25)";
  ctx.shadowBlur = 10;

  ctx.fillText(
    userFit.text,
    centerX,
    442
  );

  ctx.restore();

  const badgeText =
    `✦ ${ordinal(memberCount)} MEMBER ✦`;

  ctx.save();

  ctx.font = 'bold 15px "Segoe UI", Arial';
  ctx.textAlign = "center";

  const badgeW =
    ctx.measureText(badgeText).width + 42;

  const badgeH = 34;
  const badgeX = centerX - badgeW / 2;
  const badgeY = 463;

  const badgeGrad = ctx.createLinearGradient(
    badgeX,
    0,
    badgeX + badgeW,
    0
  );

  badgeGrad.addColorStop(
    0,
    "rgba(0,220,255,0.08)"
  );

  badgeGrad.addColorStop(
    0.5,
    "rgba(0,220,255,0.18)"
  );

  badgeGrad.addColorStop(
    1,
    "rgba(168,85,247,0.14)"
  );

  ctx.fillStyle = badgeGrad;

  roundRect(
    ctx,
    badgeX,
    badgeY,
    badgeW,
    badgeH,
    17
  );

  ctx.fill();

  ctx.strokeStyle =
    "rgba(0,220,255,0.35)";

  ctx.lineWidth = 1;

  roundRect(
    ctx,
    badgeX,
    badgeY,
    badgeW,
    badgeH,
    17
  );

  ctx.stroke();

  ctx.fillStyle = "#a9edff";

  ctx.fillText(
    badgeText,
    centerX,
    badgeY + 23
  );

  ctx.restore();

  ctx.save();

  ctx.textAlign = "center";
  ctx.font = '500 12px "Segoe UI", Arial';
  ctx.fillStyle = "rgba(255,255,255,0.32)";

  ctx.fillText(
    "YOU ARE NOW PART OF THE FAMILY",
    centerX,
    526
  );

  ctx.restore();

  const rightX = dividerX + 35;
  const rightRight = outerX + outerW - 35;
  const rightW = rightRight - rightX;

  ctx.save();

  ctx.textAlign = "left";
  ctx.font = 'bold 38px "Segoe UI", Arial';

  const titleGrad = ctx.createLinearGradient(
    rightX,
    0,
    rightX + 470,
    0
  );

  titleGrad.addColorStop(
    0,
    "#ffffff"
  );

  titleGrad.addColorStop(
    0.55,
    "#d9f9ff"
  );

  titleGrad.addColorStop(
    1,
    "#a78bfa"
  );

  ctx.fillStyle = titleGrad;

  ctx.shadowColor =
    "rgba(0,220,255,0.22)";

  ctx.shadowBlur = 15;

  ctx.fillText(
    "Welcome To The Group",
    rightX,
    105
  );

  ctx.restore();

  ctx.save();

  ctx.strokeStyle = "#00dfff";
  ctx.lineWidth = 3;

  ctx.shadowColor =
    "rgba(0,220,255,0.75)";

  ctx.shadowBlur = 12;

  ctx.beginPath();

  ctx.moveTo(
    rightX,
    121
  );

  ctx.lineTo(
    rightX + 115,
    121
  );

  ctx.stroke();

  ctx.restore();

  ctx.save();

  ctx.textAlign = "left";
  ctx.font = 'bold 11px "Segoe UI", Arial';
  ctx.fillStyle =
    "rgba(0,220,255,0.65)";

  ctx.fillText(
    "GROUP",
    rightX,
    158
  );

  ctx.restore();

  const groupY = 175;
  const groupSize = 82;

  ctx.save();

  ctx.fillStyle =
    "rgba(255,255,255,0.035)";

  roundRect(
    ctx,
    rightX,
    groupY,
    groupSize,
    groupSize,
    18
  );

  ctx.fill();

  if (groupImg) {
    ctx.save();

    roundRect(
      ctx,
      rightX,
      groupY,
      groupSize,
      groupSize,
      18
    );

    ctx.clip();

    ctx.drawImage(
      groupImg,
      rightX,
      groupY,
      groupSize,
      groupSize
    );

    ctx.restore();
  } else {
    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "38px Arial";
    ctx.fillStyle =
      "rgba(255,255,255,0.18)";

    ctx.fillText(
      "🏠",
      rightX + groupSize / 2,
      groupY + groupSize / 2
    );

    ctx.restore();
  }

  ctx.strokeStyle =
    "rgba(0,220,255,0.45)";

  ctx.lineWidth = 2;

  roundRect(
    ctx,
    rightX,
    groupY,
    groupSize,
    groupSize,
    18
  );

  ctx.stroke();

  ctx.restore();

  const groupTextX =
    rightX + groupSize + 20;

  const groupTextW =
    rightRight - groupTextX;

  ctx.save();

  ctx.textAlign = "left";

  const groupFit = fitText(
    ctx,
    safeGroup,
    groupTextW,
    29,
    14
  );

  ctx.font =
    `bold ${groupFit.size}px "Segoe UI", Arial`;

  ctx.fillStyle = "#f2f7ff";

  ctx.shadowColor =
    "rgba(0,0,0,0.65)";

  ctx.shadowBlur = 7;

  ctx.fillText(
    groupFit.text,
    groupTextX,
    groupY + 48
  );

  ctx.restore();

  const lineY = 282;

  const lineGrad = ctx.createLinearGradient(
    rightX,
    0,
    rightRight,
    0
  );

  lineGrad.addColorStop(
    0,
    "rgba(0,220,255,0.35)"
  );

  lineGrad.addColorStop(
    0.5,
    "rgba(255,255,255,0.08)"
  );

  lineGrad.addColorStop(
    1,
    "rgba(168,85,247,0)"
  );

  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 1;

  ctx.beginPath();

  ctx.moveTo(
    rightX,
    lineY
  );

  ctx.lineTo(
    rightRight,
    lineY
  );

  ctx.stroke();

  ctx.save();

  ctx.textAlign = "left";
  ctx.font = 'bold 11px "Segoe UI", Arial';

  ctx.fillStyle =
    "rgba(168,85,247,0.72)";

  ctx.fillText(
    "ADDED BY",
    rightX,
    312
  );

  ctx.restore();

  const invR = 43;
  const invCX = rightX + invR;
  const invCY = 381;

  ctx.save();

  const invGlow =
    ctx.createRadialGradient(
      invCX,
      invCY,
      5,
      invCX,
      invCY,
      invR + 25
    );

  invGlow.addColorStop(
    0,
    "rgba(168,85,247,0.22)"
  );

  invGlow.addColorStop(
    1,
    "rgba(168,85,247,0)"
  );

  ctx.fillStyle = invGlow;

  ctx.fillRect(
    invCX - 75,
    invCY - 75,
    150,
    150
  );

  ctx.restore();

  if (inviterImg) {
    ctx.save();

    ctx.shadowColor =
      "rgba(168,85,247,0.65)";

    ctx.shadowBlur = 18;

    ctx.strokeStyle =
      "rgba(168,85,247,0.75)";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.arc(
      invCX,
      invCY,
      invR + 6,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();

    drawCircleAvatar(
      ctx,
      inviterImg,
      invCX,
      invCY,
      invR
    );
  } else {
    ctx.fillStyle = "#151827";

    ctx.beginPath();

    ctx.arc(
      invCX,
      invCY,
      invR,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.save();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "30px Arial";
    ctx.fillStyle =
      "rgba(255,255,255,0.18)";

    ctx.fillText(
      "👤",
      invCX,
      invCY
    );

    ctx.restore();
  }

  const invTextX =
    invCX + invR + 18;

  const invTextW =
    rightRight - invTextX;

  ctx.save();

  ctx.textAlign = "left";

  const inviterFit = fitText(
    ctx,
    safeInviter,
    invTextW,
    27,
    14
  );

  ctx.font =
    `bold ${inviterFit.size}px "Segoe UI", Arial`;

  ctx.fillStyle = "#f1f4ff";

  ctx.shadowColor =
    "rgba(0,0,0,0.65)";

  ctx.shadowBlur = 7;

  ctx.fillText(
    inviterFit.text,
    invTextX,
    invCY + 9
  );

  ctx.restore();

  const infoY = 452;
  const infoH = 74;

  const infoGrad =
    ctx.createLinearGradient(
      rightX,
      infoY,
      rightRight,
      infoY + infoH
    );

  infoGrad.addColorStop(
    0,
    "rgba(0,220,255,0.055)"
  );

  infoGrad.addColorStop(
    1,
    "rgba(168,85,247,0.045)"
  );

  ctx.fillStyle = infoGrad;

  roundRect(
    ctx,
    rightX,
    infoY,
    rightW,
    infoH,
    16
  );

  ctx.fill();

  ctx.strokeStyle =
    "rgba(255,255,255,0.07)";

  ctx.lineWidth = 1;

  roundRect(
    ctx,
    rightX,
    infoY,
    rightW,
    infoH,
    16
  );

  ctx.stroke();

  ctx.save();

  ctx.textAlign = "left";
  ctx.font = 'bold 12px "Segoe UI", Arial';

  ctx.fillStyle =
    "rgba(255,255,255,0.30)";

  ctx.fillText(
    "MEMBERS",
    rightX + 20,
    infoY + 27
  );

  ctx.fillStyle = "#e9fbff";
  ctx.font = 'bold 21px "Segoe UI", Arial';

  ctx.fillText(
    memberCount.toString(),
    rightX + 20,
    infoY + 52
  );

  ctx.restore();

  ctx.save();

  ctx.textAlign = "right";
  ctx.font = '500 12px "Segoe UI", Arial';

  ctx.fillStyle =
    "rgba(255,255,255,0.26)";

  ctx.fillText(
    "STATUS",
    rightRight - 20,
    infoY + 27
  );

  ctx.font = 'bold 14px "Segoe UI", Arial';
  ctx.fillStyle = "#9ffcff";

  ctx.fillText(
    "● NEW MEMBER",
    rightRight - 20,
    infoY + 52
  );

  ctx.restore();

  const poweredY =
    outerY + outerH - 30;

  ctx.save();

  ctx.textAlign = "right";
  ctx.font = 'bold 13px "Segoe UI", Arial';

  const poweredGrad =
    ctx.createLinearGradient(
      rightRight - 170,
      0,
      rightRight,
      0
    );

  poweredGrad.addColorStop(
    0,
    "rgba(255,255,255,0.35)"
  );

  poweredGrad.addColorStop(
    0.5,
    "#8eeeff"
  );

  poweredGrad.addColorStop(
    1,
    "#b18cff"
  );

  ctx.fillStyle = poweredGrad;

  ctx.fillText(
    "Powered By MaRuF",
    rightRight,
    poweredY
  );

  ctx.restore();

  ctx.save();

  ctx.textAlign = "left";
  ctx.font = '500 11px "Segoe UI", Arial';
  ctx.fillStyle =
    "rgba(255,255,255,0.18)";

  ctx.fillText(
    "Enjoy your stay ✦",
    leftX + 22,
    outerY + outerH - 22
  );

  ctx.restore();

  const tempPath = path.join(
    __dirname,
    `temp_welcome_${Date.now()}.png`
  );

  await fs.writeFile(
    tempPath,
    canvas.toBuffer("image/png")
  );

  return tempPath;
}