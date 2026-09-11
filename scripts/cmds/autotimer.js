const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const cacheFullPath = path.resolve(__dirname, "cache", "autotimer");

function ensureCacheDir() {
  try {
    if (typeof cacheFullPath === "string") {
      fs.ensureDirSync(cacheFullPath);
    }
  } catch (e) {
    console.log("[AutoTimer] Failed to create cache dir:", e.message);
  }
}

const timerData = {
  "12:00 AM": {
    text: `╭━━━〔 🌙 গভীর রাত 〕━━━╮

🌌 রাতের এই নীরবতা আল্লাহর এক অপূর্ব নিয়ামত।
🤲 একটু জিকির করুন, দোয়া করুন এবং শান্তিতে বিশ্রাম নিন।

﴾ سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ ﴿

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/7ch5ym.mp4"
  },
  "01:00 AM": {
    text: `╭━━━〔 🌌 রাত ১টা 〕━━━╮

✨ তারাভরা আকাশ সাক্ষী—আল্লাহর সৃষ্টি কত নিখুঁত!
😴 সুস্থ থাকার জন্য এখন বিশ্রাম নিন।

﴾ الْحَمْدُ لِلّٰهِ ﴿

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/rqnlpt.mp4"
  },
  "02:00 AM": {
    text: `╭━━━〔 🌠 রাত ২টা 〕━━━╮

🍃 প্রকৃতির নীরবতা আমাদের শেখায়,
সব নিয়ামতই মহান আল্লাহর পক্ষ থেকে।

🤲 আলহামদুলিল্লাহ

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/ev7guv.mp4"
  },
  "03:00 AM": {
    text: `╭━━━〔 🌃 রাত ৩টা 〕━━━╮

🌙 রাতের শেষ প্রহর—
আল্লাহকে স্মরণ করার এক সুন্দর সময়।

﴾ أَسْتَغْفِرُ اللّٰهَ ﴿

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/rijx8m.mp4"
  },
  "04:30 AM": {
    text: `╭━━━〔 🌅 𝐅𝐀𝐉𝐑 • ফজরের সময় 〕━━━╮

﴾ ﷽ ﴿

اَلصَّلَاةُ خَيْرٌ مِّنَ النَّوْمِ

🤲 আর কিছুক্ষণ পর ফজরের নামাজের সময় হবে।
🕌 সবাই অজু করে নামাজের জন্য প্রস্তুতি নিন।

اللَّهُمَّ اجْعَلْنَا مِنَ الْمُقِيمِينَ لِلصَّلَاةِ

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/ee9khu.mp4"
  },
  "06:00 AM": {
    text: `╭━━━〔 ☀️ শুভ সকাল 〕━━━╮

🌿 নতুন সূর্যের আলো আল্লাহর অশেষ রহমতের নিদর্শন।
✨ আলহামদুলিল্লাহ বলে দিনটি শুরু হোক।

🤍 আল্লাহ সবাইকে হেফাজত করুন।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/otdztt.mp4"
  },
  "07:00 AM": {
    text: `╭━━━〔 🌸 সকাল ৭টা 〕━━━╮

🍀 সকালের নির্মল বাতাস,
সবুজ প্রকৃতি আর আল্লাহর অশেষ নিয়ামত।

💚 হাসিমুখে দিন শুরু করুন।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/q6b7fo.mp4"
  },
  "08:00 AM": {
    text: `╭━━━〔 🌤️ সকাল ৮টা 〕━━━╮

🌱 প্রতিটি নতুন সকাল
আল্লাহর দেওয়া একটি নতুন সুযোগ।

✨ নেক আমলে কাটুক আজকের দিন।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/jxa3ka.mp4"
  },
  "09:00 AM": {
    text: `╭━━━〔 🌞 সকাল ৯টা 〕━━━╮

🌳 প্রকৃতির সৌন্দর্য দেখুন,
আল্লাহর সৃষ্টি নিয়ে চিন্তা করুন।

🤲 আলহামদুলিল্লাহ

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/wtu9vw.mp4"
  },
  "10:00 AM": {
    text: `╭━━━〔 🌼 সকাল ১০টা 〕━━━╮

🌺 ফুল, আকাশ আর সবুজ পৃথিবী—
সবই মহান আল্লাহর সৃষ্টি।

🤍 শুকরিয়া আল্লাহ।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/guv0tc.mp4"
  },
  "11:00 AM": {
    text: `╭━━━〔 🌿 সকাল ১১টা 〕━━━╮

🍃 ব্যস্ততার মাঝেও
আল্লাহর অগণিত নিয়ামতের জন্য
শুকরিয়া আদায় করুন।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/aecxiz.mp4"
  },
  "12:00 PM": {
    text: `╭━━━〔 ☀️ দুপুর ১২টা 〕━━━╮

🌏 সুন্দর এই পৃথিবী
মহান আল্লাহর এক অসীম নিয়ামত।

💚 সবার জন্য দোয়া রইল।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/wrc15v.mp4"
  },
  "01:00 PM": {
    text: `╭━━━〔 🕌 𝐙𝐔𝐇𝐑 • যোহরের সময় 〕━━━╮

﴾ ﷽ ﴿

حَيَّ عَلَى الصَّلَاةِ

🤲 আর কিছুক্ষণ পর যোহরের নামাজের সময় হবে।
🕌 সবাই নামাজের জন্য প্রস্তুতি নিন।

رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/c5qbek.mp4"
  },
  "02:00 PM": {
    text: `╭━━━〔 🌳 দুপুর ২টা 〕━━━╮

🍃 প্রকৃতির মাঝে কিছুটা সময় কাটান।
🤲 সর্বদা আল্লাহর ওপর ভরসা রাখুন।

﴾ حَسْبُنَا اللَّهُ ﴿

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/vgecfk.mp4"
  },
  "03:00 PM": {
    text: `╭━━━〔 🌅 বিকেল ৩টা 〕━━━╮

🍂 বিকেলের মৃদু হাওয়া
মনে করিয়ে দেয়—
আল্লাহর প্রতিটি সৃষ্টি সৌন্দর্যময়।

🤍 আলহামদুলিল্লাহ

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/iddna6.mp4"
  },
  "04:30 PM": {
    text: `╭━━━〔 🕌 𝐀𝐒𝐑 • আসরের সময় 〕━━━╮

﴾ ﷽ ﴿

إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا

🤲 আর কিছুক্ষণ পর আসরের নামাজের সময় হবে।
🕌 সবাই নামাজের জন্য প্রস্তুতি নিন।

اللَّهُمَّ تَقَبَّلْ مِنَّا

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/vcgbxq.mp4"
  },
  "06:30 PM": {
    text: `╭━━━〔 🌇 𝐌𝐀𝐆𝐇𝐑𝐈𝐁 • মাগরিবের সময় 〕━━━╮

﴾ ﷽ ﴿

الله أكبر، الله أكبر

🤲 আর কিছুক্ষণ পর মাগরিবের নামাজের সময় হবে।
🕌 সবাই অজু করে নামাজের জন্য প্রস্তুতি নিন।

اللَّهُمَّ تَقَبَّلْ مِنَّا

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/y8pnz7.mp4"
  },
  "08:00 PM": {
    text: `╭━━━〔 🌙 𝐈𝐒𝐇𝐀 • এশার সময় 〕━━━╮

﴾ ﷽ ﴿

بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ

🤲 আর কিছুক্ষণ পর এশার নামাজের সময় হবে।
🕌 সবাই নামাজের জন্য প্রস্তুতি নিন।

آمِين يَا رَبَّ الْعَالَمِينَ

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/rpnut9.mp4"
  },
  "09:00 PM": {
    text: `╭━━━〔 🌙 রাত ৯টা 〕━━━╮

✨ রাতের শান্ত আকাশ
আল্লাহর অসীম মহিমার সাক্ষী।

🤲 আজকের সকল নিয়ামতের জন্য
শুকরিয়া আদায় করুন।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/fpac7y.mp4"
  },
  "10:00 PM": {
    text: `╭━━━〔 🌌 রাত ১০টা 〕━━━╮

🌠 আল্লাহর হেফাজতের দোয়া করে
শান্তিতে বিশ্রাম নিন।

🤍 শুভ রাত্রি।

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/e7v8en.mp4"
  },
  "11:00 PM": {
    text: `╭━━━〔 🌃 রাত ১১টা 〕━━━╮

🌙 নীরব রাত, শীতল বাতাস
আর আল্লাহর রহমত।

🤲 আগামী দিনটি হোক
কল্যাণময় ও বরকতময়।

✨ آمين يا رب العالمين ✨

╰━━━━━━━━━━━━━━━━━━━╯`,
    video: "https://files.catbox.moe/7bas7j.mp4"
  }
};

