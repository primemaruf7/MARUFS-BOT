module.exports = {
    config: {
        name: "fuck",
        version: "1.0.5",
        author: "𝗔𝗿𝗶𝘆𝗮𝗻 𝗯𝗯'𝘇",
        countDown: 5,
        role: 0, // ০ = সাধারণ ইউজার, ১ = গ্রুপ এডমিন, ২ = বট এডমিন
        shortDescription: "মেসেঞ্জার গ্রুপে বন্ধুদের ট্রল বা রোস্ট করার কমান্ড।",
        longDescription: "এই কমান্ডটির মাধ্যমে গ্রুপ চ্যাটে যেকোনো বন্ধুকে মেনশন করে মজার ছলে ট্রল বা রোস্ট করা যায়।",
        category: "fun",
        guide: "{p}fuck @mention"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID, mentions } = event;

        // যদি কাউকেই মেনশন না করা হয়
        if (Object.keys(mentions).length === 0) {
            return api.sendMessage(
                "বসেরা, কাকে রোস্ট করতে চান? কাউকে তো মেনশন (@) করলেন না! 🤦‍♂️", 
                threadID, 
                messageID
            );
        }

        // যাকে মেনশন করা হয়েছে তার আইডি ও নাম নেওয়া
        const mentionIDs = Object.keys(mentions);
        const targetID = mentionIDs[0];
        const targetName = mentions[targetID].replace("@", "");

        // নিজেকে নিজে টার্গেট করলে
        if (targetID === senderID) {
            return api.sendMessage(
                "নিজেকে নিজে রোস্ট করতে চান? এত শখ কেন ভাই! 😂", 
                threadID, 
                messageID
            );
        }

        // ফানি রোস্ট রেসপন্স লিস্ট
        const responses = [
            `💥 ওরে ওরে! ${targetName}, আপনার তো একদম বারোটা বেজে গেল! 🤫`,
            `🎯 ${targetName}, বসের নজরে পইড়া গেছেন। এখন পালানোর রাস্তা খোঁজেন! 😂`,
            `🤫 কী অবস্থা ${targetName}? গ্রুপে বেশি পন্ডিতি করার ফল হাতেনাতে পাইয়া গেলেন! 💥`
        ];

        const randomReply = responses[Math.floor(Math.random() * responses.length)];

        // মেসেজ পাঠানো
        return api.sendMessage(randomReply, threadID, messageID);
    }
};
          
