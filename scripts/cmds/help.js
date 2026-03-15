module.exports = {
	config: {
		name: "help",
		version: "1.0",
		author: "SaGor",
		countDown: 5,
		role: 0,
		shortDescription: "Show command list",
		longDescription: "View all commands or command details",
		category: "system",
		guide: {
			en: "/help\n/help [command]"
		}
	},

	onStart: async function ({ message, args }) {

		const commands = global.GoatBot.commands;

		// SHOW ALL COMMANDS
		if (!args[0]) {
			const categories = {};

			for (const [name, cmd] of commands) {
				const category = cmd.config.category || "other";

				if (!categories[category]) categories[category] = [];
				categories[category].push(name);
			}

			let msg = "";

			for (const category in categories) {
				msg += `╭─────『 ${category.toUpperCase()} 』\n`;
				for (const cmd of categories[category]) {
					msg += `│ ▸ ${cmd}\n`;
				}
				msg += `╰──────────────\n`;
			}

			return message.reply(msg);
		}

		// SHOW COMMAND DETAILS
		const cmdName = args[0].toLowerCase();
		const command = commands.get(cmdName);

		if (!command)
			return message.reply("❌ Command not found");

		const config = command.config;

		let msg =
`╭─────『 COMMAND DETAILS 』
│ ▸ Name: ${config.name}
│ ▸ Author: ${config.author}
│ ▸ Category: ${config.category}
│ ▸ Description: ${config.longDescription || "No description"}
│ ▸ Usage: ${config.guide?.en || "No guide"}
│ ▸ Permission: ${config.role == 0 ? "User" : config.role == 1 ? "Admin" : "Bot Admin"}
╰──────────────`;

		message.reply(msg);
	}
};
