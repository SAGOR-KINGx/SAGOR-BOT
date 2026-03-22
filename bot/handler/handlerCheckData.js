const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;

const NAME_REFRESH_INTERVAL = 24 * 60 * 60 * 1000;

module.exports = async function (usersData, threadsData, event, api) {
        const { threadID } = event;
        const senderID = event.senderID || event.author || event.userID;

        // ———————————— CHECK THREAD DATA ———————————— //
        if (threadID) {
                try {
                        if (global.temp.createThreadDataError.includes(threadID))
                                return;

                        const findInCreatingThreadData = creatingThreadData.find(t => t.threadID == threadID);
                        if (!findInCreatingThreadData) {
                                if (global.db.allThreadData.some(t => t.threadID == threadID))
                                        return;

                                const threadData = await threadsData.create(threadID);
                                log.info("DATABASE", `New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`);
                        }
                        else {
                                await findInCreatingThreadData.promise;
                        }
                }
                catch (err) {
                        if (err.name != "DATA_ALREADY_EXISTS") {
                                global.temp.createThreadDataError.push(threadID);
                                log.err("DATABASE", getText("handlerCheckData", "cantCreateThread", threadID), err);
                        }
                }
        }


        // ————————————— CHECK USER DATA ————————————— //
        if (senderID) {
                try {
                        const findInCreatingUserData = creatingUserData.find(u => u.userID == senderID);
                        if (!findInCreatingUserData) {
                                const existingUser = db.allUserData.find(u => u.userID == senderID);
                                if (!existingUser) {
                                        const userData = await usersData.create(senderID);
                                        log.info("DATABASE", `New User: ${senderID} | ${userData.name} | ${config.database.type}`);
                                } else {
                                        const lastRefresh = existingUser.data?.lastNameRefresh || 0;
                                        if (api && Date.now() - lastRefresh > NAME_REFRESH_INTERVAL) {
                                                (async () => {
                                                        try {
                                                                const userInfo = (await api.getUserInfo(senderID))[senderID];
                                                                if (userInfo && userInfo.name) {
                                                                        if (userInfo.name !== existingUser.name) {
                                                                                await usersData.set(senderID, userInfo.name, "name");
                                                                        }
                                                                        await usersData.set(senderID, Date.now(), "data.lastNameRefresh");
                                                                }
                                                        } catch (e) {}
                                                })();
                                        }
                                }
                        }
                        else {
                                await findInCreatingUserData.promise;
                        }
                }
                catch (err) {
                        if (err.name != "DATA_ALREADY_EXISTS")
                                log.err("DATABASE", getText("handlerCheckData", "cantCreateUser", senderID), err);
                }
        }
};
