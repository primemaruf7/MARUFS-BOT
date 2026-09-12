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

const prayerNames = {
  "04:30 AM": "ফজরের",
  "01:00 PM": "যোহরের",
  "04:30 PM": "আসরের",
  "06:30 PM": "মাগরিবের",
  "08:00 PM": "এশার"
};

const timerData = {
  "12:00 AM": {
    text: `🌌 রাতের নীরবতা মনে করিয়ে দেয়—
আল্লাহর সৃষ্টি কত সুন্দর।

🤲 একটু জিকির করুন, দোয়া করুন
এবং শান্তিতে বিশ্রাম নিন।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/7ch5ym.mp4"
  },

  "01:00 AM": {
    text: `✨ তারাভরা আকাশ আর নীরব রাত—
সৃষ্টিকর্তার অসীম কুদরতের নিদর্শন।

🤲 নিজের জন্য ও প্রিয়জনদের জন্য
দোয়া করতে ভুলবেন না।

😴 এবার একটু বিশ্রাম নিন।`,
    video: "https://files.catbox.moe/rqnlpt.mp4"
  },

  "02:00 AM": {
    text: `🍃 নীরব এই রাতও
আল্লাহর একটি সুন্দর নিয়ামত।

🤲 প্রতিটি নিয়ামতের জন্য
শুকরিয়া আদায় করুন।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/ev7guv.mp4"
  },

  "03:00 AM": {
    text: `🌙 রাতের শেষ প্রহর—
আল্লাহকে স্মরণ করার সুন্দর সময়।

🤲 বেশি বেশি ইস্তিগফার করুন
এবং নিজের জন্য দোয়া করুন।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/rijx8m.mp4"
  },

  "04:30 AM": {
    text: `🤲 আর কিছুক্ষণ পর ফজরের নামাজের সময় হবে।

🕌 অজু করে নামাজের জন্য
প্রস্তুত হয়ে নিন।

✨ দিনের শুরু হোক ইবাদত দিয়ে।`,
    video: "https://files.catbox.moe/ee9khu.mp4"
  },

  "06:00 AM": {
    text: `🌿 নতুন সকাল, নতুন একটি সুযোগ।

✨ আলহামদুলিল্লাহ বলে
আজকের দিনটি শুরু করুন।

🤍 আল্লাহ সবাইকে হেফাজত করুন।`,
    video: "https://files.catbox.moe/otdztt.mp4"
  },

  "07:00 AM": {
    text: `🍀 সকালের নির্মল বাতাস,
সবুজ প্রকৃতি আর সুন্দর পরিবেশ।

🤲 আল্লাহর প্রতিটি নিয়ামতের জন্য
শুকরিয়া আদায় করুন।

💚 হাসিমুখে দিন শুরু করুন।`,
    video: "https://files.catbox.moe/q6b7fo.mp4"
  },

  "08:00 AM": {
    text: `🌱 প্রতিটি নতুন সকাল
একটি নতুন সুযোগ নিয়ে আসে।

✨ ভালো কাজে এগিয়ে চলুন
এবং দিনটি সুন্দরভাবে কাটান।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/jxa3ka.mp4"
  },

  "09:00 AM": {
    text: `🌳 প্রকৃতির সৌন্দর্য দেখুন
এবং আল্লাহর সৃষ্টি নিয়ে চিন্তা করুন।

🤲 প্রতিটি মুহূর্তের জন্য
শুকরিয়া আদায় করুন।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/wtu9vw.mp4"
  },

  "10:00 AM": {
    text: `🌺 ফুল, আকাশ আর সবুজ পৃথিবী—
সবই আল্লাহর সুন্দর সৃষ্টি।

🤍 আজকের প্রতিটি নিয়ামতের জন্য
শুকরিয়া আদায় করুন।`,
    video: "https://files.catbox.moe/guv0tc.mp4"
  },

  "11:00 AM": {
    text: `🍃 ব্যস্ততার মাঝেও একটু থামুন।

🤲 আল্লাহর অগণিত নিয়ামতের জন্য
শুকরিয়া আদায় করুন।

✨ মনকে শান্ত রাখুন।`,
    video: "https://files.catbox.moe/aecxiz.mp4"
  },

  "12:00 PM": {
    text: `🌏 সুন্দর এই পৃথিবী
আল্লাহর এক অসীম নিয়ামত।

🤲 সবার জন্য দোয়া রইল।

💚 ভালো থাকুন, সুস্থ থাকুন।`,
    video: "https://files.catbox.moe/wrc15v.mp4"
  },

  "01:00 PM": {
    text: `🤲 আর কিছুক্ষণ পর যোহরের নামাজের সময় হবে।

🕌 সবাই নামাজের জন্য
প্রস্তুত হয়ে নিন।

✨ কাজের ব্যস্ততার মাঝেও
নামাজকে গুরুত্ব দিন।`,
    video: "https://files.catbox.moe/c5qbek.mp4"
  },

  "02:00 PM": {
    text: `🍃 একটু সময় নিয়ে প্রকৃতির সৌন্দর্য উপভোগ করুন।

🤲 সবসময় আল্লাহর ওপর ভরসা রাখুন।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/vgecfk.mp4"
  },

  "03:00 PM": {
    text: `🍂 বিকেলের মৃদু হাওয়া
মনে করিয়ে দেয়—
আল্লাহর প্রতিটি সৃষ্টি কত সুন্দর।

🤍 প্রতিটি নিয়ামতের জন্য
আলহামদুলিল্লাহ।`,
    video: "https://files.catbox.moe/iddna6.mp4"
  },

  "04:30 PM": {
    text: `🤲 আর কিছুক্ষণ পর আসরের নামাজের সময় হবে।

🕌 সবাই নামাজের জন্য
প্রস্তুতি নিয়ে নিন।

✨ দিনের ব্যস্ততার মাঝেও
নামাজের কথা মনে রাখুন।`,
    video: "https://files.catbox.moe/vcgbxq.mp4"
  },

  "06:30 PM": {
    text: `🤲 আর কিছুক্ষণ পর মাগরিবের নামাজের সময় হবে।

🕌 অজু করে নামাজের জন্য
প্রস্তুত হয়ে নিন।

🌙 দিনের শেষ আলোয়
আল্লাহকে স্মরণ করুন।`,
    video: "https://files.catbox.moe/y8pnz7.mp4"
  },

  "08:00 PM": {
    text: `🤲 আর কিছুক্ষণ পর এশার নামাজের সময় হবে।

🕌 সবাই নামাজের জন্য
প্রস্তুত হয়ে নিন।

✨ দিনের শেষ ইবাদতটি
সুন্দরভাবে আদায় করুন।`,
    video: "https://files.catbox.moe/rpnut9.mp4"
  },

  "09:00 PM": {
    text: `✨ রাতের শান্ত আকাশ
আল্লাহর অসীম কুদরত মনে করিয়ে দেয়।

🤲 আজকের সকল নিয়ামতের জন্য
শুকরিয়া আদায় করুন।

🤍 আলহামদুলিল্লাহ`,
    video: "https://files.catbox.moe/fpac7y.mp4"
  },

  "10:00 PM": {
    text: `🌠 আল্লাহর হেফাজতের ওপর
ভরসা রেখে শান্তিতে বিশ্রাম নিন।

🤲 আগামী দিনের জন্য
দোয়া করুন।

🤍 শুভ রাত্রি।`,
    video: "https://files.catbox.moe/e7v8en.mp4"
  },

  "11:00 PM": {
    text: `🌙 নীরব রাত, শীতল বাতাস
আর আল্লাহর রহমত।

🤲 আগামী দিনটি হোক
কল্যাণময় ও বরকতময়।

✨ শান্তিতে বিশ্রাম নিন।`,
    video: "https://files.catbox.moe/7bas7j.mp4"
  }
};

