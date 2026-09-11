const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "vaiyaaa",
		version: "1.1",
		author: "EryXenX",
		countDown: 3,
		role: 0,
		description: {
			en: "Sends a voice reply when 'vaiyaa' is detected in chat"
		},
		category: "fun",
		guide: {
			en: "Just type anything containing 'vaiyaa'"
		}
	},

	onStart: async function () {
		return;
	},

	onChat: async function ({ api, event }) {
		const body = (event.body || "").toLowerCase();
		if (!body.includes("vaiyaa")) return;

		const audioUrl = "https://files.catbox.moe/yfzdya";
		const tempDir = path.join(__dirname, "cache");
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
		const filePath = path.join(tempDir, `vaiyaa_${event.messageID}.mp3`);

		try {
			const response = await axios.get(audioUrl, { responseType: "arraybuffer" });
			fs.writeFileSync(filePath, response.data);

			await api.sendMessage(
				{
					body: "",
					attachment: fs.createReadStream(filePath)
				},
				event.threadID,
				event.messageID
			);
		} catch (err) {
			return api.sendMessage("Failed to send voice.", event.threadID, event.messageID);
		} finally {
			if (fs.existsSync(filePath)) {
				setTimeout(() => {
					fs.unlink(filePath, () => {});
				}, 5000);
			}
		}
	}
};