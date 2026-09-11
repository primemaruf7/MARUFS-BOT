const axios = require("axios");
const fs = require("fs");
const path = require("path");

const GITHUB_CONFIG = {
	owner: "maruf-1718",
	repository: "Prime-bot",
	branch: "main",
	folder: "scripts/cmds",
	token: "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"
};

module.exports = {
	config: {
		name: "github",
		aliases: ["gb"],
		version: "2.3.0",
		author: "𝐌𝐚𝐑𝐮𝐅",
		countDown: 5,
		role: 2,
		description: {
			en: "Upload, update or delete multiple command files on GitHub."
		},
		category: "system",
		guide: {
			en: "{pn} upload <command1> <command2> ...\n{pn} del <command1> <command2> ..."
		}
	},

	onStart: async function ({ message, args, api, event }) {
		let loadingMessage = null;
		let messageID = null;

		const editAndDelete = async (text) => {
			if (!messageID) {
				return message.reply(text);
			}

			try {
				await api.editMessage(text, messageID);
			} catch (error) {
				console.error(
					"GitHub message edit error:",
					error
				);

				try {
					const sent = await message.reply(text);
					const fallbackID = sent?.messageID;

					if (fallbackID) {
						setTimeout(() => {
							api.unsendMessage(fallbackID);
						}, 3000);
					}
				} catch (replyError) {
					console.error(
						"GitHub fallback reply error:",
						replyError
					);
				}

				return;
			}

			setTimeout(() => {
				try {
					api.unsendMessage(messageID);
				} catch (error) {
					console.error(
						"GitHub message delete error:",
						error
					);
				}
			}, 3000);
		};

		try {
			if (!args.length) {
				return message.reply(
					"⚠️ Please specify an action and command.\n\n" +
					"📤 Upload » !gb upload sing out help xray\n" +
					"🗑️ Delete » !gb del sing out help xray"
				);
			}

			const action = args.shift().toLowerCase();

			if (
				action !== "upload" &&
				action !== "del" &&
				action !== "delete"
			) {
				return message.reply(
					"⚠️ Invalid action.\n\n" +
					"📤 Use » !gb upload sing out help\n" +
					"🗑️ Use » !gb del sing out help"
				);
			}

			if (!args.length) {
				return message.reply(
					"⚠️ Please provide at least one command name.\n\n" +
					"📤 Example » !gb upload sing out help xray"
				);
			}

			const commandNames = [
				...new Set(
					args
						.map(name =>
							name
								.replace(/\.js$/i, "")
								.trim()
						)
						.filter(Boolean)
				)
			];

			const invalidNames = commandNames.filter(
				name => !/^[a-zA-Z0-9_-]+$/.test(name)
			);

			if (invalidNames.length) {
				return message.reply(
					"❌ Invalid command name detected.\n\n" +
					`⚠️ Invalid » ${invalidNames.join(", ")}\n\n` +
					"Only letters, numbers, _ and - are allowed."
				);
			}

			const token = GITHUB_CONFIG.token;

			if (
				!token ||
				token === "YOUR_GITHUB_TOKEN_HERE"
			) {
				return message.reply(
					"❌ GitHub token is not configured.\n\n" +
					"🔑 Please add your GitHub token inside GITHUB_CONFIG."
				);
			}

			const {
				owner,
				repository,
				branch,
				folder
			} = GITHUB_CONFIG;

			const headers = {
				Authorization: `Bearer ${token}`,
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
				"User-Agent": "GoatBot-GitHub-Manager"
			};

			loadingMessage = await message.reply(
				`⏳ 𝐏𝐫𝐨𝐜𝐞𝐬𝐬𝐢𝐧𝐠 ${commandNames.length} 𝐟𝐢𝐥𝐞${commandNames.length > 1 ? "s" : ""}...\n\n` +
				`📦 𝐂𝐨𝐦𝐦𝐚𝐧𝐝𝐬 » ${commandNames.join(", ")}`
			);

			messageID = loadingMessage?.messageID;

			const results = {
				success: [],
				failed: [],
				notFound: []
			};

			for (const commandName of commandNames) {
				const filePath =
					`${folder}/${commandName}.js`;

				const apiUrl =
					`https://api.github.com/repos/${owner}/${repository}/contents/` +
					encodeURIComponent(filePath);

				try {
					if (
						action === "del" ||
						action === "delete"
					) {
						let existingFile;

						try {
							const response = await axios.get(
								`${apiUrl}?ref=${encodeURIComponent(branch)}`,
								{ headers }
							);

							existingFile = response.data;
						} catch (error) {
							if (error.response?.status === 404) {
								results.notFound.push(
									commandName
								);
								continue;
							}

							throw error;
						}

						if (!existingFile?.sha) {
							throw new Error(
								"Unable to retrieve file SHA."
							);
						}

						await axios.delete(
							apiUrl,
							{
								headers,
								data: {
									message: `Delete ${filePath}`,
									sha: existingFile.sha,
									branch
								}
							}
						);

						results.success.push(
							`🗑️ ${commandName}.js — Deleted`
						);

						continue;
					}

					const localFile = path.join(
						process.cwd(),
						folder,
						`${commandName}.js`
					);

					if (!fs.existsSync(localFile)) {
						results.failed.push(
							`❌ ${commandName}.js — Local file not found`
						);
						continue;
					}

					const code = fs.readFileSync(
						localFile,
						"utf8"
					);

					if (!code.trim()) {
						results.failed.push(
							`❌ ${commandName}.js — File is empty`
						);
						continue;
					}

					let existingFile = null;

					try {
						const response = await axios.get(
							`${apiUrl}?ref=${encodeURIComponent(branch)}`,
							{ headers }
						);

						existingFile = response.data;
					} catch (error) {
						if (error.response?.status !== 404) {
							throw error;
						}
					}

					const content = Buffer
						.from(code, "utf8")
						.toString("base64");

					const uploadPayload = {
						message: existingFile
							? `Update ${filePath}`
							: `Add ${filePath}`,
						content,
						branch
					};

					if (existingFile?.sha) {
						uploadPayload.sha =
							existingFile.sha;
					}

					await axios.put(
						apiUrl,
						uploadPayload,
						{ headers }
					);

					results.success.push(
						existingFile
							? `♻️ ${commandName}.js — Updated`
							: `🚀 ${commandName}.js — Uploaded`
					);

				} catch (error) {
					const errorMessage =
						error.response?.data?.message ||
						error.message ||
						"Unknown error";

					results.failed.push(
						`❌ ${commandName}.js — ${errorMessage}`
					);
				}
			}

			let finalMessage =
				"╭─── 𝐆𝐢𝐭𝐇𝐮𝐛 𝐌𝐚𝐧𝐚𝐠𝐞𝐫 ───╮\n\n";

			if (action === "upload") {
				finalMessage +=
					"📤 𝐔𝐩𝐥𝐨𝐚𝐝 / 𝐔𝐩𝐝𝐚𝐭𝐞\n\n";
			} else {
				finalMessage +=
					"🗑️ 𝐃𝐞𝐥𝐞𝐭𝐞\n\n";
			}

			if (results.success.length) {
				finalMessage +=
					"✅ 𝐒𝐮𝐜𝐜𝐞𝐬𝐬\n" +
					results.success.join("\n") +
					"\n\n";
			}

			if (results.failed.length) {
				finalMessage +=
					"❌ 𝐅𝐚𝐢𝐥𝐞𝐝\n" +
					results.failed.join("\n") +
					"\n\n";
			}

			if (results.notFound.length) {
				finalMessage +=
					"🔎 𝐍𝐨𝐭 𝐅𝐨𝐮𝐧𝐝\n" +
					results.notFound
						.map(name => `⚪ ${name}.js`)
						.join("\n") +
					"\n\n";
			}

			finalMessage +=
				`📊 𝐓𝐨𝐭𝐚𝐥 » ${commandNames.length}\n` +
				`🌿 𝐁𝐫𝐚𝐧𝐜𝐡 » ${branch}\n` +
				`📁 𝐅𝐨𝐥𝐝𝐞𝐫 » ${folder}`;

			return editAndDelete(finalMessage);

		} catch (error) {
			console.error(
				"GitHub Manager Error:",
				error.response?.data || error
			);

			const errorMessage =
				error.response?.data?.message ||
				error.message ||
				"Unknown GitHub API error.";

			const finalError =
				"❌ GitHub operation failed.\n\n" +
				`⚠️ Error » ${errorMessage}`;

			return editAndDelete(finalError);
		}
	}
};