module.exports = {
 config: {
 name: "protect",
 version: "5.0",
 author: "𝐌𝐚𝐑𝐮𝐅 𝐱 𝐌𝐎𝐇𝐀𝐌𝐌𝐀𝐃 𝐀𝐊𝐀𝐒𝐇",
 role: 1,
 shortDescription: "Ultra Hard Lock - Name, Nick, Theme, Emoji",
 category: "group",
 guide: "{pn} on/off/status"
 },

 onStart: async ({ api, event, message, threadsData, args }) => {
 const { threadID } = event;
 if (!args[0]) return message.reply("⚠️ Usage:\n/protect on - Lock On\n/protect off - Lock Off\n/protect status - Check");

 if (args[0].toLowerCase() === "on") {
 const info = await api.getThreadInfo(threadID);
 const data = {
 enable: true,
 name: info.threadName,
 emoji: info.emoji,
 color: info.color,
 image: info.imageSrc,
 nickname: {},
 time: Date.now(),
 author: event.senderID
 };
 for (const m of info.participantIDs) {
 try {
 const nick = info.nicknames[m] || "";
 data.nickname[m] = nick;
 } catch {}
 }
 await threadsData.set(threadID, data, "data.protect");
 return message.reply(
 "╭───『 🛡️ ULTRA PROTECT ON 』───╮\n" +
 "│ 🔒 Name Lock: ON\n" +
 "│ 🔒 Emoji Lock: ON\n" +
 "│ 🔒 Theme Lock: ON\n" +
 "│ 🔒 Nickname Lock: ON [HARD]\n" +
 "│ ⚡ Action: Instant Revert + Warn\n" +
 "╰──────────────────────╯"
 );
 }

 if (args[0].toLowerCase() === "off") {
 await threadsData.set(threadID, { enable: false }, "data.protect");
 return message.reply("🔓 Protect OFF - All Locks Disabled");
 }

 if (args[0].toLowerCase() === "status") {
 const d = await threadsData.get(threadID, "data.protect");
 if (!d?.enable) return message.reply("🔓 Protect is OFF");
 return message.reply(`🛡️ Protect ON\n📌 Name: ${d.name}\n😀 Emoji: ${d.emoji}\n🎨 Theme: ${d.color}\n👥 Nick Locked: ${Object.keys(d.nickname).length} users`);
 }
 },

 onEvent: async ({ api, event, threadsData }) => {
 const { threadID, logMessageType, logMessageData, author } = event;
 if (!logMessageType) return;

 const protect = await threadsData.get(threadID, "data.protect");
 if (!protect?.enable) return;
 if (!logMessageData) return;

 const botID = api.getCurrentUserID();
 if (author == botID) return;

 const info = await api.getThreadInfo(threadID);
 const isAdmin = info.adminIDs.some(e => e.id == author);

 // === NON-ADMIN = REVERT HARD ===
 if (!isAdmin) {
 // 1. Name Protect
 if (logMessageType === "log:thread-name") {
 await api.setTitle(protect.name, threadID);
 return api.sendMessage(`⚠️ @${author} Name Change Detected! Reverted.\n🔒 Protect is ON`, threadID, null, { mentions: [{ tag: `@${author}`, id: author }] });
 }
 // 2. Emoji Protect
 if (logMessageType === "log:thread-icon") {
 await api.changeThreadEmoji(protect.emoji, threadID);
 return api.sendMessage(`⚠️ @${author} Emoji Change Detected! Reverted.`, threadID, null, { mentions: [{ tag: `@${author}`, id: author }] });
 }
 // 3. Theme/Color Protect
 if (logMessageType === "log:thread-color") {
 if (protect.color) await api.changeThreadColor(protect.color, threadID);
 return api.sendMessage(`⚠️ @${author} Theme Change Detected! Reverted.`, threadID, null, { mentions: [{ tag: `@${author}`, id: author }] });
 }
 // 4. Nickname Hard Protect
 if (logMessageType === "log:user-nickname") {
 const uid = logMessageData.participant_id;
 const oldNick = protect.nickname[uid] || "";
 await api.changeNickname(oldNick, threadID, uid);
 return api.sendMessage(`⚠️ @${author} Nickname Change Detected!\nVictim: ${uid}\nReverted to: ${oldNick || "Original"}`, threadID, null, { mentions: [{ tag: `@${author}`, id: author }] });
 }
 // 5. Image Protect (if someone changes group photo)
 if (logMessageType === "log:thread-image") {
 return api.sendMessage(`⚠️ @${author} Group Image Changed! Admin Only.`, threadID, null, { mentions: [{ tag: `@${author}`, id: author }] });
 }
 }

 // === ADMIN CHANGED = UPDATE DB (Auto Save) ===
 if (isAdmin) {
 if (logMessageType === "log:thread-name") {
 await threadsData.set(threadID, logMessageData.name, "data.protect.name");
 }
 if (logMessageType === "log:thread-icon") {
 await threadsData.set(threadID, logMessageData.thread_icon, "data.protect.emoji");
 }
 if (logMessageType === "log:thread-color") {
 const newColor = logMessageData.theme_id || logMessageData.theme_color || info.color;
 await threadsData.set(threadID, newColor, "data.protect.color");
 }
 if (logMessageType === "log:user-nickname") {
 await threadsData.set(threadID, logMessageData.nickname || "", `data.protect.nickname.${logMessageData.participant_id}`);
 }
 }
 }
};