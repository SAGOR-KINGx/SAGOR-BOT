const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

const REACTION_COMMANDS = {
	kick:    ["🦵","🖕","🦿","🦶","⛔"],
	unsend:  ["😠", "😡", "😾", "🤬"],
	mute:    "🔇",
	unmute:  "🔊",
	warn:    "⚠️",
	ban:     "🚫",
	unban:   "🔓"
};

module.exports = (api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData) => {

	const handlerEvents = require(
		process.env.NODE_ENV === "development" ? "./handlerEvents.dev.js" : "./handlerEvents.js"
	)(api, threadModel, userModel, dashBoardModel, globalModel, usersData, threadsData, dashBoardData, globalData);

	const reactionCooldowns = new Map();
	const COOLDOWN_MS = 4500;

	const isBotAdmin = (userID) => global.GoatBot.config.adminBot.includes(userID);
	async function handleReactionCommand(event, message) {
		const { threadID, userID, messageID, reaction } = event;

		const allReactions = Object.values(REACTION_COMMANDS).flat();
		if (!allReactions.includes(reaction)) return;


		if (!isBotAdmin(userID)) return;


		let targetID;
		try {
				const msgInfo = await api.getMessageInfo(messageID, threadID);
				targetID = msgInfo.senderID;
		} catch (e) {
				return;
		}

		const key = `${threadID}_${userID}`;
		const now = Date.now();
		if (now - (reactionCooldowns.get(key) || 0) < COOLDOWN_MS) return;
		reactionCooldowns.set(key, now);

		if (reaction !== REACTION_COMMANDS.unban) {
			if (targetID === userID || isBotAdmin(targetID)) {
				return message.send("❌ You cannot target yourself or another admin.");
			}
		}

		if (REACTION_COMMANDS.kick.includes(reaction)) {
			try {
				await api.removeUserFromGroup(targetID, threadID);
				api.setMessageReaction("✅", messageID, () => {}, true);
			} catch (err) {
				await message.send(`Kick failed: ${err.message}`);
			}
			return;
		}

		if (REACTION_COMMANDS.unsend.includes(reaction)) {
			try {
				await api.unsendMessage(messageID);
			} catch (err) {}
			return;
		}

		if (reaction === REACTION_COMMANDS.mute) {
			try {
				await api.removeUserFromGroup(targetID, threadID);
				const data = await threadsData.get(threadID) || {};
				data.muted = data.muted || [];
				if (!data.muted.includes(targetID)) {
					data.muted.push(targetID);
					await threadsData.set(threadID, data);
				}
				api.setMessageReaction("✅", messageID, () => {}, true);
				await message.send(`🔇 <@${targetID}> muted.`);
			} catch (err) {
				await message.send(`Mute failed.`);
			}
			return;
		}

		if (reaction === REACTION_COMMANDS.unmute) {
			try {
				const data = await threadsData.get(threadID) || {};
				data.muted = (data.muted || []).filter(id => id !== targetID);
				await threadsData.set(threadID, data);
				api.setMessageReaction("✅", messageID, () => {}, true);
				await message.send(`🔊 <@${targetID}> unmuted.`);
			} catch (err) {}
			return;
		}

		if (reaction === REACTION_COMMANDS.warn) {
			try {
				const data = await threadsData.get(threadID) || {};
				data.warns = data.warns || {};
				data.warns[targetID] = (data.warns[targetID] || 0) + 1;
				const count = data.warns[targetID];
				await threadsData.set(threadID, data);

				if (count >= 3) {
					await api.removeUserFromGroup(targetID, threadID);
					await message.send(`🚨 <@${targetID}> kicked for 3 warnings.`);
					delete data.warns[targetID];
					await threadsData.set(threadID, data);
				} else {
					await message.send(`⚠️ Warning [${count}/3] for <@${targetID}>`);
				}
			} catch (err) {}
			return;
		}

		if (reaction === REACTION_COMMANDS.ban) {
			try {
				await api.removeUserFromGroup(targetID, threadID);
				const data = await threadsData.get(threadID) || {};
				data.banned = data.banned || [];
				if (!data.banned.includes(targetID)) {
					data.banned.push(targetID);
					await threadsData.set(threadID, data);
				}
				api.setMessageReaction("✅", messageID, () => {}, true);
				await message.send(`🚫 <@${targetID}> banned.`);
			} catch (err) {}
			return;
		}

		if (reaction === REACTION_COMMANDS.unban) {
			try {
				const data = await threadsData.get(threadID) || {};
				data.banned = (data.banned || []).filter(id => id !== targetID);
				await threadsData.set(threadID, data);
				api.setMessageReaction("✅", messageID, () => {}, true);
				await message.send(`🔓 <@${targetID}> unbanned.`);
			} catch (err) {}
			return;
		}
	}
const getAllCommandNames = () => {
		const commandNames = [];
		for (const cmd of global.GoatBot.commands.values()) {
			if (cmd.config && cmd.config.name) {
				commandNames.push(cmd.config.name.toLowerCase());
				if (cmd.config.aliases && Array.isArray(cmd.config.aliases)) {
					commandNames.push(...cmd.config.aliases.map(a => a.toLowerCase()));
				}
			}
		}
		return commandNames;
	};
	return async function mainEventHandler(event) {
		if (global.GoatBot.config.antiInbox === true && (event.senderID === event.threadID || event.isGroup === false)) return;

		const message = createFuncMessage(api, event);

		if (global.GoatBot.config.noPrefixMode && event.body && !event.body.startsWith(global.GoatBot.config.prefix)) {
			const messageBody = event.body.trim().toLowerCase();
			const commandNames = getAllCommandNames();

			const firstWord = messageBody.split(/\s+/)[0] || '';

			if (commandNames.includes(firstWord)) {

				event.body = global.GoatBot.config.prefix + event.body;
				console.log(`No Prefix: Command "${firstWord}" detected, prefix added`);
			}
	}
		await handlerCheckDB(usersData, threadsData, event, api);

		const handlers = await handlerEvents(event, message);
		if (!handlers) return;

		handlers.onAnyEvent();

		switch (event.type) {
			case "message":
			case "message_reply":
				handlers.onFirstChat();
				handlers.onChat();
				handlers.onStart();
				handlers.onReply();
				break;
			case "event":
				handlers.handlerEvent();
				handlers.onEvent();
				break;
			case "message_reaction":
				handlers.onReaction();
				await handleReactionCommand(event, message);
				break;
			default:
				break;
		}
	};
};
