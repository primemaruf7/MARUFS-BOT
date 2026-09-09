module.exports = {
  config: {
    name: "baby",
    aliases: ["bot", "bby", "bbz", "xan", "oi"],
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    description: "Cute auto reply",
    category: "chat"
  },

  onStart: async function ({ api, event }) {
    return sendReply(api, event);
  },

  onChat: async function ({ api, event }) {
    const body = (event.body || "").trim().toLowerCase();

    if (!["baby", "bot", "bby", "bbz", "xan", "oi"].includes(body)) return;

    return sendReply(api, event);
  }
};

const handled = new Set();

function isDuplicate(event) {
  const key =
    event.messageID ||
    `${event.threadID}:${event.senderID}:${event.body}`;

  if (handled.has(key)) return true;

  handled.add(key);
  setTimeout(() => handled.delete(key), 5000);

  return false;
}

const replies = [
  "Aww~ এত cute করে ডাকলে তো আসতেই হয় 🥹ྀི♡",
  "𝐇𝐦𝐦... বলো তো, কী নিয়ে এত ব্যস্ত হয়ে আমাকে ডাকছো? 👀ྀི✨",
  "আচ্ছা বলো, আমি মন দিয়ে শুনছি... 🫶🏻💗",
  "𝐇𝐞𝐡𝐞~ আবার ডাকলে যে! কী হয়েছে? 😼ྀི💕",
  "ওইই 😭 এত মায়া নিয়ে ডাকলে কীভাবে না আসি? 🥺🫶🏻",
  "𝐈'𝐦 𝐡𝐞𝐫𝐞~ এখন বলো, তোমার কী দরকার? ♡̷̷̷₊˚💫",
  "কী ব্যাপার? আজকে দেখি আমার কথা মনে পড়ছে বেশ 😌ྀི🌷",
  "𝐎𝐤𝐚𝐲𝐲~ বলো বলো, পুরো attention এখন তোমার দিকে 👀💗",
  "মনটা খারাপ হলে বলতে পারো... আমি শুনছি 🥺🌸",
  "এভাবে ডাকলে কিন্তু বারবার চলে আসবো 😭ྀི🤍",
  "𝐘𝐞𝐬𝐬~ হাজির আছি 😌✨ এবার তোমার কথাটা বলো ♡",
  "হুমম... বুঝলাম, আমাকে ছাড়া চলছিল না তাই না? 🤭ྀི💞",
  "আবার কী দুষ্টুমি শুরু করেছো? 😭😂ྀི♡",
  "𝐎𝐡𝐡~ এত সুন্দর করে ডাকছো কেন? কিছু চাই নাকি? 👀🫶🏻",
  "চুপচাপ আছি, তোমার message-এর অপেক্ষাতেই ছিলাম যেন 🥹ྀི🌷",
  "বলো না... এভাবে শুধু ডাকলে curiosity বেড়ে যায় 😭👀💗",
  "𝐇𝐞𝐲𝐲~ আমি কিন্তু শুনেছি! এখন আর পালানোর সুযোগ নেই 😼✨",
  "তোমার ডাকটা ignore করার মতো না... তাই চলে এলাম 🥺🤍",
  "আচ্ছা ঠিক আছে, বলো... আজকে কী গল্প শোনাবে? 🌸🫶🏻",
  "𝐋𝐨𝐥~ আবার আমাকে ডাকছো! নিশ্চয়ই কিছু একটা আছে 😭😂💫"
];

async function sendReply(api, event) {
  if (isDuplicate(event)) return;

  try {
    await api.sendTypingIndicator(event.threadID, true);

    await new Promise(resolve => setTimeout(resolve, 1800));

    await api.sendTypingIndicator(event.threadID, false);

    return api.sendMessage(
      replies[Math.floor(Math.random() * replies.length)],
      event.threadID,
      event.messageID
    );
  } catch (err) {
    return api.sendMessage(
      replies[Math.floor(Math.random() * replies.length)],
      event.threadID,
      event.messageID
    );
  }
}