const fs = require("fs-extra");
const path = require("path");

module.exports = {
 config: {
 name: "share_cmd",
 aliases: ["s", "sc", "share"],
 version: "3.0",
 author: "𝐌𝐚𝐑𝐮𝐅",
 countDown: 3,
 role: 3, // Only Bot Owner
 shortDescription: "Share any bot file - owner only",
 longDescription: "Search and share any file from bot root",
 category: "owner",
 guide: { en: "{pn} <filename>\n{pn}c <filename> - as code\nExample: {pn} tempmail.js\n{pn} account.txt" }
 },

 onStart: async function ({ api, event, args }) {
 const threadID = event.threadID;
 const messageID = event.messageID;

 if (!args[0]) return api.sendMessage("❌ File name dao\nEx: s tempmail.js", threadID, messageID);

 const requestedName = args.join(" ").trim();

 // security check for null byte only
 if (requestedName.includes("\0")) return;

 const root = path.resolve(process.cwd());

 // সব জায়গায় খুঁজবে
 const searchLocations = [
 root,
 path.join(root, "scripts", "cmds"),
 path.join(root, "scripts", "events"),
 path.join(root, "config"),
 path.join(root, "bot"),
 __dirname
 ];

 let filePath = null;

 for (const directory of searchLocations) {
 try {
 const candidate = path.join(directory, requestedName);
 if (await fs.pathExists(candidate)) {
 const stat = await fs.stat(candidate);
 if (stat.isFile()) {
 filePath = candidate;
 break;
 }
 }
 // যদি পুরা পাথ দেয়
 if (await fs.pathExists(path.resolve(root, requestedName))) {
 filePath = path.resolve(root, requestedName);
 break;
 }
 } catch {}
 }

 // Recursive search if not found
 if (!filePath) {
 try {
 const allFiles = await fs.readdir(path.join(root, "scripts", "cmds"));
 const found = allFiles.find(f => f.toLowerCase() === requestedName.toLowerCase() || f.toLowerCase().includes(requestedName.toLowerCase()));
 if (found) filePath = path.join(root, "scripts", "cmds", found);
 } catch {}
 }

 if (!filePath) return api.sendMessage(`❌ File not found: ${requestedName}`, threadID, messageID);

 try { api.setMessageReaction("🔍", messageID, () => {}, true); } catch {}

 const isTextMode = (event.body || "").toLowerCase().startsWith("sc") || (event.body || "").toLowerCase().startsWith("/sc");

 try {
 if (isTextMode) {
 const code = await fs.readFile(filePath, "utf8");
 // fb limit 20000 char
 if (code.length > 19000) {
 return api.sendMessage({ body: `📄 ${requestedName} (too long, sending as file)\nPath: ${filePath}`, attachment: fs.createReadStream(filePath) }, threadID, messageID);
 }
 return api.sendMessage(`📄 ${requestedName}\n📁 ${filePath}\n\n${code}`, threadID, messageID);
 } else {
 return api.sendMessage({ body: `📄 File: ${requestedName}\n📁 Path: ${filePath}`, attachment: fs.createReadStream(filePath) }, threadID, messageID);
 }
 } catch (e) {
 return api.sendMessage(`❌ Error reading file: ${e.message}`, threadID, messageID);
 }
 }
};