let sentMap = new Map();
let interval = null;

module.exports = {
  config: {
    name: "autotimer",
    version: "2.3",
    author: "Riyad (Upgraded)",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Auto Islamic Timer"
    },
    longDescription: {
      en: "Sends automatic time-based Islamic messages with video"
    },
    category: "system",
    guide: {
      en: "{pn} on / off / status / next / reload / list"
    }
  },

  onStart: async function ({ message, args, event, threadsData }) {
    const threadID = event.threadID;
    const sub = (args[0] || "").toLowerCase();

    switch (sub) {
      case "on": {
        await threadsData.set(threadID, true, "data.autoTimer");
        return message.reply("✅ এই গ্রুপে AutoTimer ON করা হয়েছে।");
      }

      case "off": {
        await threadsData.set(threadID, false, "data.autoTimer");
        return message.reply("❌ এই গ্রুপে AutoTimer OFF করা হয়েছে।");
      }

      case "status": {
        // FIX: guard against threadsData.get() throwing or returning
        // undefined for a thread with no stored data yet — default to ON.
        let threadData;
        try {
          threadData = await threadsData.get(threadID);
        } catch (e) {
          threadData = null;
        }
        const isOn = threadData?.data?.autoTimer !== false;
        return message.reply(`📊 AutoTimer Status: ${isOn ? "ON ✅" : "OFF ❌"}`);
      }

      case "next": {
        // Shows the next upcoming timer slot and how long until it fires,
        // so admins don't have to guess which slots exist or wait blindly.
        const now = moment().tz("Asia/Dhaka");

        const upcoming = Object.keys(timerData)
          .map((label) => {
            const slot = moment.tz(label, "hh:mm A", "Asia/Dhaka");
            let target = now.clone().set({
              hour: slot.hour(),
              minute: slot.minute(),
              second: 0,
              millisecond: 0
            });
            if (target.isSameOrBefore(now)) target.add(1, "day");
            return { label, target };
          })
          .sort((a, b) => a.target.valueOf() - b.target.valueOf())[0];

        const diffMin = upcoming.target.diff(now, "minutes");
        const hours = Math.floor(diffMin / 60);
        const mins = diffMin % 60;
        const remaining = hours > 0 ? `${hours} ঘণ্টা ${mins} মিনিট` : `${mins} মিনিট`;

        return message.reply(
          `⏳ পরবর্তী টাইমার ➜ ${upcoming.label}\n🕒 বাকি সময় ➜ প্রায় ${remaining}`
        );
      }

      case "reload": {
        // Deletes the cached video for the CURRENT slot only, forcing a
        // fresh re-download on the next matching tick — useful if a
        // download got corrupted or the source video changed.
        const now = moment().tz("Asia/Dhaka").format("hh:mm A");
        const videoFileName = now.replace(/[: ]/g, "_") + ".mp4";
        const videoFullPath = path.resolve(cacheFullPath, videoFileName);

        try {
          if (fs.existsSync(videoFullPath)) {
            fs.removeSync(videoFullPath);
            return message.reply(`♻️ ক্যাশ রিলোড করা হয়েছে (${now})। পরের বার নতুন ভিডিও ডাউনলোড হবে।`);
          }
          return message.reply(`ℹ️ এই স্লটের (${now}) জন্য কোনো ক্যাশ করা ভিডিও পাওয়া যায়নি।`);
        } catch (e) {
          return message.reply("⚠️ রিলোড করতে সমস্যা হয়েছে: " + e.message);
        }
      }

      case "list": {
        const slots = Object.keys(timerData).join(", ");
        return message.reply(`🗒️ সকল টাইমার স্লট:\n${slots}`);
      }

      default: {
        return message.reply(
          "📌 ব্যবহার করুন:\n" +
          "• autotimer on — এই গ্রুপে চালু করুন\n" +
          "• autotimer off — এই গ্রুপে বন্ধ করুন\n" +
          "• autotimer status — বর্তমান অবস্থা দেখুন\n" +
          "• autotimer next — পরবর্তী টাইমার কখন দেখুন\n" +
          "• autotimer reload — বর্তমান স্লটের ক্যাশ রিসেট করুন\n" +
          "• autotimer list — সব টাইমার স্লট দেখুন"
        );
      }
    }
  },

  onLoad: function ({ api, threadsData }) {
    if (interval) return;

    // Directory creation happens here, on the first tick — never during
    // require() — and is wrapped so a failure here only skips this cycle
    // instead of preventing the whole command from loading.
    ensureCacheDir();

    console.log("[AutoTimer] Started successfully!");

    interval = setInterval(async () => {
      try {
        ensureCacheDir(); // safe to call repeatedly; ensureDirSync is a no-op if it already exists

        const now = moment().tz("Asia/Dhaka").format("hh:mm A");
        const today = moment().tz("Asia/Dhaka").format("DD-MM-YYYY");
        const data = timerData[now];

        if (!data) return;

        // FIX: the old key was a broken template literal
        // (`\( {today}_ \){now}`) that never actually interpolated
        // `today`/`now` — it produced the exact same literal string every
        // time, so after the very first send, sentMap.has(key) was always
        // true and no further times ever went out.
        const key = `${today}_${now}`;
        if (sentMap.has(key)) return;
        sentMap.set(key, true);

        if (sentMap.size > 40) sentMap.clear();

        if (typeof now !== "string" || typeof cacheFullPath !== "string") {
          console.log("[AutoTimer] now/cacheFullPath not a string, skipping this tick.");
          return;
        }

        const videoFileName = now.replace(/[: ]/g, "_") + ".mp4";
        const videoFullPath = path.resolve(cacheFullPath, videoFileName);

        if (typeof videoFullPath !== "string") {
          console.log("[AutoTimer] videoFullPath failed to resolve to a string, skipping.");
          return;
        }

        // Download video
        if (!fs.existsSync(videoFullPath)) {
          try {
            const res = await axios.get(data.video, {
              responseType: "arraybuffer",
              timeout: 60000
            });
            fs.writeFileSync(videoFullPath, Buffer.from(res.data));
          } catch (e) {
            console.log("[AutoTimer] Video download error:", e.message);
            return;
          }
        }

        // Guard: make sure the file actually exists and is a string path
        // before we ever hand it to fs.createReadStream / api.sendMessage.
        if (!fs.existsSync(videoFullPath)) {
          console.log("[AutoTimer] videoFullPath missing after download attempt, skipping send.");
          return;
        }

        const body =
`🕒 𝐓𝐈𝐌𝐄 ➜ ${now}
📅 𝐃𝐀𝐓𝐄 ➜ ${today}

${data.text}

    👑 𝐌𝐚𝐑𝐮𝐅'𝐬 𝐁𝐨𝐓 💫🪽`;

        // Get all groups
        let threads = [];
        try {
          threads = await api.getThreadList(200, null, ["INBOX"]);
        } catch (e) {
          return;
        }

        const groups = threads.filter(t => t.isGroup);

        for (const thread of groups) {
          try {
            // Respect per-thread on/off state (default = ON if never set)
            let enabled = true;
            try {
              const td = await threadsData.get(thread.threadID);
              enabled = td?.data?.autoTimer !== false;
            } catch (e) {
              // if thread data can't be read, default to sending
            }
            if (!enabled) continue;

            await api.sendMessage({
              body,
              attachment: fs.createReadStream(videoFullPath)
            }, thread.threadID);

            await new Promise(r => setTimeout(r, 1000)); // anti spam
          } catch (err) {
            // ignore individual errors
          }
        }

        console.log(`[AutoTimer] Sent → ${now}`);
      } catch (err) {
        console.log("[AutoTimer] Main error:", err.message);
      }
    }, 30000); // 30 seconds
  }
};