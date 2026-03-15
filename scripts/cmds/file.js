const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "filecmd",
    aliases: ["file"],
    version: "1.0",
    author: "Sagor",
    countDown: 5,
    role: 2,
    shortDescription: "View code of a command",
    longDescription: "View the raw source code of any command in the commands folder",
    category: "owner",
    guide: "{pn} <commandName>"
  },

  onStart: async function ({ args, message }) {
    const cmdName = args[0];
    if (!cmdName) return message.reply("🍓 Please provide the command name.\n🍓 Example: file edit");

    const cmdPath = path.join(__dirname, `${cmdName}.js`);
    if (!fs.existsSync(cmdPath)) return message.reply(`❌ | Command "${cmdName}" not found in this folder.`);

    try {
      const code = fs.readFileSync(cmdPath, "utf8");

      if (code.length > 19000) {
        return message.reply("😮‍💨 | This file is too large to display.");
      }

      return message.reply({
        body: `${code}`
      });
    } catch (err) {
      console.error(err);
      return message.reply("😿 | Error reading the file.");
    }
  }
};
