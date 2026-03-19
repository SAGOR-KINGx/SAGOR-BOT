const axios = require("axios");
const yts = require("yt-search");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "video",
    version: "23.0",
    author: "SAGOR",
    countDown: 5,
    role: 0,
    shortDescription: "Video with all thumbnails",
    category: "media",
    guide: "{pn} <search text>"
  },

  onStart: async function ({ api, event, args }) {
    try {
      const react = (emoji) =>
        api.setMessageReaction(emoji, event.messageID, event.threadID, () => {}, true);

      const query = args.join(" ");
      if (!query) return react("⚠️");

      react("🔍");

      const search = await yts(query);
      const list = search.videos.slice(0, 10);

      let msg = "🎬 VIDEO LIST (Top 10)\n\n";

      list.forEach((v, i) => {
        msg += `${i + 1}. ${v.title}\n⏱ ${v.timestamp}\n\n`;
      });

      msg += "👉 Reply 1-10";

      // 🔥 Download all thumbnails
      const attachments = [];

      for (let i = 0; i < list.length; i++) {
        const res = await axios({
          url: list[i].thumbnail,
          method: "GET",
          responseType: "stream"
        });
        attachments.push(res.data);
      }

      return api.sendMessage(
        {
          body: msg,
          attachment: attachments
        },
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "video",
            author: event.senderID,
            list,
            messageID: info.messageID
          });
        }
      );

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      const react = (emoji) =>
        api.setMessageReaction(emoji, event.messageID, event.threadID, () => {}, true);

      if (event.senderID !== Reply.author) return;

      const index = parseInt(event.body);
      if (isNaN(index) || index < 1 || index > 10) return react("⚠️");

      const video = Reply.list[index - 1];

      try { api.unsendMessage(Reply.messageID); } catch {}

      react("⏳");

      const json = await axios.get("https://raw.githubusercontent.com/SAGOR-OFFICIAL-09/api/refs/heads/main/ApiUrl.json");
      const baseApi = json.data.apis.video;

      const apiUrl = `${baseApi}/sagor?url=${encodeURIComponent(video.url)}&apikey=sagor&q=360`;

      const res = await axios.get(apiUrl);
      const data = res.data.data;

      if (!data || !data.download) return react("❌");

      const response = await axios({
        url: data.download,
        method: "GET",
        responseType: "stream"
      });

      const size = parseInt(response.headers["content-length"] || 0);

      if (size > 25 * 1024 * 1024) {
        react("⚠️");
        return api.sendMessage(`⚠️ Too large\n🔗 ${data.download}`, event.threadID);
      }

      const cacheDir = path.join(__dirname, "cache");
      if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

      const filePath = path.join(cacheDir, `${Date.now()}.mp4`);

      await new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      await api.sendMessage(
        {
          body: `🎬 ${video.title}\n⏱ ${video.timestamp}\n📺 360p`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID
      );

      fs.unlinkSync(filePath);

      react("✅");

    } catch (e) {
      api.setMessageReaction("❌", event.messageID, event.threadID, () => {}, true);
    }
  }
};
