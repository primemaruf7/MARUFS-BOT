const axios = require("axios");

const apiList = "https://gitlab.com/shahadat-sahu/sahu-api/-/raw/main/API.json";

const getMainAPI = async () => {
  return (await axios.get(apiList)).data.simsimi;
};

exports.config = {
  name: "baby",
  version: "1.0.3",
  author: "𝐌𝐚𝐑𝐮𝐅",
  countDown: 0,
  role: 0,
  shortDescription: "Cute AI Baby Chatbot",
  longDescription: "Cute AI Baby Chatbot | Talk, Teach & Chat with Emotion 🌸😊",
  category: "Chat",
  guide: {
    en: "{pn} [message/query]"
  }
};

exports.onStart = async function ({ api, event, args, users }) {
  try {
    const uid = event.senderID;
    const senderName = await users.getName(uid);
    const rawQuery = args.join(" ");
    const query = rawQuery.toLowerCase();
    const simsim = await getMainAPI();

    if (!query) {
      const ran = ["Bolo baby", "hum"];
      const r = ran[Math.floor(Math.random() * ran.length)];

      return api.sendMessage(r, event.threadID, (err, info) => {
        if (!err && info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: exports.config.name,
            author: event.senderID,
            type: "simsimi"
          });
        }
      });
    }

    const command = args[0].toLowerCase();

    if (["remove", "rm"].includes(command)) {
      const parts = rawQuery
        .replace(/^(remove|rm)\s*/i, "")
        .split(" - ");

      if (parts.length < 2) {
        return api.sendMessage(
          "Use: remove [Question] - [Reply]",
          event.threadID,
          event.messageID
        );
      }

      const [ask, ans] = parts.map(p => p.trim());

      const res = await axios.get(
        `${simsim}/delete?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`
      );

      return api.sendMessage(
        res.data.message,
        event.threadID,
        event.messageID
      );
    }

    if (command === "list") {
      const res = await axios.get(`${simsim}/list`);

      if (res.data.code === 200) {
        return api.sendMessage(
          `♾ Total Questions Learned: ${res.data.totalQuestions}\n★ Total Replies Stored: ${res.data.totalReplies}\nDeveloper: ${res.data.author}`,
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        `Error: ${res.data.message}`,
        event.threadID,
        event.messageID
      );
    }

    if (command === "edit") {
      const parts = rawQuery
        .replace(/^edit\s*/i, "")
        .split(" - ");

      if (parts.length < 3) {
        return api.sendMessage(
          "Use: edit [Q] - [Old] - [New]",
          event.threadID,
          event.messageID
        );
      }

      const [ask, oldReply, newReply] = parts.map(p => p.trim());

      const res = await axios.get(
        `${simsim}/edit?ask=${encodeURIComponent(ask)}&old=${encodeURIComponent(oldReply)}&new=${encodeURIComponent(newReply)}`
      );

      return api.sendMessage(
        res.data.message,
        event.threadID,
        event.messageID
      );
    }

    if (command === "teach") {
      const parts = rawQuery
        .replace(/^teach\s*/i, "")
        .split(" - ");

      if (parts.length < 2) {
        return api.sendMessage(
          "Use: teach [Q] - [Reply]",
          event.threadID,
          event.messageID
        );
      }

      const [ask, ans] = parts.map(p => p.trim());
      const groupID = event.threadID;

      let groupName = event.threadName ? event.threadName : "";

      try {
        if (!groupName && groupID != uid) {
          const threadInfo = await api.getThreadInfo(groupID);

          if (threadInfo?.threadName) {
            groupName = threadInfo.threadName;
          }
        }
      } catch {}

      let teachUrl =
        `${simsim}/teach?ask=${encodeURIComponent(ask)}` +
        `&ans=${encodeURIComponent(ans)}` +
        `&senderID=${uid}` +
        `&senderName=${encodeURIComponent(senderName)}` +
        `&groupID=${encodeURIComponent(groupID)}`;

      if (groupName) {
        teachUrl += `&groupName=${encodeURIComponent(groupName)}`;
      }

      const res = await axios.get(teachUrl);

      return api.sendMessage(
        res.data.message,
        event.threadID,
        event.messageID
      );
    }

    const res = await axios.get(
      `${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`
    );

    const replies = Array.isArray(res.data.response)
      ? res.data.response
      : [res.data.response];

    for (const rep of replies) {
      await new Promise(resolve => {
        api.sendMessage(
          rep,
          event.threadID,
          (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: exports.config.name,
                author: event.senderID,
                type: "simsimi"
              });
            }

            resolve();
          },
          event.messageID
        );
      });
    }
  } catch (err) {
    return api.sendMessage(
      `Error: ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
};

exports.onReply = async function ({ api, event, Reply, users }) {
  try {
    const senderName = await users.getName(event.senderID);
    const replyText = event.body ? event.body.toLowerCase() : "";

    if (!replyText) return;

    const simsim = await getMainAPI();

    const res = await axios.get(
      `${simsim}/simsimi?text=${encodeURIComponent(replyText)}&senderName=${encodeURIComponent(senderName)}`
    );

    const replies = Array.isArray(res.data.response)
      ? res.data.response
      : [res.data.response];

    for (const rep of replies) {
      await new Promise(resolve => {
        api.sendMessage(
          rep,
          event.threadID,
          (err, info) => {
            if (!err && info) {
              global.GoatBot.onReply.set(info.messageID, {
                commandName: exports.config.name,
                author: event.senderID,
                type: "simsimi"
              });
            }

            resolve();
          },
          event.messageID
        );
      });
    }
  } catch (err) {
    return api.sendMessage(
      `Error: ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
};

exports.onChat = async function ({ api, event, users }) {
  try {
    const raw = event.body
      ? event.body.toLowerCase().trim()
      : "";

    if (!raw) return;

    const senderName = await users.getName(event.senderID);
    const senderID = event.senderID;

    const simsim = await getMainAPI();

    const greetings = [
      "বেশি bot Bot করলে leave নিবো কিন্তু😒😒",
      "শুনবো না😼 তুমি আমার বস মারুফ কে প্রেম করাই দাও নাই🥺পচা তুমি🥺",
      "আমি আবাল দের সাথে কথা বলি না,ok😒",
      "এতো ডেকো না,প্রেম এ পরে যাবো তো🙈",
      "Bolo Babu, তুমি কি আমার বস মারুফ কে ভালোবাসো? 🙈💋",
      "বার বার ডাকলে মাথা গরম হয়ে যায় কিন্তু😑",
      "হ্যা বলো😒, তোমার জন্য কি করতে পারি😐😑?",
      "এতো ডাকছিস কেন?গালি শুনবি নাকি? 🤬",
      "I love you janu🥰",
      "আরে Bolo আমার জান ,কেমন আছো?😚",
      "আজ বট বলে অসম্মান করছি,😰😿",
      "Hop beda😾,Boss বল boss😼",
      "চুপ থাক ,নাই তো তোর দাত ভেগে দিবো কিন্তু",
      "আমাকে না ডেকে মেয়ে হলে মারুফের ইনবক্সে চলে যা 🌚😂 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/profile.php?id=61594013413183",
      "আমাকে না ডেকে মারুফ কে প্রপোজ কর 😘🌸",
      "বার বার Disturb করছিস কোনো😾,আমার জানুর সাথে ব্যাস্ত আছি😋",
      "আরে বলদ এতো ডাকিস কেন🤬",
      "আমারে এতো ডাকিস না আমি মজা করার mood এ নাই এখন😒",
      "দূরে যা, তোর কোনো কাজ নাই, শুধু bot bot করিস 😉😋🤣",
      "তোর কথা তোর বাড়ি কেউ শুনে না ,তো আমি কোনো শুনবো ?🤔😂",
      "আমাকে ডেকো না,আমি ইশরাতের সাথে ব্যাস্ত আছি",
      "কি হলো , মিস্টেক করচ্ছিস নাকি🤣",
      "বলো কি বলবা, সবার সামনে বলবা নাকি?🤭🤏",
      "জান মেয়ে হলে মারুফের ইনবক্সে চলে যাও 😍🫣💕 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/profile.php?id=61594013413183",
      "কালকে দেখা করিস তো একটু 😈",
      "হা বলো, শুনছি আমি 😏",
      "আর কত বার ডাকবি ,শুনছি তো",
      "হুম বলো কি বলবে😒",
      "বলো কি করতে পারি তোমার জন্য",
      "আমি তো অন্ধ কিছু দেখি না🐸 😎",
      "আরে বোকা বট না জানু বল জানু😌",
      "বলো জানু 🌚",
      "তোর কি চোখে পড়ে না আমি ব্যাস্ত আছি😒",
      "হুম জান তোমার ওই খানে উম্মহ😑😘",
      "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
      "jang hanga korba😒😬",
      "হুম জান তোমার অইখানে উম্মমাহ😷😘",
      "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি..!🥰",
      "আমাকে এতো না ডেকে মারুফ কে একটা GF দে'হহহ 🙄",
      "আমাকে এতো না ডেকছ কেন ভলো টালো বাসো নাকি🤭🙈",
      "🌻🌺💚-আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ-💚🌺🌻",
      "আমি এখন বস মারুফ এর সাথে বিজি আছি আমাকে ডাকবেন না-😕😏 ধন্যবাদ-🤝🌻",
      "আমাকে না ডেকে আমার বস মারুফ কে একটা জি এফ দাও-😽🫶🌺",
      "উফফ বুঝলাম না এতো ডাকছেন কেনো-😤😡😈",
      "জান তোমার বান্ধবী রে আমার বস মারুফের হাতে তুলে দিবা-🙊🙆‍♂",
      "আজকে আমার মন ভালো নেই তাই আমারে ডাকবেন না-😪🤧",
      "চুনা ও চুনা আমার বস মারুফ এর হবু বউ রে কেও দেকছো খুজে পাচ্ছি না😪🤧😭",
      "স্বপ্ন তোমারে নিয়ে দেখতে চাই তুমি যদি আমার হয়ে থেকে যাও-💝🌺🌻",
      "জান হাঙ্গা করবা-🙊😝🌻",
      "জান মেয়ে হলে চিপায় আসো বস মারুফের থেকে অনেক ভালোবাসা শিখছি তোমার জন্য-🙊🙈😽",
      "ইসস এতো ডাকো কেনো লজ্জা লাগে তো-🙈🖤🌼",
      "আমার বস মারুফের পক্ষ থেকে তোমারে এতো এতো ভালোবাসা-🥰😽🫶 আমার বস মারুফ এর জন্য দোয়া করবেন-💝💚🌺🌻",
      "আমার জান তুমি শুধু আমার আমি তোমারে ৩৬৫ দিন ভালোবাসি-💝🌺😽",
      "কিরে প্রেম করবি তাহলে মারুফের ইনবক্সে গুতা দে 😘🤌 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/profile.php?id=61594013413183",
      "জান আমার বস মারুফ কে বিয়ে করবা-🙊😘🥳",
      "oii-🥺🥹-এক🥄 চামচ ভালোবাসা দিবা-🤏🏻🙂",
      "-আপনার সুন্দরী বান্ধুবীকে ফিতরা হিসেবে আমার বস মারুফ কে দান করেন-🥱🐰🍒",
      "-ও মিম ও মিম-😇-তুমি কেন চুরি করলা সাদিয়ার ফর্সা হওয়ার ক্রীম-🌚🤧",
      "-অনুমতি দিলাম-𝙋𝙧𝙤𝙥𝙤𝙨𝙚 কর মারুফ কে-🐸😾🔪",
      "-𝗢𝗶𝗶 আন্টি-🙆‍♂️-তোমার মেয়ে চোখ মারে-🥺🥴🐸",
      "তাকাই আছো কেন চুমু দিবা-🙄🐸😘",
      "আজকে প্রপোজ করে দেখো রাজি হইয়া যামু-😌🤗😇",
      "-আমার গল্পে তোমার নানি সেরা-🙊🙆‍♂️🤗",
      "কি বেপার আপনি শ্বশুর বাড়িতে যাচ্ছেন না কেন-🤔🥱🌻",
      "দিনশেষে পরের 𝐁𝐎𝐖 সুন্দর-☹️🤧",
      "-তাবিজ কইরা হইলেও ফ্রেম এক্কান করমুই তাতে যা হই হোক-🤧🥱🌻",
      "-ছোটবেলা ভাবতাম বিয়ে করলে অটোমেটিক বাচ্চা হয়-🥱-ওমা এখন দেখি কাহিনী অন্যরকম-😦🙂🌻",
      "প্রেম করতে চাইলে মারুফের ইনবক্সে চলে যা 😏🐸 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/profile.php?id=61594013413183",
      "-আজ একটা বিন নেই বলে ফেসবুকের নাগিন-🤧-গুলোরে আমার বস মারুফ ধরতে পারছে না-🐸🥲",
      "—যে ছেড়ে গেছে-😔-তাকে ভুলে যাও-🙂-মারুফের সাথে প্রেম করে তাকে দেখিয়ে দাও-🙈🐸🤗",
      "—হাজারো লুচ্চা লুচ্চির ভিরে-🙊🥵আমার বস মারুফ এক নিস্পাপ ভালো মানুষ-🥱🤗🙆‍♂️",
      "-রূপের অহংকার করো না-🙂❤️চকচকে সূর্যটাও দিনশেষে অন্ধকারে পরিণত হয়-🤗💜",
      "সুন্দর মাইয়া মানেই-🥱আমার বস মারুফের বউ-😽🫶আর বাকি গুলো আমার বেয়াইন-🙈🐸🤗",
      "এত অহংকার করে লাভ নেই-🌸মৃত্যুটা নিশ্চিত শুধু সময়টা অ'নিশ্চিত-🖤🙂",
      "-দিন দিন কিছু মানুষের কাছে অপ্রিয় হয়ে যাইতেছি-🙂😿🌸",
      "ভালোবাসার নামক আবলামি করতে চাইলে মারুফের ইনবক্সে গুতা দিন🤣😼",
      "মেয়ে হলে মারুফের ইনবক্সে চলে যা 🤭🤣😼 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐋𝐢𝐧𝐤 : https://www.facebook.com/profile.php?id=61594013413183",
      "হুদাই আমারে শয়তানে লারে-😝😑☹️",
      "-ইস কেউ যদি বলতো-🙂-আমার শুধু তোমাকেই লাগবে-💜🌸",
      "-একদিন সে ঠিকই ফিরে তাকাবে-😇-আর মুচকি হেসে বলবে ওর মতো আর কেউ ভালবাসেনি-🙂😅",
      "-হুদাই গ্রুপে আছি-🥺🐸-কেও ইনবক্সে নক দিয়ে বলে না জান তোমারে আমি অনেক ভালোবাসি-🥺🤧",
      "কি'রে গ্রুপে দেখি একটাও বেডি নাই-🤦‍🥱💦",
      "-দেশের সব কিছুই চুরি হচ্ছে-🙄-শুধু মারুফের মনটা ছাড়া-🥴😑😏",
      "-🫵তোমারে প্রচুর ভাল্লাগে-😽-সময় মতো প্রপোজ করমু বুঝছো-🔨😼-ছিট খালি রাইখো- 🥱🐸🥵",
      "-আজ থেকে আর কাউকে পাত্তা দিমু না -!😏-কারণ আমি ফর্সা হওয়ার ক্রিম কিনছি -!🙂🐸"
    ];

    if (
      raw === "baby" ||
      raw === "bot" ||
      raw === "bby" ||
      raw === "jan" ||
      raw === "xan" ||
      raw === "জান" ||
      raw === "বট" ||
      raw === "বেবি"
    ) {
      const randomReply =
        greetings[Math.floor(Math.random() * greetings.length)];

      return api.sendMessage(
        randomReply,
        event.threadID,
        (err, info) => {
          if (!err && info) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: exports.config.name,
              author: senderID,
              type: "simsimi"
            });
          }
        },
        event.messageID
      );
    }

    if (
      raw.startsWith("baby ") ||
      raw.startsWith("bot ") ||
      raw.startsWith("bby ") ||
      raw.startsWith("jan ") ||
      raw.startsWith("xan ") ||
      raw.startsWith("জান ") ||
      raw.startsWith("বট ") ||
      raw.startsWith("বেবি ")
    ) {
      const query = raw
        .replace(
          /^baby\s+|^bot\s+|^bby\s+|^jan\s+|^xan\s+|^জান\s+|^বট\s+|^বেবি\s+/i,
          ""
        )
        .trim();

      if (!query) return;

      const res = await axios.get(
        `${simsim}/simsimi?text=${encodeURIComponent(query)}&senderName=${encodeURIComponent(senderName)}`
      );

      const replies = Array.isArray(res.data.response)
        ? res.data.response
        : [res.data.response];

      for (const rep of replies) {
        await new Promise(resolve => {
          api.sendMessage(
            rep,
            event.threadID,
            (err, info) => {
              if (!err && info) {
                global.GoatBot.onReply.set(info.messageID, {
                  commandName: exports.config.name,
                  author: senderID,
                  type: "simsimi"
                });
              }

              resolve();
            },
            event.messageID
          );
        });
      }
    }
  } catch {}
};