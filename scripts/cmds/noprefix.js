const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "noprefix",
		version: "4.0",
		author: "SaGor (Reaction Fix Final)",
		countDown: 5,
		role: 2,
		shortDescription: "Toggle No Prefix mode",
		longDescription: "Turn ON or OFF no prefix command system",
		category: "config"
	},

	onStart: async function ({ api, event, args }) {

		const configPath = path.join(process.cwd(), "config.json");
		let config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

		// ✅ PROPER REACTION FIX
		const react = async (emoji) => {
			try {
				await api.setMessageReaction(
					emoji,
					event.messageID,
					event.threadID,
					(err) => {},
					true
				);
			} catch (e) {}
		};

		if (!args[0]) {
			return react("⚙️");
		}

		const option = args[0].toLowerCase();

		if (option === "on") {
			config.noPrefixMode = true;
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
			return react("✅");
		}

		if (option === "off") {
			config.noPrefixMode = false;
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
			return react("❌");
		}

		return react("⚠️");
	}
};
