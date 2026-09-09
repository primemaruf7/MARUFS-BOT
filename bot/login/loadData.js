const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const { log, createOraDots, getText } = global.utils;

const bigText = `
███╗░░░███╗░█████╗░██████╗░██╗░░░██╗███████╗
████╗░████║██╔══██╗██╔══██╗██║░░░██║██╔════╝
██╔████╔██║███████║██████╔╝██║░░░██║█████╗░░
██║╚██╔╝██║██╔══██║██╔══██╗██║░░░██║██╔══╝░░
██║░╚═╝░██║██║░░██║██║░░██║╚██████╔╝███████╗
╚═╝░░░░░╚═╝╚═╝░░╚═╝╚═╝░░╚═╝░╚═════╝░╚══════╝
`;

function header(title) {
    return chalk.cyanBright(
`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                 ${title}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
}

function line(text) {
    return chalk.hex("#ffd369")(text);
}

module.exports = async function (api, createLine) {

    console.log(chalk.green(bigText));
    console.log(header("🚀 GOATBOT DATABASE"));
    console.log(line("📦 Loading system resources…"));

    const controller = await require(path.join(__dirname, '..', '..', 'database/controller/index.js'))(api);
    const { threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, sequelize } = controller;

    log.info('DATABASE', `🧵 Thread data: OK`);
    log.info('DATABASE', `👤 User data: OK`);

    const AUTO_SYNC_MIN_INTERVAL_MS = 6 * 60 * 60 * 1000;
    const lastAutoSyncPath = path.join(__dirname, '..', '..', 'database/data/lastAutoSync.json');
    let shouldAutoSync = true;
    let lastAutoSyncAt = 0;

    try {
        if (fs.existsSync(lastAutoSyncPath)) {
            lastAutoSyncAt = (fs.readJsonSync(lastAutoSyncPath) || {}).lastAutoSyncAt || 0;
            shouldAutoSync = (Date.now() - lastAutoSyncAt) >= AUTO_SYNC_MIN_INTERVAL_MS;
        }
    } catch {
        shouldAutoSync = true;
    }

    if (api && global.GoatBot.config.database.autoSyncWhenStart == true && shouldAutoSync) {

        console.log(header("🔄 AUTO SYNC ENABLED"));

        const spin = createOraDots(getText('loadData', 'refreshingThreadData'));

        try {
            api.setOptions({ logLevel: 'silent' });
            spin._start();

            const threadDataWillSet = [];
            const allThreadData = [...global.db.allThreadData];

            const allThreadInfo = await api.getThreadList(9999999, null, 'INBOX');

            for (const threadInfo of allThreadInfo) {
                if (threadInfo.isGroup && !allThreadData.some(thread => thread.threadID === threadInfo.threadID)) {
                    threadDataWillSet.push(await threadsData.create(threadInfo.threadID, threadInfo));
                } else {
                    const refreshed = await threadsData.refreshInfo(threadInfo.threadID, threadInfo);
                    allThreadData.splice(allThreadData.findIndex(thread => thread.threadID === threadInfo.threadID), 1);
                    threadDataWillSet.push(refreshed);
                }
                global.db.receivedTheFirstMessage[threadInfo.threadID] = true;
            }

            const allThreadDataDontHaveBot = allThreadData.filter(
                thread => !allThreadInfo.some(info => thread.threadID === info.threadID)
            );

            const botID = api.getCurrentUserID();

            for (const thread of allThreadDataDontHaveBot) {
                const me = thread.members.find(m => m.userID == botID);
                if (me) {
                    me.inGroup = false;
                    await threadsData.set(thread.threadID, { members: thread.members });
                }
            }

            global.db.allThreadData = [
                ...threadDataWillSet,
                ...allThreadDataDontHaveBot
            ];

            spin._stop();
            log.info('DATABASE', getText('loadData', 'refreshThreadDataSuccess', global.db.allThreadData.length));
            console.log(chalk.green("✅ Auto Sync Complete!"));

            try {
                fs.writeJsonSync(lastAutoSyncPath, { lastAutoSyncAt: Date.now() }, { spaces: 2 });
            } catch {}
        }
        catch (err) {
            spin._stop();
            log.error('DATABASE', getText('loadData', 'refreshThreadDataError'), err);
        }
        finally {
            api.setOptions({
                logLevel: global.GoatBot.config.optionsFca.logLevel
            });
        }
    }
    else if (api && global.GoatBot.config.database.autoSyncWhenStart == true && !shouldAutoSync) {
        log.info('DATABASE', `Auto sync skipped — last ran ${Math.round((Date.now() - lastAutoSyncAt) / 60000)}m ago (min interval 6h)`);
    }

    console.log(header("💻 SYSTEM READY"));

    if (api && typeof api._connectE2EEAndMerge === "function" && global.GoatBot.config.e2ee?.enable !== false) {
        await api._connectE2EEAndMerge();
    }

    return {
        threadModel: threadModel || null,
        userModel: userModel || null,
        dashBoardModel: dashBoardModel || null,
        globalModel: globalModel || null,
        threadsData,
        usersData,
        dashBoardData,
        globalData,
        sequelize
    };
};