let sentMap = new Map();
let interval = null;

module.exports = {
  config: {
    name: "autotimer",
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
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
        let threadData;

        try {
          threadData = await threadsData.get(threadID);
        } catch (e) {
          threadData = null;
        }

        const isOn = threadData?.data?.autoTimer !== false;

        return message.reply(
          `📊 AutoTimer Status: ${isOn ? "ON ✅" : "OFF ❌"}`
        );
      }

      case "next": {
        const now = moment().tz("Asia/Dhaka");

        const upcoming = Object.keys(timerData)
          .map((label) => {
            const slot = moment.tz(
              label,
              "hh:mm A",
              "Asia/Dhaka"
            );

            let target = now.clone().set({
              hour: slot.hour(),
              minute: slot.minute(),
              second: 0,
              millisecond: 0
            });

            if (target.isSameOrBefore(now)) {
              target.add(1, "day");
            }

            return { label, target };
          })
          .sort(
            (a, b) =>
              a.target.valueOf() - b.target.valueOf()
          )[0];

        const diffMin = upcoming.target.diff(
          now,
          "minutes"
        );

        const hours = Math.floor(diffMin / 60);
        const mins = diffMin % 60;

        const remaining =
          hours > 0
            ? `${hours} ঘণ্টা ${mins} মিনিট`
            : `${mins} মিনিট`;

        return message.reply(
          `⏳ পরবর্তী টাইমার ➜ ${upcoming.label}\n🕒 বাকি সময় ➜ প্রায় ${remaining}`
        );
      }

      case "reload": {
        const now = moment()
          .tz("Asia/Dhaka")
          .format("hh:mm A");

        const videoFileName =
          now.replace(/[: ]/g, "_") + ".mp4";

        const videoFullPath =
          path.resolve(
            cacheFullPath,
            videoFileName
          );

        try {
          if (fs.existsSync(videoFullPath)) {
            fs.removeSync(videoFullPath);

            return message.reply(
              `♻️ ক্যাশ রিলোড করা হয়েছে (${now})। পরের বার নতুন ভিডিও ডাউনলোড হবে।`
            );
          }

          return message.reply(
            `ℹ️ এই স্লটের (${now}) জন্য কোনো ক্যাশ করা ভিডিও পাওয়া যায়নি।`
          );
        } catch (e) {
          return message.reply(
            "⚠️ রিলোড করতে সমস্যা হয়েছে: " +
            e.message
          );
        }
      }

      case "list": {
        const slots =
          Object.keys(timerData).join(", ");

        return message.reply(
          `🗒️ সকল টাইমার স্লট:\n${slots}`
        );
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

    ensureCacheDir();

    console.log(
      "[AutoTimer] Started successfully!"
    );

    interval = setInterval(async () => {
      try {
        ensureCacheDir();

        const now = moment()
          .tz("Asia/Dhaka")
          .format("hh:mm A");

        const today = moment()
          .tz("Asia/Dhaka")
          .format("DD-MM-YYYY");

        const data = timerData[now];

        if (!data) return;

        const key = `${today}_${now}`;

        if (sentMap.has(key)) return;

        sentMap.set(key, true);

        if (sentMap.size > 40) {
          sentMap.clear();
        }

        if (
          typeof now !== "string" ||
          typeof cacheFullPath !== "string"
        ) {
          console.log(
            "[AutoTimer] Invalid timer path data."
          );
          return;
        }

        const videoFileName =
          now.replace(/[: ]/g, "_") + ".mp4";

        const videoFullPath =
          path.resolve(
            cacheFullPath,
            videoFileName
          );

        if (!fs.existsSync(videoFullPath)) {
          try {
            const res = await axios.get(
              data.video,
              {
                responseType: "arraybuffer",
                timeout: 60000
              }
            );

            fs.writeFileSync(
              videoFullPath,
              Buffer.from(res.data)
            );
          } catch (e) {
            console.log(
              "[AutoTimer] Video download error:",
              e.message
            );
            return;
          }
        }

        if (!fs.existsSync(videoFullPath)) {
          console.log(
            "[AutoTimer] Video file not found."
          );
          return;
        }

        const prayerName =
          prayerNames[now];

        const title = prayerName
          ? `🕌 ${prayerName} নামাজের সময় হয়েছে`
          : `✨ আজকের সুন্দর সময়`;

        const footer = prayerName
          ? "🤲 সবাই নামাজ আদায় করুন"
          : "🤲 আল্লাহকে স্মরণ করুন";

        const body =
`━━━━━━━━━━━━━━━━━━
${title}
🕒 সময়: ${now}
📅 তারিখ: ${today}
━━━━━━━━━━━━━━━━━━

${data.text}

◢◤━━━━━━━━━━━━━━━━◥◣
🤖 𝐌𝐚𝐑𝐮𝐅'𝐬 𝐁𝐨𝐓 💫🪽
${footer}
◥◣━━━━━━━━━━━━━━━━◢◤`;

        let threads = [];

        try {
          threads = await api.getThreadList(
            200,
            null,
            ["INBOX"]
          );
        } catch (e) {
          return;
        }

        const groups = threads.filter(
          t => t.isGroup
        );

        for (const thread of groups) {
          try {
            let enabled = true;

            try {
              const td =
                await threadsData.get(
                  thread.threadID
                );

              enabled =
                td?.data?.autoTimer !== false;
            } catch (e) {
              enabled = true;
            }

            if (!enabled) continue;

            await api.sendMessage(
              {
                body,
                attachment:
                  fs.createReadStream(
                    videoFullPath
                  )
              },
              thread.threadID
            );

            await new Promise(
              resolve =>
                setTimeout(resolve, 1000)
            );
          } catch (err) {
          }
        }

        console.log(
          `[AutoTimer] Sent → ${now}`
        );
      } catch (err) {
        console.log(
          "[AutoTimer] Main error:",
          err.message
        );
      }
    }, 30000);
  }
};