const moment = require("moment-timezone");

module.exports = {
	config: {
		name: "work",
		aliases: ["job", "earn"],
		version: "1.0",
		author: "GoatBot",
		countDown: 5,
		role: 0,
		description: {
			vi: "Làm việc để kiếm tiền - các công việc khác nhau với mức lương khác nhau",
			en: "Work to earn money - different jobs with different pay rates"
		},
		category: "game",
		guide: {
			vi: "   {pn}: Làm việc ngẫu nhiên"
				+ "\n   {pn} list: Xem danh sách công việc"
				+ "\n   {pn} <tên công việc>: Làm công việc cụ thể",
			en: "   {pn}: Work random job"
				+ "\n   {pn} list: View available jobs"
				+ "\n   {pn} <job name>: Work specific job"
		}
	},

	langs: {
		vi: {
			workSuccess: "💼 **LÀM VIỆC** 💼\nCông việc: %1\n💰 Kiếm được: %2$\n⏰ Thời gian: %3 phút",
			workCooldown: "⏰ Bạn cần nghỉ ngơi! Còn %1 phút nữa mới có thể làm việc tiếp.",
			jobList: "💼 **DANH SÁCH CÔNG VIỆC** 💼\n\n%1",
			jobItem: "• **%1** - %2$ (Cooldown: %3 phút)",
			invalidJob: "❌ Công việc không hợp lệ!",
			workLevel: "📊 Cấp độ làm việc: %1",
			nextLevel: "📈 Cấp tiếp theo: %1 công việc cần thiết",
			bonus: "🎉 Bonus cấp độ: +%1$",
			noJobs: "❌ Không có công việc nào!",
			workComplete: "✅ Hoàn thành công việc!"
		},
		en: {
			workSuccess: "💼 **WORK** 💼\nJob: %1\n💰 Earned: %2$\n⏰ Time: %3 minutes",
			workCooldown: "⏰ You need to rest! %1 more minutes before you can work again.",
			jobList: "💼 **AVAILABLE JOBS** 💼\n\n%1",
			jobItem: "• **%1** - %2$ (Cooldown: %3 minutes)",
			invalidJob: "❌ Invalid job!",
			workLevel: "📊 Work Level: %1",
			nextLevel: "📈 Next level: %1 jobs required",
			bonus: "🎉 Level bonus: +%1$",
			noJobs: "❌ No jobs available!",
			workComplete: "✅ Work completed!"
		}
	},

	onStart: async function ({ message, args, event, usersData, getLang }) {
		const { senderID } = event;
		const action = args[0]?.toLowerCase();

		// Job definitions
		const jobs = {
			"fastfood": {
				name: "Fast Food Worker",
				basePay: 15,
				cooldown: 5,
				description: "Serve customers at a fast food restaurant"
			},
			"delivery": {
				name: "Delivery Driver",
				basePay: 25,
				cooldown: 8,
				description: "Deliver packages and food"
			},
			"programmer": {
				name: "Programmer",
				basePay: 50,
				cooldown: 15,
				description: "Write code and fix bugs"
			},
			"teacher": {
				name: "Teacher",
				basePay: 40,
				cooldown: 12,
				description: "Teach students in a classroom"
			},
			"doctor": {
				name: "Doctor",
				basePay: 100,
				cooldown: 30,
				description: "Treat patients and save lives"
			},
			"lawyer": {
				name: "Lawyer",
				basePay: 80,
				cooldown: 25,
				description: "Represent clients in legal matters"
			},
			"artist": {
				name: "Artist",
				basePay: 35,
				cooldown: 10,
				description: "Create beautiful artwork"
			},
			"musician": {
				name: "Musician",
				basePay: 30,
				cooldown: 8,
				description: "Perform music for audiences"
			},
			"chef": {
				name: "Chef",
				basePay: 45,
				cooldown: 12,
				description: "Cook delicious meals"
			},
			"engineer": {
				name: "Engineer",
				basePay: 60,
				cooldown: 18,
				description: "Design and build things"
			}
		};

		// Get or create economy data
		let economyData = await usersData.get(senderID, "economy");
		if (!economyData) {
			economyData = {
				bankBalance: 0,
				investments: {},
				transactions: [],
				lastDailyReward: "",
				bankLevel: 1,
				investmentLevel: 1,
				workLevel: 1,
				workCount: 0,
				lastWorkTime: 0
			};
			await usersData.set(senderID, { economy: economyData });
		}

		const userMoney = await usersData.get(senderID, "money");
		const currentTime = Date.now();
		const workLevel = economyData.workLevel || 1;
		const workCount = economyData.workCount || 0;

		switch (action) {
			case "list":
			case "l": {
				let msg = getLang("jobList");
				let jobList = "";

				for (const [key, job] of Object.entries(jobs)) {
					jobList += getLang("jobItem", job.name, job.basePay, job.cooldown) + "\n";
				}

				msg = msg.replace("%1", jobList);
				msg += "\n" + getLang("workLevel", workLevel);
				msg += "\n" + getLang("nextLevel", (workLevel * 10) - workCount);

				message.reply(msg);
				break;
			}

			default: {
				// Determine job
				let jobKey, job;
				if (action && jobs[action]) {
					jobKey = action;
					job = jobs[action];
				} else {
					// Random job
					const jobKeys = Object.keys(jobs);
					jobKey = jobKeys[Math.floor(Math.random() * jobKeys.length)];
					job = jobs[jobKey];
				}

				// Check cooldown
				const lastWorkTime = economyData.lastWorkTime || 0;
				const cooldownMs = job.cooldown * 60 * 1000; // Convert minutes to milliseconds
				const timeSinceLastWork = currentTime - lastWorkTime;

				if (timeSinceLastWork < cooldownMs) {
					const remainingMinutes = Math.ceil((cooldownMs - timeSinceLastWork) / (60 * 1000));
					return message.reply(getLang("workCooldown", remainingMinutes));
				}

				// Calculate earnings
				let earnings = job.basePay;
				
				// Level bonus
				const levelBonus = Math.floor(earnings * (workLevel - 1) * 0.1);
				earnings += levelBonus;

				// Random bonus/penalty (-20% to +20%)
				const randomFactor = 0.8 + (Math.random() * 0.4);
				earnings = Math.floor(earnings * randomFactor);

				// Update user money
				await usersData.set(senderID, {
					money: userMoney + earnings
				});

				// Update work data
				const newWorkCount = workCount + 1;
				const newWorkLevel = Math.floor(newWorkCount / 10) + 1;

				await usersData.set(senderID, {
					"economy.workLevel": newWorkLevel,
					"economy.workCount": newWorkCount,
					"economy.lastWorkTime": currentTime
				});

				// Add transaction
				const workTransaction = {
					type: "work",
					amount: earnings,
					description: `Worked as ${job.name}`,
					date: moment().format("DD/MM/YYYY HH:mm:ss"),
					relatedUser: null
				};

				if (!economyData.transactions) economyData.transactions = [];
				economyData.transactions.unshift(workTransaction);
				if (economyData.transactions.length > 20) economyData.transactions.pop();
				await usersData.set(senderID, { "economy.transactions": economyData.transactions });

				// Prepare response
				let msg = getLang("workSuccess", job.name, earnings, job.cooldown);
				
				if (levelBonus > 0) {
					msg += "\n" + getLang("bonus", levelBonus);
				}

				if (newWorkLevel > workLevel) {
					msg += "\n🎉 **LEVEL UP!** New work level: " + newWorkLevel;
				}

				message.reply(msg);
				break;
			}
		}
	}
};
