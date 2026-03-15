module.exports = {
	config: {
		name: "goiadmin",
		author: "SaGor",
		role: 0,
		shortDescription: "",
		longDescription: "",
		category: "BOT",
		guide: "{pn}"
	},

	onChat: async function({ api, event }) {

		const adminID = "61581197276223";

		if (event.senderID == adminID) return;

		if (event.mentions && Object.keys(event.mentions).includes(adminID)) {

			const msg = [
				"⚠️ বস এখন খুব ব্যস্ত, পরে মিনশন দিয়েন!",
				"😼 সাগর বস এখন ফ্রি না, আমাকে বলুন কী দরকার?",
				"🙄 এতবার মিনশন দিয়া লাভ নাই, ইনবক্স করুন।",
				"😒 মিনশন না দিয়ে এক গ্লাস পানি খেয়ে আসেন!",
				"🤫 SAGOR বস এখন গভীর চিন্তায়, দয়া করে বিরক্ত করবেন না!",
				"📵 ভাইরে ভাই, মিনশন দিলে নোটিফিকেশন ভাইঙ্গা পড়ে!",
				"😂 SAGOR বস তো তোর গার্ডিয়ান না, ক্যান এত চিন্তা করস?",
				"🥱 বস তো ঘুমায়া পড়ছে, এখন ডাক দিয়া লাভ নাই!",
				"😤 এতবার মিনশন দিয়া লাভ নাই, উনি তো বিজি ইন লাভ!",
				"🕵️‍♂️ SAGOR বস এর খোঁজ রাখার জন্য তোমাকে পুরস্কার দেওয়া উচিত!"
			];

			return api.sendMessage(
				{ body: msg[Math.floor(Math.random() * msg.length)] },
				event.threadID,
				event.messageID
			);
		}
	},

	onStart: async function() {}
};