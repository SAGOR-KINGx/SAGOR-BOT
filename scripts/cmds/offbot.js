module.exports = {
	config: {
		name: "off",
		version: "1.0",
		author: "SaGor",
		countDown: 45,
		role: 2,
		shortDescription: "Turn off bot",
		longDescription: "Turn off bot",
		category: "owner",
		guide: "{p}{n}"
	},
	onStart: async function ({event, api}) {
		api.sendMessage("╔════ஜ۩۞۩ஜ═══╗\n\n 𝐡𝐚𝐚𝐚 𝐣𝐚𝐜𝐜𝐡𝐢..🫤🎀 \n 𝐯𝐚𝐥𝐚 𝐭𝐡𝐚𝐤𝐢𝐬 𝐭𝐮𝐢..🥱\n\n╚════ஜ۩۞۩ஜ═══╝",event.threadID, () =>process.exit(0))}
};
