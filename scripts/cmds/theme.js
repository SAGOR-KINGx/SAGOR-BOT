const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "theme",
    aliases: ["aitheme", "customtheme"],
    version: "4.0",
    author: "Neoaz | SIFU",
    countDown: 5,
    role: 0,
    description: {
      vi: "Thiết kế và thay đổi giao diện nhóm bằng trí tuệ nhân tạo AI",
      en: "Design and change group interface using AI technology"
    },
    category: "box theme",
    guide: {
      vi: "   {pn}: Kiểm tra giao diện hiện tại" +
        "\n   {pn} <mô tả>: Sáng tạo chủ đề AI mới" +
        "\n   {pn} apply <ID>: Cài đặt chủ đề qua ID" +
        "\n   Ví dụ: {pn} aesthetic dream sky",
      en: "   {pn}: Check current theme status" +
        "\n   {pn} <prompt>: Create new AI themes" +
        "\n   {pn} apply <ID>: Install theme via ID" +
        "\n   Example: {pn} neon violet synthwave"
    }
  },

  langs: {
    vi: {
      missingPrompt: "⟦ 𝖶𝖠𝖱𝖭𝖨𝖭𝖦 𝖬𝖤𝖲𝖲𝖠𝖦𝖤 ⟧\n╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼\n⌬ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝖽𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇 𝗈𝗋 𝖨𝖣.\n⧫ 𝖤𝗑𝖺𝗆𝗉𝗅𝖾: {pn} 𝖼𝗒𝖻𝖾𝗋𝗉𝗎𝗇𝗄 𝖼𝗂𝗍𝗒",
      generating: "process get_AI_DESIGNER... \n⟖ 𝖲𝗒𝗌𝗍𝖾𝗆 𝗂𝗌 𝖼𝗋𝖾𝖺𝗍𝗂𝗇𝗀 𝗏𝗂𝗌𝗎𝖺𝗅 𝖼𝗈𝗇𝖼𝖾𝗉𝗍𝗌...",
      preview: "❖ ── ⦗𝗔𝗜 𝗧𝗛𝗘𝗠𝗘 𝗠𝗔𝗦𝗧𝗘𝗥⦘ ── ❖\n\n⌗ 𝖯𝗋𝗈𝗆𝗉𝗍: %2\n⌖ 𝖢𝗈𝗇𝖼𝖾𝗉𝗍𝗌: %1 𝖽𝖾𝗌𝗂𝗀𝗇𝗌 𝗅𝗈𝖺𝖽𝖾𝖽\n\n%3\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⦿ 𝖱𝖾𝗉𝗅𝗒 𝗐𝗂𝗍𝗁 [ 𝗇𝗎𝗆𝖻𝖾𝗋 ] 𝗍𝗈 𝗂𝗇𝗌𝗍𝖺𝗅𝗅!",
      themeInfo: "『 %1 』 𝖨𝖣: %2\n◿ 𝖢𝗈𝗅𝗈𝗋: %3",
      applying: "⌬ 𝖨𝗇𝗌𝗍𝖺𝗅𝗅𝗂𝗇𝗀 𝗇𝖾𝗐 𝖼𝗈𝗇𝖿𝗂𝗀𝗎𝗋𝖺𝗍𝗂𝗈𝗇...",
      applied: "〔 𝗧𝗛𝗘𝗠𝗘 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 〕",
      error: "⧁ 𝖲𝗒𝗌𝗍𝖾𝗆_𝖥𝖺𝗎𝗅𝗍: %1",
      applyError: "⧁ 𝖥𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗅𝗈𝖺𝖽 𝗍𝗁𝖾𝗆𝖾: %1",
      noThemes: "⦗!⦘ 𝖭𝗈 𝖽𝖺𝗍𝖺 𝖿𝗈𝗎𝗇𝖽 𝖿𝗈𝗋 𝗍𝗁𝗂𝗌 𝗌𝗉𝖾𝖼𝗂𝖿𝗂𝖼 𝗉𝗋𝗈𝗆𝗉𝗍.",
      invalidSelection: "⌬ 𝖲𝖾𝗅𝖾𝖼𝗍𝗂𝗈𝗇_𝖤𝗋𝗋𝗈𝗋: 𝖱𝖺𝗇𝗀𝖾 [ 1 - %1 ]",
      notAuthor: "⧂ 𝖠𝖼𝖼𝖾𝗌𝗌 𝖣𝖾𝗇𝗂𝖾𝖽: 𝖴𝗇𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 𝖨𝖣",
      missingThemeId: "⌗ 𝖨𝗇𝗉𝗎𝗍 𝖱𝖾𝗊𝗎𝗂𝗋𝖾𝖽: 𝖳𝗁𝖾𝗆𝖾_𝖨𝖣_𝖬𝗂𝗌𝗌𝗂𝗇𝗀",
      applyingById: "⌬ 𝖤𝗑𝖾𝖼𝗎𝗍𝗂𝗇𝗀 𝖳𝗁𝖾𝗆𝖾 𝖨𝖣: %1...",
      appliedById: "⧫ 𝖲𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝗅𝗂𝗇𝗄𝖾𝖽 𝗍𝗈 𝖨𝖣: %1",
      currentTheme: "❖ ── ⦗𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗦𝗘𝗧𝗧𝗨𝗣⦘ ── ❖\n\n⌗ 𝖳𝗁𝖾𝗆𝖾 𝖨𝖣: %1\n◿ 𝖠𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼: %2\n\n⦿ 𝖴𝗌𝖾 {pn} <𝗉𝗋𝗈𝗆𝗉𝗍> 𝗍𝗈 𝗈𝗏𝖾𝗋𝗋𝗂𝖽𝖾.",
      fetchingCurrent: "process 𝖲𝗒𝗇𝖼𝗁𝗋𝗈𝗇𝗂𝗓𝗂𝗇𝗀_𝖳𝗁𝖾𝗆𝖾_𝖣𝖺𝗍𝖺...",
      noCurrentTheme: "⌽ 𝖲𝗍𝖺𝗍𝗎𝗌: 𝖣𝖾𝖿𝖺𝗎𝗅𝗍 𝖬𝖾𝗌𝗌𝖾𝗇𝗀𝖾𝗋 𝖨𝗇𝗍𝖾𝗋𝖿𝖺𝗉𝖾.",
      showingPreviews: "⟖ 𝖦𝖾𝗇𝖾𝗋𝖺𝗍𝗂𝗇𝗀 𝗏𝗂𝗌𝗎𝖺𝗅 𝗋𝖾𝗇𝖽𝖾𝗋𝗌...",
      previousTheme: "⧉ 𝗣𝗿𝗲𝘃𝗶𝗼𝘂𝘀_𝗟𝗼𝗴: %2\n⌗ 𝖨𝖣: %1"
    },
    en: {
      missingPrompt: "⟦ 𝖶𝖠𝖱𝖭𝖨𝖭𝖦 𝖬𝖤𝖲𝖲𝖠𝖦𝖤 ⟧\n╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼╼\n⌬ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝖽𝖾𝗌𝖼𝗋𝗂𝗉𝗍𝗂𝗈𝗇 𝗈𝗋 𝖨𝖣.\n⧫ 𝖤𝗑𝖺𝗆𝗉𝗅𝖾: {pn} 𝖼𝗒𝖻𝖾𝗋𝗉𝗎𝗇𝗄 𝖼𝗂𝗍𝗒",
      generating: "process get_AI_DESIGNER... \n⟖ 𝖲𝗒𝗌𝗍𝖾𝗆 𝗂𝗌 𝖼𝗋𝖾𝖺𝗍𝗂𝗇𝗀 𝗏𝗂𝗌𝗎𝖺𝗅 𝖼𝗈𝗇𝖼𝖾𝗉𝗍𝗌...",
      preview: "🍓 ── ⦗𝗔𝗜 𝗧𝗛𝗘𝗠𝗘 𝗠𝗔𝗦𝗧𝗘𝗥⦘ ── 🍓\n\n⌗ 𝖯𝗋𝗈𝗆𝗉𝗍: %2\n⌖ 𝖢𝗈𝗇𝖼𝖾𝗉𝗍𝗌: %1 𝖽𝖾𝗌𝗂𝗀𝗇𝗌 𝗅𝗈𝖺𝖽𝖾𝖽\n\n%3\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n⦿ 𝖱𝖾𝗉𝗅𝗒 𝗐𝗂𝗍𝗁 [ 𝗇𝗎𝗆𝖻𝖾𝗋 ] 𝗍𝗈 𝗂𝗇𝗌𝗍𝖺𝗅𝗅!",
      themeInfo: "『 %1 』 𝖨𝖣: %2\n◿ 𝖢𝗈𝗅𝗈𝗋: %3",
      applying: "⌬ 𝖨𝗇𝗌𝗍𝖺𝗅𝗅𝗂𝗇𝗀 𝗇𝖾𝗐 𝖼𝗈𝗇𝖿𝗂𝗀𝗎𝗋𝖺𝗍𝗂𝗈𝗇...",
      applied: "〔🍓 𝗧𝗛𝗘𝗠𝗘 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 🍓〕",
      error: "⧁ 𝖲𝗒𝗌𝗍𝖾𝗆_𝖥𝖺𝗎𝗅𝗍: %1",
      applyError: "⧁ 𝖥𝖺𝗂𝗅𝖾𝖽 𝗍𝗈 𝗅𝗈𝖺𝖽 𝗍𝗁𝖾𝗆𝖾: %1",
      noThemes: "⦗!⦘ 𝖭𝗈 𝖽𝖺𝗍𝖺 𝖿𝗈𝗎𝗇𝖽 𝖿𝗈𝗋 𝗍𝗁𝗂𝗌 𝗉𝗋𝗈𝗆𝗉𝗍.",
      invalidSelection: "⌬ 𝖲𝖾𝗅𝖾𝖼𝗍𝗂𝗈𝗇_𝖤𝗋𝗋𝗈𝗋: 𝖱𝖺𝗇𝗀𝖾 [ 1 - %1 ]",
      notAuthor: "⧂ 𝖠𝖼𝖼𝖾𝗌𝗌 𝖣𝖾𝗇িয়ে𝖽: 𝖴𝗇𝖺𝗎𝗍𝗁𝗈𝗋𝗂𝗓𝖾𝖽 𝖨𝖣",
      missingThemeId: "⌗ 𝖨𝗇𝗉𝗎𝗍 𝖱𝖾𝗊𝗎𝗂𝗋𝖾𝖽: 𝖳𝗁𝖾𝗆𝖾_𝖨𝖣_𝖬𝗂𝗌𝗌𝗂𝗇𝗀",
      applyingById: "⌬ 𝖤𝗑𝖾𝖼𝗎𝗍𝗂𝗇𝗀 𝖳𝗁𝖾𝗆𝖾 𝖨𝖣: %1...",
      appliedById: "⧫ 𝖲𝗎𝖼𝖼𝖾𝗌𝗌𝖿𝗎𝗅𝗅𝗒 𝗅𝗂𝗇𝗄𝖾𝖽 𝗍𝗈 𝖨𝖣: %1",
      currentTheme: "❖ ── ⦗𝗖𝗨𝗥𝗥𝗘𝗡𝗧 𝗦𝗘𝗧𝗧𝗨𝗣⦘ ── ❖\n\n⌗ 𝖳𝗁𝖾𝗆𝖾 𝖨𝖣: %1\n◿ 𝖠𝖾𝗌𝗍𝗁𝖾𝗍𝗂𝖼: %2\n\n⦿ 𝖴𝗌𝖾 {pn} <𝗉𝗋𝗈𝗆𝗉𝗍> 𝗍𝗈 𝗈𝗏𝖾𝗋𝗋𝗂𝖽𝖾.",
      fetchingCurrent: "process 𝖲𝗒𝗇𝖼𝗁𝗋𝗈𝗇𝗂𝗓𝗂𝗇𝗀_𝖳𝗁𝖾𝗆𝖾_𝖣𝖺𝗍𝖺...",
      noCurrentTheme: "⌽ 𝖲𝗍𝖺𝗍𝗎𝗌: 𝖣𝖾𝖿𝖺𝗎𝗅𝗍 𝖬𝖾𝗌𝗌𝖾𝗇𝗀𝖾𝗋 𝖨𝗇𝗍𝖾𝗋𝖿𝖺𝗉𝖾.",
      showingPreviews: "⟖ 𝖦𝖾𝗇𝖾𝗋𝖺𝗍𝗂𝗇𝗀 𝗏𝗂𝗌𝗎𝖺𝗅 𝗋𝖾𝗇𝖽𝖾𝗋𝗌...",
      previousTheme: "⧉ 𝗣𝗿𝗲𝘃𝗶𝗼𝘂𝘀_𝗟𝗼𝗴: %2\n⌗ 𝖨𝖣: %1"
    }
  },

  onStart: async function ({ args, message, event, api, getLang, commandName }) {
    const { threadID, senderID } = event;
    const command = args[0]?.toLowerCase();

    if (command === "id") {
      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const themeId = threadInfo?.threadTheme?.id || "𝖲𝗍𝖺𝗇𝖽𝖺𝗋𝖽";
        return message.reply(`⌗ 𝖢𝗎𝗋𝗋𝖾𝗇𝗍 𝖳𝗁𝖾𝗆𝖾 𝖨𝖣: ${themeId}`);
      } catch (e) { return message.reply(getLang("error", e.message)); }
    }

    if (command === "apply" || command === "set") {
      const themeId = args[1];
      if (!themeId) return message.reply(getLang("missingThemeId"));
      try {
        message.reply(getLang("applyingById", themeId));
        await api.changeThreadColor(themeId, threadID);
        return message.reply(getLang("appliedById", themeId));
      } catch (e) { return message.reply(getLang("applyError", e.message)); }
    }

    const prompt = args.join(" ");

    if (!prompt) {
      try {
        const load = await message.reply(getLang("fetchingCurrent"));
        const threadInfo = await api.getThreadInfo(threadID);
        const theme = threadInfo.threadTheme;
        if (!theme) return message.reply(getLang("noCurrentTheme"));

        const themeId = theme.id || theme.theme_fbid || "𝖴𝗇𝗄𝗇𝗈𝗐𝗇";
        let colorInfo = theme.accessibility_label || threadInfo.color || "𝖢𝗎𝗌𝗍𝗈𝗆_𝖦𝗋𝖺𝖽𝗂𝖾𝗇𝗍";
        const attachments = [];

        try {
          const themeData = await api.fetchThemeData(themeId);
          if (themeData?.backgroundImage) {
            const url = themeData.backgroundImage.uri || themeData.backgroundImage.url;
            const stream = await getStreamFromURL(url, "theme.png");
            if (stream) attachments.push(stream);
          }
        } catch (err) {}

        api.unsendMessage(load.messageID);
        return message.reply({
          body: getLang("currentTheme", themeId, colorInfo),
          attachment: attachments
        });
      } catch (e) { return message.reply(getLang("error", e.message)); }
    }

    try {
      const wait = await message.reply(getLang("generating"));
      const themes = await api.createAITheme(prompt, 5);

      if (!themes || themes.length === 0) {
        api.unsendMessage(wait.messageID);
        return message.reply(getLang("noThemes"));
      }

      let themeList = "";
      const attachments = [];

      for (let i = 0; i < themes.length; i++) {
        const t = themes[i];
        const color = t.accessibility_label || (t.gradient_colors ? t.gradient_colors.join(" ⊸ ") : "𝖠𝖨_𝖣𝖾𝖿𝗂𝗇𝖾𝖽");
        themeList += getLang("themeInfo", i + 1, t.id, color) + "\n\n";

        const imgUrl = t.preview_image_urls?.light_mode || t.background_asset?.image?.uri;
        if (imgUrl) {
          const stream = await getStreamFromURL(imgUrl, `pre_${i}.png`);
          if (stream) attachments.push(stream);
        }
      }

      api.unsendMessage(wait.messageID);
      const msg = await message.reply({
        body: getLang("preview", themes.length, prompt, themeList.trim()),
        attachment: attachments
      });

      global.GoatBot.onReply.set(msg.messageID, {
        commandName,
        messageID: msg.messageID,
        author: senderID,
        themes: themes
      });
    } catch (e) { return message.reply(getLang("error", e.message)); }
  },

  onReply: async function ({ message, Reply, event, api, getLang }) {
    const { author, themes, messageID } = Reply;
    if (event.senderID !== author) return message.reply(getLang("notAuthor"));

    const choice = parseInt(event.body);
    if (isNaN(choice) || choice < 1 || choice > themes.length) {
      return message.reply(getLang("invalidSelection", themes.length));
    }

    const selected = themes[choice - 1];

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const oldId = threadInfo.threadTheme?.id || "𝖭𝗎𝗅𝗅";
      const oldName = threadInfo.threadTheme?.accessibility_label || "𝖢𝗅𝖺𝗌𝗌𝗂𝖼";

      await message.reply(getLang("applying"));
      await api.changeThreadColor(selected.id, event.threadID);
      
      message.reply(`${getLang("applied")}\n\n${getLang("previousTheme", oldId, oldName)}`);
      api.unsendMessage(messageID);
    } catch (e) {
      message.reply(getLang("applyError", e.message));
    }
  }
};