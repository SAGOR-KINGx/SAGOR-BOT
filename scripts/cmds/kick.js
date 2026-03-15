module.exports = {
    config: {
        name: "kick",
        version: "2.0",
        author: "SaGor",
        countDown: 2,
        role: 1, // শুধুমাত্র অ্যাডমিন বা তার উপরের রোলরা ব্যবহার করতে পারবে
        description: {
            en: "Kick members by tag, reply, or multiple mentions with protection."
        },
        category: "box chat",
        guide: {
            en: "{pn} @tags: Kick tagged members\n{pn} reply: Kick the person you replied to"
        }
    },

    langs: {
        en: {
            botNotAdmin: "≽^• ˕ • ྀི≼ \n\n I need Admin privileges to kick members. Please promote me and try again.",
            kickSuccess: "˶˃ ᵕ ˂˶ \n\n Successfully kicked %1 member(s).",
            kickError: "ᡕᠵデᡁ᠊╾━ \n\n Could not kick: %1 (Member might be an Admin or Error occurred).",
            noSelfKick: "(¬`‸´¬) \n\n ᶠᶸᶜᵏᵧₒᵤ !!",
            noAdminKick: "ᡕᠵデᡁ᠊╾━\n\n| I cannot kick '%1' because they are an Admin of this group."
        }
    },

    onStart: async function ({ message, event, args, threadsData, api, getLang }) {
        const { threadID, messageID, senderID, mentions, messageReply } = event;
        const botID = api.getCurrentUserID();

        // ১. চেক করা বট অ্যাডমিন কি না
        const threadInfo = await api.getThreadInfo(threadID);
        const adminIDs = threadInfo.adminIDs.map(item => item.id);

        if (!adminIDs.includes(botID)) {
            return message.reply(getLang("botNotAdmin"));
        }

        // ২. ইউজার আইডি কালেকশন (Reply বা Tag থেকে)
        let uids = [];
        if (event.type === "message_reply") {
            uids.push(messageReply.senderID);
        } else if (Object.keys(mentions).length > 0) {
            uids = Object.keys(mentions);
        } else {
            return message.reply(" ⊹ ࣪ ﹏𓊝﹏𓂁﹏⊹ ࣪ ˖\n\n| Please tag someone or reply to their message to kick.");
        }

        let successCount = 0;
        let errors = [];

        // ৩. কিক প্রসেস এবং প্রোটেকশন লজিক
        for (const uid of uids) {
            // প্রোটেকশন: নিজেকে কিক করবে না
            if (uid == botID) {
                errors.push(getLang("noSelfKick"));
                continue;
            }
            // প্রোটেকশন: গ্রুপের অ্যাডমিনদের কিক করবে না
            if (adminIDs.includes(uid)) {
                const name = (await api.getUserInfo(uid))[uid].name;
                errors.push(getLang("noAdminKick", name));
                continue;
            }

            try {
                await api.removeUserFromGroup(uid, threadID);
                successCount++;
            } catch (e) {
                errors.push(`ID: ${uid}`);
            }
        }

        // ৪. ফাইনাল রেসপন্স
        let response = "";
        if (successCount > 0) response += getLang("kickSuccess", successCount) + "\n";
        if (errors.length > 0) response += errors.join("\n");

        return message.reply(response.trim(), threadID, messageID);
    }
};