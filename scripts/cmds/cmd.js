const axios = require("axios");
const { execSync } = require("child_process");
const fs = require("fs-extra");
const path = require("path");
const cheerio = require("cheerio");
const { client } = global;

const { configCommands } = global.GoatBot;
const { log, loading, removeHomeDir } = global.utils;

function getDomain(url) {
	const regex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n]+)/im;
	const match = url.match(regex);
	return match ? match[1] : null;
}

function isURL(str) {
	try {
		new URL(str);
		return true;
	}
	catch (e) {
		return false;
	}
}

module.exports = {
	config: {
		name: "cmd",
		version: "1.17",
		author: "NTKhang",
		countDown: 5,
		role: 4,
		description: {
			vi: "Quản lý các tệp lệnh của bạn",
			en: "Manage your command files"
		},
		category: "owner",
		guide: {
			vi: "   {pn} load <tên file lệnh>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <tên file lệnh>: Tải xuống và cài đặt một tệp lệnh từ một url, url là đường dẫn đến tệp lệnh (raw)"
				+ "\n   {pn} install <tên file lệnh> <code>: Tải xuống và cài đặt một tệp lệnh từ một code, code là mã của lệnh",
			en: "   {pn} load <command file name>"
				+ "\n   {pn} loadAll"
				+ "\n   {pn} install <url> <command file name>: Download and install a command file from a url, url is the path to the file (raw)"
				+ "\n   {pn} install <command file name> <code>: Download and install a command file from a code, code is the code of the command"
		}
	},

	langs: {
		vi: {
			missingFileName: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗧𝗵𝗶𝗲̂́𝘂 𝘁𝗲̂𝗻 𝗹𝗲̣̂𝗻𝗵!\n│ 📝 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗻𝗵𝗮̣̂𝗽 𝘁𝗲̂𝗻 𝗹𝗲̣̂𝗻𝗵 𝗯𝗮̣𝗻 𝗺𝘂𝗼̂́𝗻 𝗿𝗲𝗹𝗼𝗮𝗱\n└─❖",
			loaded: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗟𝗢𝗔𝗗𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗔𝗰𝘁𝗶𝘃𝗲\n└─❖",
			loadedError: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ ⚠️ 𝗘𝗿𝗿𝗼𝗿: %2\n│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: %3\n└─❖",
			loadedSuccess: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗟𝗢𝗔𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📊 𝗧𝗼𝘁𝗮𝗹: %1 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗥𝗲𝗮𝗱𝘆\n└─❖",
			loadedFail: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📊 𝗙𝗮𝗶𝗹𝗲𝗱: %1 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n│ 📝 𝗘𝗿𝗿𝗼𝗿𝘀:\n%2\n│ 😷 𝗢𝗽𝗲𝗻 𝗰𝗼𝗻𝘀𝗼𝗹𝗲 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀\n└─❖",
			missingCommandNameUnload: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗧𝗵𝗶𝗲̂́𝘂 𝘁𝗲̂𝗻 𝗹𝗲̣̂𝗻𝗵!\n│ 📝 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗻𝗵𝗮̣̂𝗽 𝘁𝗲̂𝗻 𝗹𝗲̣̂𝗻𝗵 𝗯𝗮̣𝗻 𝗺𝘂𝗼̂́𝗻 𝘂𝗻𝗹𝗼𝗮𝗱\n└─❖",
			unloaded: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗨𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗜𝗻𝗮𝗰𝘁𝗶𝘃𝗲\n└─❖",
			unloadedError: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗨𝗡𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ ⚠️ 𝗘𝗿𝗿𝗼𝗿: %2\n│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: %3\n└─❖",
			missingUrlCodeOrFileName: "┌─❖\n│ 🚨 𝗫𝟲𝟵𝗫 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗧𝗵𝗶𝗲̂́𝘂 𝘁𝗵𝗼̂𝗻𝗴 𝘁𝗶𝗻!\n│ 📝 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗻𝗵𝗮̣̂𝗽 𝘂𝗿𝗹 𝗵𝗼𝗮̣̆𝗰 𝗰𝗼𝗱𝗲\n│ 🔗 𝗩𝗮̀ 𝘁𝗲̂𝗻 𝗳𝗶𝗹𝗲 𝗹𝗲̣̂𝗻𝗵\n└─❖",
			missingUrlOrCode: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗧𝗵𝗶𝗲̂́𝘂 𝘂𝗿𝗹/𝗰𝗼𝗱𝗲!\n│ 📝 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗻𝗵𝗮̣̂𝗽 𝘂𝗿𝗹 𝗵𝗼𝗮̣̆𝗰 𝗰𝗼𝗱𝗲\n│ 𝗰𝘂̉𝗮 𝗳𝗶𝗹𝗲 𝗹𝗲̣̂𝗻𝗵\n└─❖",
			missingFileNameInstall: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗧𝗵𝗶𝗲̂́𝘂 𝘁𝗲̂𝗻 𝗳𝗶𝗹𝗲!\n│ 📝 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗻𝗵𝗮̣̂𝗽 𝘁𝗲̂𝗻 𝗳𝗶𝗹𝗲 (.𝗷𝘀)\n│ 𝗲̂̉ 𝗹𝘂̛𝘂 𝗹𝗲̣̂𝗻𝗵\n└─❖",
			invalidUrl: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗨𝗥𝗟 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̣!\n│ 📝 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝗻𝗵𝗮̣̂𝗽 𝘂𝗿𝗹 𝗵𝗼̛̣𝗽 𝗹𝗲̣\n└─❖",
			invalidUrlOrCode: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗞𝗵𝗼̂𝗻𝗴 𝗹𝗮̂́𝘆 đ𝘂̛𝗼̛̣𝗰 𝗰𝗼𝗱𝗲!\n│ 📝 𝗞𝗵𝗼̂𝗻𝗴 𝘁𝗶̀𝗺 𝘁𝗵𝗮̂́𝘆 𝗺𝗮̃ 𝗹𝗲̣̂𝗻𝗵\n│ 𝗵𝗼𝗮̣̆𝗰 𝘂𝗿𝗹 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̣\n└─❖",
			alreadExist: "┌─❖\n│ ⚠️ 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ 📁 𝗙𝗶𝗹𝗲 𝗮𝗹𝗿𝗲𝗮𝗱𝘆 𝗲𝘅𝗶𝘀𝘁𝘀!\n│ 🎯 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 📝 𝗢𝘃𝗲𝗿𝘄𝗿𝗶𝘁𝗲 𝗲𝘅𝗶𝘀𝘁𝗶𝗻𝗴 𝗳𝗶𝗹𝗲?\n│ 💡 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝘁𝗵𝗶𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺\n└─❖",
			installed: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 📍 𝗣𝗮𝘁𝗵: %2\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗔𝗰𝘁𝗶𝘃𝗲\n└─❖",
			installedError: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗜𝗡𝗦𝗧𝗔𝗟𝗟 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ ⚠️ 𝗘𝗿𝗿𝗼𝗿: %2\n│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: %3\n└─❖",
			missingFile: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗙𝗜𝗟𝗘 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 📝 𝗖𝗵𝗲𝗰𝗸 𝗳𝗶𝗹𝗲 𝗻𝗮𝗺𝗲 𝗼𝗿 𝗽𝗮𝘁𝗵\n└─❖",
			invalidFileName: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗙𝗜𝗟𝗘 𝗡𝗔𝗠𝗘!\n│ 📁 𝗙𝗶𝗹𝗲: %1\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗳𝗶𝗹𝗲 𝗻𝗮𝗺𝗲\n└─❖",
			unloadedFile: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗨𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗜𝗻𝗮𝗰𝘁𝗶𝘃𝗲\n└─❖"
		},
		en: {
			missingFileName: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗡𝗔𝗠𝗘!\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗻𝗮𝗺𝗲 𝘁𝗼 𝗿𝗲𝗹𝗼𝗮𝗱\n└─❖",
			loaded: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗟𝗢𝗔𝗗𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗔𝗰𝘁𝗶𝘃𝗲\n└─❖",
			loadedError: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ ⚠️ 𝗘𝗿𝗿𝗼𝗿: %2\n│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: %3\n└─❖",
			loadedSuccess: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗟𝗢𝗔𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📊 𝗧𝗼𝘁𝗮𝗹: %1 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗥𝗲𝗮𝗱𝘆\n└─❖",
			loadedFail: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📊 𝗙𝗮𝗶𝗹𝗲𝗱: %1 𝗰𝗼𝗺𝗺𝗮𝗻𝗱𝘀\n│ 📝 𝗘𝗿𝗿𝗼𝗿𝘀:\n%2\n│ 👀 𝗢𝗽𝗲𝗻 𝗰𝗼𝗻𝘀𝗼𝗹𝗲 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀\n└─❖",
			openConsoleToSeeError: "│ 😷 𝗢𝗽𝗲𝗻 𝗰𝗼𝗻𝘀𝗼𝗹𝗲 𝗳𝗼𝗿 𝗱𝗲𝘁𝗮𝗶𝗹𝘀",
			missingCommandNameUnload: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗡𝗔𝗠𝗘!\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗻𝗮𝗺𝗲 𝘁𝗼 𝘂𝗻𝗹𝗼𝗮𝗱\n└─❖",
			unloaded: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗨𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗜𝗻𝗮𝗰𝘁𝗶𝘃𝗲\n└─❖",
			unloadedError: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗨𝗡𝗟𝗢𝗔𝗗 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ ⚠️ 𝗘𝗿𝗿𝗼𝗿: %2\n│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: %3\n└─❖",
			missingUrlCodeOrFileName: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡!\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝘂𝗿𝗹/𝗰𝗼𝗱𝗲\n│ 🔗 𝗔𝗻𝗱 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗳𝗶𝗹𝗲 𝗻𝗮𝗺𝗲\n└─❖",
			missingUrlOrCode: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗨𝗥𝗟/𝗖𝗢𝗗𝗘!\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝘂𝗿𝗹 𝗼𝗿 𝗰𝗼𝗱𝗲\n│ 𝗼𝗳 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗳𝗶𝗹𝗲\n└─❖",
			missingFileNameInstall: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗠𝗜𝗦𝗦𝗜𝗡𝗚 𝗙𝗜𝗟𝗘 𝗡𝗔𝗠𝗘!\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗳𝗶𝗹𝗲 𝗻𝗮𝗺𝗲 (.𝗷𝘀)\n│ 𝘁𝗼 𝘀𝗮𝘃𝗲 𝘁𝗵𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱\n└─❖",
			invalidUrl: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗨𝗥𝗟!\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝗲𝗻𝘁𝗲𝗿 𝗮 𝘃𝗮𝗹𝗶𝗱 𝘂𝗿𝗹\n└─❖",
			invalidUrlOrCode: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗖𝗔𝗡'𝗧 𝗚𝗘𝗧 𝗖𝗢𝗗𝗘!\n│ 📝 𝗖𝗼𝘂𝗹𝗱𝗻'𝘁 𝗿𝗲𝘁𝗿𝗶𝗲𝘃𝗲 𝗰𝗼𝗺𝗺𝗮𝗻𝗱 𝗰𝗼𝗱𝗲\n│ 𝗼𝗿 𝗶𝗻𝘃𝗮𝗹𝗶𝗱 𝘂𝗿𝗹\n└─❖",
			alreadExist: "┌─❖\n│ ⚠️ 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ 📁 𝗙𝗜𝗟𝗘 𝗔𝗟𝗥𝗘𝗔𝗗𝗬 𝗘𝗫𝗜𝗦𝗧𝗦!\n│ 🎯 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 📝 𝗢𝘃𝗲𝗿𝘄𝗿𝗶𝘁𝗲 𝗲𝘅𝗶𝘀𝘁𝗶𝗻𝗴 𝗳𝗶𝗹𝗲?\n│ 💡 𝗥𝗲𝗮𝗰𝘁 𝘁𝗼 𝘁𝗵𝗶𝘀 𝗺𝗲𝘀𝘀𝗮𝗴𝗲 𝘁𝗼 𝗰𝗼𝗻𝗳𝗶𝗿𝗺\n└─❖",
			installed: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗜𝗡𝗦𝗧𝗔𝗟𝗟𝗘𝗗 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 📍 𝗣𝗮𝘁𝗵: %2\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗔𝗰𝘁𝗶𝘃𝗲\n└─❖",
			installedError: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗜𝗡𝗦𝗧𝗔𝗟𝗟 𝗙𝗔𝗜𝗟𝗘𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ ⚠️ 𝗘𝗿𝗿𝗼𝗿: %2\n│ 📝 𝗠𝗲𝘀𝘀𝗮𝗴𝗲: %3\n└─❖",
			missingFile: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗙𝗜𝗟𝗘 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 📝 𝗖𝗵𝗲𝗰𝗸 𝗳𝗶𝗹𝗲 𝗻𝗮𝗺𝗲 𝗼𝗿 𝗽𝗮𝘁𝗵\n└─❖",
			invalidFileName: "┌─❖\n│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗙𝗜𝗟𝗘 𝗡𝗔𝗠𝗘!\n│ 📁 𝗙𝗶𝗹𝗲: %1\n│ 📝 𝗣𝗹𝗲𝗮𝘀𝗲 𝘂𝘀𝗲 𝗮 𝘃𝗮𝗹𝗶𝗱 𝗳𝗶𝗹𝗲 𝗻𝗮𝗺𝗲\n└─❖",
			unloadedFile: "┌─❖\n│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n├─•\n│ ✅ 𝗨𝗡𝗟𝗢𝗔𝗗𝗘𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗!\n│ 📁 𝗖𝗼𝗺𝗺𝗮𝗻𝗱: %1\n│ 🎯 𝗦𝘁𝗮𝘁𝘂𝘀: 𝗜𝗻𝗮𝗰𝘁𝗶𝘃𝗲\n└─❖"
		}
	},

	onStart: async ({ args, message, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, event, commandName, getLang }) => {
		const { unloadScripts, loadScripts } = global.utils;
		
		// Command syntax help
		if (!args[0] || args[0].toLowerCase() === "help") {
			return message.reply(
				"┌─❖\n" +
				"│ 🚀 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧 - 𝗖𝗠𝗗 𝗠𝗔𝗡𝗔𝗚𝗘𝗥\n" +
				"├─•\n" +
				"│ 📋 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦:\n" +
				"│\n" +
				"│ • load <command>\n" +
				"│   ↳ Load a single command\n" +
				"│\n" +
				"│ • loadAll\n" +
				"│   ↳ Load all commands\n" +
				"│\n" +
				"│ • unload <command>\n" +
				"│   ↳ Unload a command\n" +
				"│\n" +
				"│ • install <url> <filename.js>\n" +
				"│   ↳ Install from URL\n" +
				"│\n" +
				"│ • install <filename.js> <code>\n" +
				"│   ↳ Install from code\n" +
				"├─•\n" +
				"│ 💡 𝗘𝗫𝗔𝗠𝗣𝗟𝗘𝗦:\n" +
				"│ • cmd load admin\n" +
				"│ • cmd install admin.js code\n" +
				"│ • cmd unload admin\n" +
				"└─❖"
			);
		}
		
		if (args[0] == "load" && args.length == 2) {
			if (!args[1])
				return message.reply(getLang("missingFileName"));
			const infoLoad = loadScripts("cmds", args[1], log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
			if (infoLoad.status == "success")
				message.reply(getLang("loaded", infoLoad.name));
			else {
				message.reply(getLang("loadedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else if ((args[0] || "").toLowerCase() == "loadall" || (args[0] == "load" && args.length > 2)) {
			const fileNeedToLoad = args[0].toLowerCase() == "loadall" ?
				fs.readdirSync(__dirname)
					.filter(file =>
						file.endsWith(".js") &&
						!file.match(/(eg)\.js$/g) &&
						(process.env.NODE_ENV == "development" ? true : !file.match(/(dev)\.js$/g)) &&
						!configCommands.commandUnload?.includes(file)
					)
					.map(item => item = item.split(".")[0]) :
				args.slice(1);
			const arraySucces = [];
			const arrayFail = [];

			for (const fileName of fileNeedToLoad) {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang);
				if (infoLoad.status == "success")
					arraySucces.push(fileName);
				else
					arrayFail.push(` ❌ ${fileName} → ${infoLoad.error.name}: ${infoLoad.error.message}`);
			}

			let msg = "";
			if (arraySucces.length > 0)
				msg += getLang("loadedSuccess", arraySucces.length);
			if (arrayFail.length > 0) {
				msg += (msg ? "\n" : "") + getLang("loadedFail", arrayFail.length, arrayFail.join("\n"));
			}

			message.reply(msg);
		}
		else if (args[0] == "unload") {
			if (!args[1])
				return message.reply(getLang("missingCommandNameUnload"));
			try {
				const infoUnload = unloadScripts("cmds", args[1], configCommands, getLang);
				infoUnload.status == "success" ?
					message.reply(getLang("unloaded", infoUnload.name)) :
					message.reply(getLang("unloadedError", infoUnload.name, infoUnload.error.name, infoUnload.error.message));
			} catch (error) {
				message.reply(getLang("unloadedError", args[1], error.name, error.message));
			}
		}
		else if (args[0] == "install") {
			let url = args[1];
			let fileName = args[2];
			let rawCode;

			if (!url || !fileName)
				return message.reply(getLang("missingUrlCodeOrFileName"));

			if (url.endsWith(".js") && !isURL(url)) {
				const tmp = fileName;
				fileName = url;
				url = tmp;
			}

			if (url.match(/(https?:\/\/(?:www\.|(?!www)))/)) {
				global.utils.log.dev("install", "url", url);
				if (!fileName || !fileName.endsWith(".js"))
					return message.reply(getLang("missingFileNameInstall"));

				const domain = getDomain(url);
				if (!domain)
					return message.reply(getLang("invalidUrl"));

				if (domain == "pastebin.com") {
					const regex = /https:\/\/pastebin\.com\/(?!raw\/)(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://pastebin.com/raw/$1");
					if (url.endsWith("/"))
						url = url.slice(0, -1);
				}
				else if (domain == "github.com") {
					const regex = /https:\/\/github\.com\/(.*)\/blob\/(.*)/;
					if (url.match(regex))
						url = url.replace(regex, "https://raw.githubusercontent.com/$1/$2");
				}

				rawCode = (await axios.get(url)).data;

				if (domain == "savetext.net") {
					const $ = cheerio.load(rawCode);
					rawCode = $("#content").text();
				}
			}
			else {
				global.utils.log.dev("install", "code", args.slice(1).join(" "));
				if (args[args.length - 1].endsWith(".js")) {
					fileName = args[args.length - 1];
					rawCode = event.body.slice(event.body.indexOf('install') + 7, event.body.indexOf(fileName) - 1);
				}
				else if (args[1].endsWith(".js")) {
					fileName = args[1];
					rawCode = event.body.slice(event.body.indexOf(fileName) + fileName.length + 1);
				}
				else
					return message.reply(getLang("missingFileNameInstall"));
			}

			if (!rawCode)
				return message.reply(getLang("invalidUrlOrCode"));

			if (fs.existsSync(path.join(__dirname, fileName)))
				return message.reply(getLang("alreadExist", fileName), (err, info) => {
					global.GoatBot.onReaction.set(info.messageID, {
						commandName,
						messageID: info.messageID,
						type: "install",
						author: event.senderID,
						data: {
							fileName,
							rawCode
						}
					});
				});
			else {
				const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
				infoLoad.status == "success" ?
					message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
					message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
			}
		}
		else
			message.reply(
				"┌─❖\n" +
				"│ 🚨 𝗦𝗔𝗚𝗢𝗥 𝗕𝗢𝗧\n" +
				"├─•\n" +
				"│ ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗖𝗢𝗠𝗠𝗔𝗡𝗗!\n" +
				"│ 📝 𝗨𝘀𝗲: 𝗰𝗺𝗱 𝗹𝗼𝗮𝗱/𝗹𝗼𝗮𝗱𝗔𝗹𝗹/𝗶𝗻𝘀𝘁𝗮𝗹𝗹/𝘂𝗻𝗹𝗼𝗮𝗱\n" +
				"│ 💡 𝗧𝘆𝗽𝗲: 𝗰𝗺𝗱 𝗵𝗲𝗹𝗽 𝗳𝗼𝗿 𝗴𝘂𝗶𝗱𝗲\n" +
				"└─❖"
			);
	},

	onReaction: async function ({ Reaction, message, event, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang }) {
		const { loadScripts } = global.utils;
		const { author, data: { fileName, rawCode } } = Reaction;
		if (event.userID != author)
			return;
		const infoLoad = loadScripts("cmds", fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode);
		infoLoad.status == "success" ?
			message.reply(getLang("installed", infoLoad.name, path.join(__dirname, fileName).replace(process.cwd(), ""))) :
			message.reply(getLang("installedError", infoLoad.name, infoLoad.error.name, infoLoad.error.message));
	}
};

// do not edit this code because it use for obfuscate code
const packageAlready = [];
const spinner = "\\|/-";
let count = 0;

function loadScripts(folder, fileName, log, configCommands, api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData, getLang, rawCode) {
	const storageCommandFilesPath = global.GoatBot[folder == "cmds" ? "commandFilesPath" : "eventCommandsFilesPath"];

	try {
		if (rawCode) {
			fileName = fileName.slice(0, -3);
			fs.writeFileSync(path.normalize(`${process.cwd()}/scripts/${folder}/${fileName}.js`), rawCode);
		}
		const regExpCheckPackage = /require(\s+|)\((\s+|)[`'"]([^`'"]+)[`'"](\s+|)\)/g;
		const { GoatBot } = global;
		const { onFirstChat: allOnFirstChat, onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;
		let setMap, typeEnvCommand, commandType;
		if (folder == "cmds") {
			typeEnvCommand = "envCommands";
			setMap = "commands";
			commandType = "command";
		}
		else if (folder == "events") {
			typeEnvCommand = "envEvents";
			setMap = "eventCommands";
			commandType = "event command";
		}
		let pathCommand;
		if (process.env.NODE_ENV == "development") {
			const devPath = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.dev.js`);
			if (fs.existsSync(devPath))
				pathCommand = devPath;
			else
				pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);
		}
		else
			pathCommand = path.normalize(process.cwd() + `/scripts/${folder}/${fileName}.js`);

		const contentFile = fs.readFileSync(pathCommand, "utf8");
		let allPackage = contentFile.match(regExpCheckPackage);
		if (allPackage) {
			allPackage = allPackage
				.map(p => p.match(/[`'"]([^`'"]+)[`'"]/)[1])
				.filter(p => p.indexOf("/") !== 0 && p.indexOf("./") !== 0 && p.indexOf("../") !== 0 && p.indexOf(__dirname) !== 0);
			for (let packageName of allPackage) {
				if (packageName.startsWith('@'))
					packageName = packageName.split('/').slice(0, 2).join('/');
				else
					packageName = packageName.split('/')[0];

				if (!packageAlready.includes(packageName)) {
					packageAlready.push(packageName);
					if (!fs.existsSync(`${process.cwd()}/node_modules/${packageName}`)) {
						let wating;
						try {
							wating = setInterval(() => {
								count++;
								loading.info("PACKAGE", `Installing ${packageName} ${spinner[count % spinner.length]}`);
							}, 80);
							execSync(`npm install ${packageName} --save`, { stdio: "pipe" });
							clearInterval(wating);
							process.stderr.clearLine();
						}
						catch (error) {
							clearInterval(wating);
							process.stderr.clearLine();
							throw new Error(`Can't install package ${packageName}`);
						}
					}
				}
			}
		}
		const oldCommand = require(pathCommand);
		const oldCommandName = oldCommand?.config?.name;
		if (!oldCommandName) {
			if (GoatBot[setMap].get(oldCommandName)?.location != pathCommand)
				throw new Error(`${commandType} name "${oldCommandName}" is already exist in command "${removeHomeDir(GoatBot[setMap].get(oldCommandName)?.location || "")}"`);
		}
		if (oldCommand.config.aliases) {
			let oldAliases = oldCommand.config.aliases;
			if (typeof oldAliases == "string")
				oldAliases = [oldAliases];
			for (const alias of oldAliases)
				GoatBot.aliases.delete(alias);
		}
		delete require.cache[require.resolve(pathCommand)];

		const command = require(pathCommand);
		command.location = pathCommand;
		const configCommand = command.config;
		if (!configCommand || typeof configCommand != "object")
			throw new Error("config of command must be an object");
		const scriptName = configCommand.name;

		const indexOnChat = allOnChat.findIndex(item => item == oldCommandName);
		if (indexOnChat != -1)
			allOnChat.splice(indexOnChat, 1);

		const indexOnFirstChat = allOnChat.findIndex(item => item == oldCommandName);
		let oldOnFirstChat;
		if (indexOnFirstChat != -1) {
			oldOnFirstChat = allOnFirstChat[indexOnFirstChat];
			allOnFirstChat.splice(indexOnFirstChat, 1);
		}

		const indexOnEvent = allOnEvent.findIndex(item => item == oldCommandName);
		if (indexOnEvent != -1)
			allOnEvent.splice(indexOnEvent, 1);

		const indexOnAnyEvent = allOnAnyEvent.findIndex(item => item == oldCommandName);
		if (indexOnAnyEvent != -1)
			allOnAnyEvent.splice(indexOnAnyEvent, 1);

		if (command.onLoad)
			command.onLoad({ api, threadModel, userModel, dashBoardModel, globalModel, threadsData, usersData, dashBoardData, globalData });

		const { envGlobal, envConfig } = configCommand;
		if (!command.onStart)
			throw new Error('Function onStart is missing!');
		if (typeof command.onStart != "function")
			throw new Error('Function onStart must be a function!');
		if (!scriptName)
			throw new Error('Name of command is missing!');
		if (configCommand.aliases) {
			let { aliases } = configCommand;
			if (typeof aliases == "string")
				aliases = [aliases];
			for (const alias of aliases) {
				if (aliases.filter(item => item == alias).length > 1)
					throw new Error(`alias "${alias}" duplicate in ${commandType} "${scriptName}" with file name "${removeHomeDir(pathCommand || "")}"`);
				if (GoatBot.aliases.has(alias))
					throw new Error(`alias "${alias}" is already exist in ${commandType} "${GoatBot.aliases.get(alias)}" with file name "${removeHomeDir(GoatBot[setMap].get(GoatBot.aliases.get(alias))?.location || "")}"`);
				GoatBot.aliases.set(alias, scriptName);
			}
		}
		if (envGlobal) {
			if (typeof envGlobal != "object" || Array.isArray(envGlobal))
				throw new Error("envGlobal must be an object");
			for (const key in envGlobal)
				configCommands.envGlobal[key] = envGlobal[key];
		}
		if (envConfig && typeof envConfig == "object" && !Array.isArray(envConfig)) {
			if (!configCommands[typeEnvCommand][scriptName])
				configCommands[typeEnvCommand][scriptName] = {};
			configCommands[typeEnvCommand][scriptName] = envConfig;
		}
		GoatBot[setMap].delete(oldCommandName);
		GoatBot[setMap].set(scriptName, command);
		fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
		const keyUnloadCommand = folder == "cmds" ? "commandUnload" : "commandEventUnload";
		const findIndex = (configCommands[keyUnloadCommand] || []).indexOf(`${fileName}.js`);
		if (findIndex != -1)
			configCommands[keyUnloadCommand].splice(findIndex, 1);
		fs.writeFileSync(client.dirConfigCommands, JSON.stringify(configCommands, null, 2));

		if (command.onChat)
			allOnChat.push(scriptName);

		if (command.onFirstChat)
			allOnFirstChat.push({ commandName: scriptName, threadIDsChattedFirstTime: oldOnFirstChat?.threadIDsChattedFirstTime || [] });

		if (command.onEvent)
			allOnEvent.push(scriptName);

		if (command.onAnyEvent)
			allOnAnyEvent.push(scriptName);

		const indexStorageCommandFilesPath = storageCommandFilesPath.findIndex(item => item.filePath == pathCommand);
		if (indexStorageCommandFilesPath != -1)
			storageCommandFilesPath.splice(indexStorageCommandFilesPath, 1);
		storageCommandFilesPath.push({
			filePath: pathCommand,
			commandName: [scriptName, ...configCommand.aliases || []]
		});

		return {
			status: "success",
			name: fileName,
			command
		};
	}
	catch (err) {
		const defaultError = new Error();
		defaultError.name = err.name;
		defaultError.message = err.message;
		defaultError.stack = err.stack;

		err.stack ? err.stack = removeHomeDir(err.stack || "") : "";
		fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
		return {
			status: "failed",
			name: fileName,
			error: err,
			errorWithThoutRemoveHomeDir: defaultError
		};
	}
}

function unloadScripts(folder, fileName, configCommands, getLang) {
	const pathCommand = `${process.cwd()}/scripts/${folder}/${fileName}.js`;
	if (!fs.existsSync(pathCommand)) {
		const err = new Error(getLang("missingFile", `${fileName}.js`));
		err.name = "FileNotFound";
		throw err;
	}
	const command = require(pathCommand);
	const commandName = command.config?.name;
	if (!commandName)
		throw new Error(getLang("invalidFileName", `${fileName}.js`));
	const { GoatBot } = global;
	const { onChat: allOnChat, onEvent: allOnEvent, onAnyEvent: allOnAnyEvent } = GoatBot;
	const indexOnChat = allOnChat.findIndex(item => item == commandName);
	if (indexOnChat != -1)
		allOnChat.splice(indexOnChat, 1);
	const indexOnEvent = allOnEvent.findIndex(item => item == commandName);
	if (indexOnEvent != -1)
		allOnEvent.splice(indexOnEvent, 1);
	const indexOnAnyEvent = allOnAnyEvent.findIndex(item => item == commandName);
	if (indexOnAnyEvent != -1)
		allOnAnyEvent.splice(indexOnAnyEvent, 1);
	if (command.config.aliases) {
		let aliases = command.config?.aliases || [];
		if (typeof aliases == "string")
			aliases = [aliases];
		for (const alias of aliases)
			GoatBot.aliases.delete(alias);
	}
	const setMap = folder == "cmds" ? "commands" : "eventCommands";
	delete require.cache[require.resolve(pathCommand)];
	GoatBot[setMap].delete(commandName);
	log.master("UNLOADED", getLang("unloaded", commandName));
	const commandUnload = configCommands[folder == "cmds" ? "commandUnload" : "commandEventUnload"] || [];
	if (!commandUnload.includes(`${fileName}.js`))
		commandUnload.push(`${fileName}.js`);
	configCommands[folder == "cmds" ? "commandUnload" : "commandEventUnload"] = commandUnload;
	fs.writeFileSync(global.client.dirConfigCommands, JSON.stringify(configCommands, null, 2));
	return {
		status: "success",
		name: fileName
	};
}

global.utils.loadScripts = loadScripts;
global.utils.unloadScripts = unloadScripts;
