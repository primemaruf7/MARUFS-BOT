const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "setting",
    version: "1.0.0",
    author: "𝐌𝐚𝐑𝐮𝐅",
    countDown: 5,
    role: 2,
    shortDescription: "Bot settings",
    longDescription: "Control bot settings",
    category: "admin",
    guide: "{prefix}setting"
  },

  onStart: async function ({ api, event, args, message }) {
    const mainMenu = [
      "╭─〔 ⚙️ 𝐁𝐨𝐭 𝐒𝐞𝐭𝐭𝐢𝐧𝐠𝐬 〕",
      "│",
      "│  ➊ 𝐁𝐨𝐭 𝐂𝐨𝐧𝐟𝐢𝐠",
      "│  ➋ 𝐀𝐝𝐦𝐢𝐧 𝐌𝐚𝐧𝐚𝐠𝐞",
      "│  ➌ 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 𝐌𝐚𝐧𝐚𝐠𝐞",
      "│  ➍ 𝐍𝐨 𝐏𝐫𝐞𝐟𝐢𝐱",
      "│  ➎ 𝐑𝐞𝐚𝐜𝐭 𝐔𝐧𝐬𝐞𝐧𝐝",
      "│  ➏ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞",
      "│  ➐ 𝐅𝐂𝐀 𝐎𝐩𝐭𝐢𝐨𝐧𝐬",
      "│",
      "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟕 〕"
    ].join("\n");

    const sent = await message.reply(mainMenu);

    global.GoatBot.onReply.set(sent.messageID, {
      commandName: "setting",
      messageID: sent.messageID,
      author: event.senderID,
      state: "main"
    });
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { author, state } = Reply;

    if (event.senderID !== author) return;

    const configPath = path.join(process.cwd(), "config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    const input = event.body.trim();
    const num = parseInt(input);

    function saveConfig() {
      fs.writeFileSync(
        configPath,
        JSON.stringify(config, null, 2),
        "utf8"
      );
    }

    function status(val) {
      return val ? "● 𝐎𝐍" : "○ 𝐎𝐅𝐅";
    }

    async function sendAndListen(text, newState, extra = {}) {
      const sent = await message.reply(text);

      global.GoatBot.onReply.set(sent.messageID, {
        commandName: "setting",
        messageID: sent.messageID,
        author,
        state: newState,
        ...extra
      });
    }

    if (state === "main") {
      if (num === 1) {
        const menu = [
          "╭─〔 ⚙️ 𝐁𝐨𝐭 𝐂𝐨𝐧𝐟𝐢𝐠 〕",
          "│",
          `│  ➊ 𝐀𝐝𝐦𝐢𝐧 𝐎𝐧𝐥𝐲  ${status(config.adminOnly?.enable)}`,
          `│  ➋ 𝐀𝐮𝐭𝐨 𝐑𝐞𝐬𝐭𝐚𝐫𝐭  ${status(config.autoRestart?.enable)}`,
          `│  ➌ 𝐀𝐧𝐭𝐢 𝐈𝐧𝐛𝐨𝐱  ${status(config.antiInbox?.enable)}`,
          `│  ➍ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧 𝐁𝐨𝐱  ${status(config.onlyAdminBox)}`,
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟒 𝐭𝐨 𝐭𝐨𝐠𝐠𝐥𝐞 〕"
        ].join("\n");

        return await sendAndListen(menu, "botConfig");
      }

      if (num === 2) {
        const menu = [
          "╭─〔 👑 𝐀𝐝𝐦𝐢𝐧 𝐌𝐚𝐧𝐚𝐠𝐞 〕",
          "│",
          "│  ➊ 𝐀𝐝𝐝 𝐀𝐝𝐦𝐢𝐧",
          "│  ➋ 𝐑𝐞𝐦𝐨𝐯𝐞 𝐀𝐝𝐦𝐢𝐧",
          "│  ➌ 𝐋𝐢𝐬𝐭 𝐀𝐝𝐦𝐢𝐧𝐬",
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟑 〕"
        ].join("\n");

        return await sendAndListen(menu, "adminManage");
      }

      if (num === 3) {
        const menu = [
          "╭─〔 🛡️ 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 〕",
          "│",
          `│  ➊ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭  ${status(config.whiteListModeThread?.enable)}`,
          "│  ➋ 𝐀𝐝𝐝 𝐓𝐡𝐫𝐞𝐚𝐝",
          "│  ➌ 𝐑𝐞𝐦𝐨𝐯𝐞 𝐓𝐡𝐫𝐞𝐚𝐝",
          `│  ➍ 𝐔𝐬𝐞𝐫 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭  ${status(config.whiteListMode?.enable)}`,
          "│  ➎ 𝐀𝐝𝐝 𝐔𝐬𝐞𝐫",
          "│  ➏ 𝐑𝐞𝐦𝐨𝐯𝐞 𝐔𝐬𝐞𝐫",
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟔 〕"
        ].join("\n");

        return await sendAndListen(menu, "whitelist");
      }

      if (num === 4) {
        config.noPrefix = config.noPrefix || {};
        config.noPrefix.enable = !config.noPrefix.enable;
        saveConfig();

        return message.reply(
          `╭─〔 ✦ 𝐍𝐨 𝐏𝐫𝐞𝐟𝐢𝐱 〕\n│\n│  ${status(config.noPrefix.enable)}\n╰─`
        );
      }

      if (num === 5) {
        const menu = [
          "╭─〔 💫 𝐑𝐞𝐚𝐜𝐭 𝐔𝐧𝐬𝐞𝐧𝐝 〕",
          "│",
          `│  ➊ 𝐓𝐨𝐠𝐠𝐥𝐞  ${status(config.reactUnsend?.enable)}`,
          `│  ➋ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧  ${status(config.reactUnsend?.onlyAdmin)}`,
          "│  ➌ 𝐀𝐝𝐝 𝐄𝐦𝐨𝐣𝐢",
          "│  ➍ 𝐑𝐞𝐦𝐨𝐯𝐞 𝐄𝐦𝐨𝐣𝐢",
          "│  ➎ 𝐋𝐢𝐬𝐭 𝐄𝐦𝐨𝐣𝐢𝐬",
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟓 〕"
        ].join("\n");

        return await sendAndListen(menu, "reactUnsend");
      }

      if (num === 6) {
        const current = config.nickNameBot || "Not set";

        const menu = [
          "╭─〔 ✏️ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〕",
          "│",
          `│  ✦ 𝐂𝐮𝐫𝐫𝐞𝐧𝐭: ${current}`,
          "│",
          "│  ➊ 𝐒𝐞𝐭 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〔𝐓𝐡𝐢𝐬 𝐆𝐫𝐨𝐮𝐩〕",
          "│  ➋ 𝐒𝐞𝐭 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〔𝐀𝐥𝐥 𝐆𝐫𝐨𝐮𝐩𝐬〕",
          "│  ➌ 𝐑𝐞𝐬𝐞𝐭 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞",
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟑 〕"
        ].join("\n");

        return await sendAndListen(menu, "nickname");
      }

      if (num === 7) {
        const o = config.optionsFca || {};

        const menu = [
          "╭─〔 🔧 𝐅𝐂𝐀 𝐎𝐩𝐭𝐢𝐨𝐧𝐬 〕",
          "│",
          `│  ➊ 𝐀𝐮𝐭𝐨 𝐔𝐩𝐝𝐚𝐭𝐞      ${status(o.autoUpdate)}`,
          `│  ➋ 𝐋𝐢𝐬𝐭𝐞𝐧 𝐄𝐯𝐞𝐧𝐭𝐬     ${status(o.listenEvents)}`,
          `│  ➌ 𝐒𝐞𝐥𝐟 𝐋𝐢𝐬𝐭𝐞𝐧        ${status(o.selfListen)}`,
          `│  ➍ 𝐋𝐢𝐬𝐭𝐞𝐧 𝐓𝐲𝐩𝐢𝐧𝐠      ${status(o.listenTyping)}`,
          `│  ➎ 𝐔𝐩𝐝𝐚𝐭𝐞 𝐏𝐫𝐞𝐬𝐞𝐧𝐜𝐞   ${status(o.updatePresence)}`,
          `│  ➏ 𝐅𝐨𝐫𝐜𝐞 𝐋𝐨𝐠𝐢𝐧          ${status(o.forceLogin)}`,
          `│  ➐ 𝐀𝐮𝐭𝐨 𝐌𝐚𝐫𝐤 𝐑𝐞𝐚𝐝   ${status(o.autoMarkRead)}`,
          `│  ➑ 𝐀𝐮𝐭𝐨 𝐑𝐞𝐜𝐨𝐧𝐧𝐞𝐜𝐭  ${status(o.autoReconnect)}`,
          `│  ➒ 𝐄𝟐𝐄𝐄 𝐄𝐧𝐚𝐛𝐥𝐞𝐝     ${status(config.e2ee?.enable)}`,
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝟏–𝟗 𝐭𝐨 𝐭𝐨𝐠𝐠𝐥𝐞 〕"
        ].join("\n");

        return await sendAndListen(menu, "fcaOptions");
      }
    }

    if (state === "botConfig") {
      if (num === 1) {
        config.adminOnly = config.adminOnly || {};
        config.adminOnly.enable = !config.adminOnly.enable;
        saveConfig();
        return message.reply(`✦ 𝐀𝐝𝐦𝐢𝐧 𝐎𝐧𝐥𝐲 — ${status(config.adminOnly.enable)}`);
      }

      if (num === 2) {
        config.autoRestart = config.autoRestart || {};
        config.autoRestart.enable = !config.autoRestart.enable;
        saveConfig();
        return message.reply(`✦ 𝐀𝐮𝐭𝐨 𝐑𝐞𝐬𝐭𝐚𝐫𝐭 — ${status(config.autoRestart.enable)}`);
      }

      if (num === 3) {
        config.antiInbox = config.antiInbox || {};
        config.antiInbox.enable = !config.antiInbox.enable;
        saveConfig();
        return message.reply(`✦ 𝐀𝐧𝐭𝐢 𝐈𝐧𝐛𝐨𝐱 — ${status(config.antiInbox.enable)}`);
      }

      if (num === 4) {
        config.onlyAdminBox = !config.onlyAdminBox;
        saveConfig();
        return message.reply(`✦ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧 𝐁𝐨𝐱 — ${status(config.onlyAdminBox)}`);
      }
    }

    if (state === "adminManage") {
      if (num === 1) {
        return await sendAndListen(
          "╭─〔 👑 𝐀𝐝𝐝 𝐀𝐝𝐦𝐢𝐧 〕\n│\n│  › 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐔𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠 𝐮𝐬𝐞𝐫\n╰─",
          "adminAdd"
        );
      }

      if (num === 2) {
        const admins = config.adminBot || [];

        if (!admins.length)
          return message.reply("╰─〔 𝗫 𝐍𝐨 𝐚𝐝𝐦𝐢𝐧𝐬 𝐟𝐨𝐮𝐧𝐝 〕");

        const list = admins
          .map((id, i) => `│  ${i + 1}. ${id}`)
          .join("\n");

        const menu = [
          "╭─〔 👑 𝐑𝐞𝐦𝐨𝐯𝐞 𝐀𝐝𝐦𝐢𝐧 〕",
          "│",
          list,
          "│",
          "╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝐧𝐮𝐦𝐛𝐞𝐫 〕"
        ].join("\n");

        return await sendAndListen(menu, "adminRemoveSelect");
      }

      if (num === 3) {
        const admins = config.adminBot || [];

        if (!admins.length)
          return message.reply("╰─〔 𝗫 𝐍𝐨 𝐚𝐝𝐦𝐢𝐧𝐬 𝐟𝐨𝐮𝐧𝐝 〕");

        return message.reply(
          `╭─〔 👑 𝐀𝐝𝐦𝐢𝐧𝐬 〕\n│\n│  ${admins.join("\n│  ")}\n╰─`
        );
      }
    }

    if (state === "adminAdd") {
      let uid = input;

      if (event.mentions && Object.keys(event.mentions).length > 0)
        uid = Object.keys(event.mentions)[0];

      if (!uid || isNaN(uid))
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐈𝐃 〕");

      config.adminBot = config.adminBot || [];

      if (config.adminBot.includes(uid))
        return message.reply("╰─〔 𝗫 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐧 𝐚𝐝𝐦𝐢𝐧 〕");

      config.adminBot.push(uid);
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐀𝐝𝐝𝐞𝐝 𝐚𝐝𝐦𝐢𝐧: ${uid} 〕`);
    }

    if (state === "adminRemoveSelect") {
      const admins = config.adminBot || [];
      const idx = num - 1;

      if (isNaN(num) || !admins[idx])
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧 〕");

      const removed = admins.splice(idx, 1)[0];

      config.adminBot = admins;
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝: ${removed} 〕`);
    }

    if (state === "whitelist") {
      if (num === 1) {
        config.whiteListModeThread = config.whiteListModeThread || {};
        config.whiteListModeThread.enable =
          !config.whiteListModeThread.enable;

        saveConfig();

        return message.reply(
          `✦ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 — ${status(config.whiteListModeThread.enable)}`
        );
      }

      if (num === 2) {
        return await sendAndListen(
          "╭─〔 🛡️ 𝐀𝐝𝐝 𝐓𝐡𝐫𝐞𝐚𝐝 〕\n│\n│  › 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃\n╰─",
          "threadAdd"
        );
      }

      if (num === 3) {
        const threads =
          config.whiteListModeThread?.whiteListThreadIds || [];

        if (!threads.length)
          return message.reply("╰─〔 𝗫 𝐍𝐨 𝐭𝐡𝐫𝐞𝐚𝐝𝐬 𝐟𝐨𝐮𝐧𝐝 〕");

        const list = threads
          .map((id, i) => `│  ${i + 1}. ${id}`)
          .join("\n");

        return await sendAndListen(
          `╭─〔 🛡️ 𝐑𝐞𝐦𝐨𝐯𝐞 𝐓𝐡𝐫𝐞𝐚𝐝 〕\n│\n${list}\n│\n╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝐧𝐮𝐦𝐛𝐞𝐫 〕`,
          "threadRemoveSelect"
        );
      }

      if (num === 4) {
        config.whiteListMode = config.whiteListMode || {};
        config.whiteListMode.enable = !config.whiteListMode.enable;

        saveConfig();

        return message.reply(
          `✦ 𝐔𝐬𝐞𝐫 𝐖𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 — ${status(config.whiteListMode.enable)}`
        );
      }

      if (num === 5) {
        return await sendAndListen(
          "╭─〔 🛡️ 𝐀𝐝𝐝 𝐔𝐬𝐞𝐫 〕\n│\n│  › 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐔𝐈𝐃 𝐨𝐫 𝐭𝐚𝐠 𝐮𝐬𝐞𝐫\n╰─",
          "userAdd"
        );
      }

      if (num === 6) {
        const users = config.whiteListMode?.whiteListIds || [];

        if (!users.length)
          return message.reply("╰─〔 𝗫 𝐍𝐨 𝐮𝐬𝐞𝐫𝐬 𝐟𝐨𝐮𝐧𝐝 〕");

        const list = users
          .map((id, i) => `│  ${i + 1}. ${id}`)
          .join("\n");

        return await sendAndListen(
          `╭─〔 🛡️ 𝐑𝐞𝐦𝐨𝐯𝐞 𝐔𝐬𝐞𝐫 〕\n│\n${list}\n│\n╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝐧𝐮𝐦𝐛𝐞𝐫 〕`,
          "userRemoveSelect"
        );
      }
    }

    if (state === "threadAdd") {
      const tid = input;

      if (!tid || isNaN(tid))
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐓𝐡𝐫𝐞𝐚𝐝 𝐈𝐃 〕");

      config.whiteListModeThread =
        config.whiteListModeThread || {};

      config.whiteListModeThread.whiteListThreadIds =
        config.whiteListModeThread.whiteListThreadIds || [];

      if (
        config.whiteListModeThread.whiteListThreadIds.includes(tid)
      )
        return message.reply("╰─〔 𝗫 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐢𝐧 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 〕");

      config.whiteListModeThread.whiteListThreadIds.push(tid);
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐓𝐡𝐫𝐞𝐚𝐝 𝐚𝐝𝐝𝐞𝐝: ${tid} 〕`);
    }

    if (state === "threadRemoveSelect") {
      const threads =
        config.whiteListModeThread?.whiteListThreadIds || [];

      const idx = num - 1;

      if (isNaN(num) || !threads[idx])
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧 〕");

      const removed = threads.splice(idx, 1)[0];

      config.whiteListModeThread.whiteListThreadIds = threads;
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝: ${removed} 〕`);
    }

    if (state === "userAdd") {
      let uid = input;

      if (event.mentions && Object.keys(event.mentions).length > 0)
        uid = Object.keys(event.mentions)[0];

      if (!uid || isNaN(uid))
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐔𝐈𝐃 〕");

      config.whiteListMode = config.whiteListMode || {};
      config.whiteListMode.whiteListIds =
        config.whiteListMode.whiteListIds || [];

      if (config.whiteListMode.whiteListIds.includes(uid))
        return message.reply("╰─〔 𝗫 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐢𝐧 𝐰𝐡𝐢𝐭𝐞𝐥𝐢𝐬𝐭 〕");

      config.whiteListMode.whiteListIds.push(uid);
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐔𝐬𝐞𝐫 𝐚𝐝𝐝𝐞𝐝: ${uid} 〕`);
    }

    if (state === "userRemoveSelect") {
      const users = config.whiteListMode?.whiteListIds || [];
      const idx = num - 1;

      if (isNaN(num) || !users[idx])
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧 〕");

      const removed = users.splice(idx, 1)[0];

      config.whiteListMode.whiteListIds = users;
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝: ${removed} 〕`);
    }

    if (state === "reactUnsend") {
      if (num === 1) {
        config.reactUnsend = config.reactUnsend || {};
        config.reactUnsend.enable = !config.reactUnsend.enable;
        saveConfig();

        return message.reply(
          `✦ 𝐑𝐞𝐚𝐜𝐭 𝐔𝐧𝐬𝐞𝐧𝐝 — ${status(config.reactUnsend.enable)}`
        );
      }

      if (num === 2) {
        config.reactUnsend = config.reactUnsend || {};
        config.reactUnsend.onlyAdmin =
          !config.reactUnsend.onlyAdmin;

        saveConfig();

        return message.reply(
          `✦ 𝐎𝐧𝐥𝐲 𝐀𝐝𝐦𝐢𝐧 — ${status(config.reactUnsend.onlyAdmin)}`
        );
      }

      if (num === 3) {
        return await sendAndListen(
          "╭─〔 💫 𝐀𝐝𝐝 𝐄𝐦𝐨𝐣𝐢 〕\n│\n│  › 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐞𝐦𝐨𝐣𝐢\n╰─",
          "emojiAdd"
        );
      }

      if (num === 4) {
        const emojis = config.reactUnsend?.emojis || [];

        if (!emojis.length)
          return message.reply("╰─〔 𝗫 𝐍𝐨 𝐞𝐦𝐨𝐣𝐢𝐬 𝐟𝐨𝐮𝐧𝐝 〕");

        const list = emojis
          .map((e, i) => `│  ${i + 1}. ${e}`)
          .join("\n");

        return await sendAndListen(
          `╭─〔 💫 𝐑𝐞𝐦𝐨𝐯𝐞 𝐄𝐦𝐨𝐣𝐢 〕\n│\n${list}\n│\n╰─〔 › 𝐑𝐞𝐩𝐥𝐲 𝐧𝐮𝐦𝐛𝐞𝐫 〕`,
          "emojiRemoveSelect"
        );
      }

      if (num === 5) {
        const emojis = config.reactUnsend?.emojis || [];

        if (!emojis.length)
          return message.reply("╰─〔 𝗫 𝐍𝐨 𝐞𝐦𝐨𝐣𝐢𝐬 〕");

        return message.reply(
          `╭─〔 💫 𝐄𝐦𝐨𝐣𝐢𝐬 〕\n│\n│  ${emojis.join("  ")}\n╰─`
        );
      }
    }

    if (state === "emojiAdd") {
      const emoji = input.trim();

      if (!emoji)
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐞𝐦𝐨𝐣𝐢 〕");

      config.reactUnsend = config.reactUnsend || {};
      config.reactUnsend.emojis =
        config.reactUnsend.emojis || [];

      if (config.reactUnsend.emojis.includes(emoji))
        return message.reply("╰─〔 𝗫 𝐀𝐥𝐫𝐞𝐚𝐝𝐲 𝐚𝐝𝐝𝐞𝐝 〕");

      config.reactUnsend.emojis.push(emoji);
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐀𝐝𝐝𝐞𝐝: ${emoji} 〕`);
    }

    if (state === "emojiRemoveSelect") {
      const emojis = config.reactUnsend?.emojis || [];
      const idx = num - 1;

      if (isNaN(num) || !emojis[idx])
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧 〕");

      const removed = emojis.splice(idx, 1)[0];

      config.reactUnsend.emojis = emojis;
      saveConfig();

      return message.reply(`╰─〔 ✦ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝: ${removed} 〕`);
    }

    if (state === "nickname") {
      if (num === 1) {
        return await sendAndListen(
          "╭─〔 ✏️ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〕\n│\n│  › 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐧𝐞𝐰 𝐧𝐢𝐜𝐤𝐧𝐚𝐦𝐞\n╰─",
          "nicknameSet"
        );
      }

      if (num === 2) {
        return await sendAndListen(
          "╭─〔 ✏️ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〔𝐀𝐥𝐥〕〕\n│\n│  › 𝐑𝐞𝐩𝐥𝐲 𝐰𝐢𝐭𝐡 𝐧𝐞𝐰 𝐧𝐢𝐜𝐤𝐧𝐚𝐦𝐞\n╰─",
          "nicknameSetAll"
        );
      }

      if (num === 3) {
        config.nickNameBot = "";
        saveConfig();

        try {
          await api.changeNickname(
            "",
            event.threadID,
            api.getCurrentUserID()
          );
        } catch (e) {}

        return message.reply("╰─〔 ✦ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 𝐫𝐞𝐬𝐞𝐭 〕");
      }
    }

    if (state === "nicknameSet") {
      const nickname = input;

      if (!nickname)
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐧𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〕");

      config.nickNameBot = nickname;
      saveConfig();

      try {
        await api.changeNickname(
          nickname,
          event.threadID,
          api.getCurrentUserID()
        );
      } catch (e) {}

      return message.reply(
        `╰─〔 ✦ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞: ${nickname} 〕`
      );
    }

    if (state === "nicknameSetAll") {
      const nickname = input;

      if (!nickname)
        return message.reply("╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐧𝐢𝐜𝐤𝐧𝐚𝐦𝐞 〕");

      config.nickNameBot = nickname;
      saveConfig();

      const threads = await api.getThreadList(
        100,
        null,
        ["INBOX"]
      );

      let success = 0;

      for (const thread of threads) {
        if (!thread.isGroup) continue;

        try {
          await api.changeNickname(
            nickname,
            thread.threadID,
            api.getCurrentUserID()
          );

          success++;
        } catch (e) {}
      }

      return message.reply(
        `╭─〔 ✦ 𝐍𝐢𝐜𝐤𝐧𝐚𝐦𝐞 𝐔𝐩𝐝𝐚𝐭𝐞𝐝 〕\n│\n│  › ${nickname}\n│  › 𝐆𝐫𝐨𝐮𝐩𝐬: ${success}\n╰─`
      );
    }

    if (state === "fcaOptions") {
      const keys = [
        "autoUpdate",
        "listenEvents",
        "selfListen",
        "listenTyping",
        "updatePresence",
        "forceLogin",
        "autoMarkRead",
        "autoReconnect"
      ];

      if (num === 9) {
        config.e2ee = config.e2ee || {};
        config.e2ee.enable = !config.e2ee.enable;

        saveConfig();

        return message.reply(
          `╭─〔 🔐 𝐄𝟐𝐄𝐄 〕\n│\n│  ${status(config.e2ee.enable)}\n│\n╰─〔 › 𝐑𝐞𝐬𝐭𝐚𝐫𝐭 𝐛𝐨𝐭 𝐟𝐨𝐫 𝐜𝐡𝐚𝐧𝐠𝐞 〕`
        );
      }

      const key = keys[num - 1];

      if (!key)
        return message.reply(
          "╰─〔 𝗫 𝐈𝐧𝐯𝐚𝐥𝐢𝐝 𝐬𝐞𝐥𝐞𝐜𝐭𝐢𝐨𝐧 〕"
        );

      config.optionsFca = config.optionsFca || {};
      config.optionsFca[key] = !config.optionsFca[key];

      saveConfig();

      if (key !== "autoUpdate" && key !== "forceLogin") {
        api.setOptions({
          [key]: config.optionsFca[key]
        });
      }

      return message.reply(
        `╰─〔 ✦ 𝐅𝐂𝐀 ${key} — ${status(config.optionsFca[key])} 〕`
      );
    }
  }
};