/*

Discord bot, HeBot

Excute
http://excute.xyz
oys1751@gmail.com
Twitter	: @Excute
Github	: https://github.com/Excute

*/

"use strict";


/* ~~~~ Dependencies ~~~~ */
const Commands = require("./commands.json");
// const Strings = require("./strings.json");
const SwPowerTable = require("./sw_power_table.json");
const TablesForm = require("./tables.json");

const Discord = require("discord.js");
const Request = require("request");
const { google } = require("googleapis");
const ExprParser = require("expr-eval").Parser;
const Postgres = require("pg");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_JP_API_KEY = process.env.GOOGLE_JP_API_KEY;
const CSE_ID = process.env.CSE_ID;
const CSE_JP_ID = process.env.CSE_JP_ID;
const CustomSearch = google.customsearch("v1");
const CustomSearchJp = google.customsearch("v1");

const HtmlEntitiesC = require("html-entities").Html5Entities;
const HtmlEntities = new HtmlEntitiesC();
const Os = require("os");
const Process = require("process");
// const Fs = require("fs");


/* ~~~~ Constants ~~~~ */
const Bot = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;
// const BOT_SELF_ID = "354220127799214092";
var BOT_SELF_ID = "";
// const BOT_PREFIX = "//";
const BOT_PREFIX = process.env.BOT_PREFIX;
const BOT_LOG_CHANNEL = "531633010433458178";
//const BOT_ERROR_LOG_CHANNEL = "601660546387017739";
//const BOT_ANIME_CHANNEL = "599143858135236609";
const DEVELOPER_ID = "272958758999818241";
//const DEVELOPER_DMID = "354221823120113665";

const COLOR_GREEN = 0x4CAF50;
const COLOR_INFO = 0x2196F3;
const COLOR_WARN = 0xFFC107;
const COLOR_ERROR = 0xF44336;
const COLOR_DEBUG = 0x9C27B0;

const MSG_TEXT_LIMIT = 2048; // description, footer.text
const MSG_TITLE_LIMIT = 256; // title, field.name, author.name
const MSG_FIELDS_LIMIT = 25; // fields
const MSG_VALUE_LIMIT = 1024; // field.value
const MSG_EMBED_TOTAL_LIMIT = 6000;

const pgPool = new Postgres.Pool({
	connectionString: process.env.DATABASE_URL,
	ssl: process.env.DATABASE_URL.includes("localhost") ? false : true
});

const OHYS_JSON_URL = "http://torrents.ohys.net/t/json.php?dir=disk";
const OHYS_URL = "http://torrents.ohys.net/t/";
const OHYS_COLUMN_TITLE = "t";
const OHYS_COLUMN_URL = "a";
// const OHYS_FAVICON = "https://ohys.seia.io/ohys.png";
// const OHYS_FAVICON = "https://cdn.discordapp.com/icons/427143000574001154/a57f25f9b0c1b052a1af84a3dc0a4802.png?size=128"
const OHYS_FAVICON = "https://cdn.discordapp.com/icons/427143000574001154/a57f25f9b0c1b052a1af84a3dc0a4802.png"
// const OHYS_PAGE_URL = "http://raws.ohys.net/t/";
const OHYS_PAGE_URL = "https://cryental.dev/services/anime/";
const OHYS_TITLE_ONLY_REGEX = /(\[ohys-raws\])|(\((?:.(?!\())+$)/gi;
const OHYS_TITLE_WITH_SPEC_REGEX = /(\[ohys-raws\])|(.torrent)/gi;

//var tables = undefined;

// var incomeMessageIds = [];

const CRYENTAL_LIST = "https://cryental.dev/api/ohys/list";
const CRYENTAL_THUMBNAIL = "https://cryental.dev/api/ohys/thumbnail";
const CRYENTAL_TIMETABLE = "https://cryental.dev/api/ohys/timetable";
const CRYENTAL_DOWNLOAD = "https://cryental.dev/api/ohys/download";
const CRYENTAL_DETAIL = "https://cryental.dev/api/ohys/detail?id=";

const CRYENTAL_HOME = "https://cryental.dev";
const CRYENTAL_SERVICE = "http://cryental.dev/services/anime/";
// const CRYENAL_FAVICON = "http://cryental.dev/favicon.ico";
const CRYENAL_FAVICON = "http://avatars3.githubusercontent.com/u/44664655?s=400&u=d14de3aab704fa4dc5827692b7d8aafd89fe4286&v=4";
const ANIDB_ANIME_URI = "http://anidb.net/anime/";


/* ~~~~ General functions ~~~~ */
function addZeroToNumber(length, num) {
	var res = "" + num;
	if (num >= 0 && length > 0 && Math.pow(10, length - 1) > num) {
		for (var i = 1; i < length; i++) {
			if (Math.pow(10, i) > num) {
				res = "0" + res;
			}
		}
	}
	return res;
}

function getKoTimeString() {
	var koDate = new Date();
	koDate.setUTCHours(koDate.getUTCHours() + 9);
	var koDay = "토";
	switch (koDate.getDay()) {
		case 0:
			koDay = "일";
			break;
		case 1:
			koDay = "월";
			break;
		case 2:
			koDay = "화";
			break;
		case 3:
			koDay = "수";
			break;
		case 4:
			koDay = "목";
			break;
		case 5:
			koDay = "금";
			break;
		default:
			koDay = "토";
			break;
	}
	return "" + addZeroToNumber(2, koDate.getMonth() + 1) + "/" + addZeroToNumber(2, koDate.getDate()) + " " + koDay + ", " + addZeroToNumber(2, koDate.getHours()) + ":" + addZeroToNumber(2, koDate.getMinutes()) + ":" + addZeroToNumber(2, koDate.getSeconds()) + "." + addZeroToNumber(3, koDate.getMilliseconds());
}

/*
function milsecToDHMS(milSec) {
	var tmp = milSec / 1000; // Sec
	return "" + Math.floor(tmp / 86400) + "D" +
		addZeroToNumber(2, Math.floor((tmp % 86400) / 3600)) + ":" +
		addZeroToNumber(2, Math.floor((tmp % 3600) / 60)) + ":" +
		addZeroToNumber(2, tmp % 60);
}
*/

function secToDHMS(sec) {
	return "" + Math.floor(sec / 86400) + "D " +
		addZeroToNumber(2, Math.floor((sec % 86400) / 3600)) + "h " +
		addZeroToNumber(2, Math.floor((sec % 3600) / 60)) + "m " +
		addZeroToNumber(2, Math.floor(sec % 60)) + "s";
}

/*
function getValueOfHex(hexStr) {
	return parseInt(hexStr.replace("#", "0x"));
}
*/

function rollDices(numA, numB) {
	var iNumA = Number(numA);
	var iNumB = Number(numB);
	if (!Number.isInteger(iNumA) || !Number.isInteger(iNumB)) {
		return [-1];
	} else if (iNumA > 101 || iNumA < 0 || iNumB > 101 || iNumB < 0) {
		return [-2];
	} else {
		var dices = [];
		for (var i = 0; i < iNumA; i++) {
			dices.push(Math.floor(Math.random() * iNumB + 1));
		}
		return dices;
	}
}
/*
async function doMath(iForm, callback) {
	var formArray = [];
	var calculateStack = [];
	var tmpPnt = 0;
	var operands = ["+", "-", "/", "*", "%", "(", ")", "{", "}", "[", "]"];
	// var operateFlag = true;
	var braceArray = [];
	for (var i = 0; i < iForm.length; i++) {
		if (operands.find((anOper) => { return anOper === iForm[i]; })) {
			if (i === tmpPnt) { return callback("no term between operands", undefined); } else {
				formArray.push(iForm.substr(tmpPnt, i).trim());
				formArray.push(iForm[i]);
				tmpPnt = i + 1;
			}
		}
	}
	// tmpPnt = formArray.length - 1;
	tmpPnt = 0;
	for (var i = 0; i < formArray.length; i++) {
		if (formArray[i] === "(") {
			var tmpFlag = false;
			for (var j = i + 1; j < formArray.length; j++) {
				if (formArray[j] === ")") {
					braceArray.push({
						brace: "()",
						point: [i, j]
					});
					tmpFlag = true;
				}
			}
			if (!tmpFlag) { return callback("no brace close", undefined); }
		}
		if (formArray[i] === "{") {
			var tmpFlag = false;
			for (var j = i + 1; j < formArray.length; j++) {
				if (formArray[j] === "}") {
					braceArray.push({
						brace: "{}",
						point: [i, j]
					});
					tmpFlag = true;
				}
			}
			if (!tmpFlag) { return callback("no brace close", undefined); }
		}
		if (formArray[i] === "[") {
			var tmpFlag = false;
			for (var j = i + 1; j < formArray.length; j++) {
				if (formArray[j] === "]") {
					braceArray.push({
						brace: "[]",
						point: [i, j]
					});
					tmpFlag = true;
				}
			}
			if (!tmpFlag) { return callback("no brace close", undefined); }
		}
	}
	for (var i = 0; i + 1 < formArray.length; i++) {
		for (var j = i + 1; j < formArray.length; j++) {
			if (formArray[i].point[0] > formArray[j].point[0]) {
				if ((!formArray[i].point[0] > formArray[j].point[1]) || (!formArray[i].point[1] < formArray[j].point[1])) {
					return callback("wrong brace", undefined);
				}
			} else if (formArray[i].point[0] < formArray[j].point[0]) {
				if ((!formArray[i].point[1] > formArray[j].point[1]) || (!formArray[i].point[1] < formArray[j].point[0])) {
					return callback("wrong brace", undefined);
				}
			} else {
				return callback("WHAT??", undefined);
			}
		}
	}


	formArray.map((aTerm) => { if (Number.isNaN(Number(aTerm))) { operateFlag = false } });
	if (!operateFlag) {
		callback("not a number", undefined);
	} else {

	}
}
*/

async function doMathWithDice(iForm, callback) {
	var formArray = [];
	var operands = ["+", "-", "/", "*", "%", "(", ")"];
	var operandsRegExp = ["\\\+", "\\\-", "\\\/", "\\\*", "\\\%", "\\\(", "\\\)"];
	var tmpForm = iForm;
	// for (var i = 0; i < iForm.length; i++) {
	// 	if (operands.find((anOper) => { return anOper === iForm[i]; })) {
	// 		formArray.push(iForm.substr(, i).trim());
	// 		formArray.push(iForm[i]);
	// 	}
	// }
	// formArray.push(iForm);
	// operands.map((anOper) => {
	// 	formArray = formArray.map((someTerms) => {
	// 		return someTerms.split(anOper);
	// 	});
	// });
	var formStr = "";
	var dicedStr = "";

	operandsRegExp.map((anOper) => {
		tmpForm = tmpForm.replace(new RegExp(anOper, "g"), " " + anOper[1] + " ");
	});
	formArray = tmpForm.split(" ");
	formArray = formArray.map((aTerm) => { return aTerm.trim(); });
	// formArray = formArray.map((aTerm) => {
	// 	if ((aTerm != undefined) && (aTerm != null) && (aTerm != "")) { return aTerm; }
	// });
	formArray = formArray.filter((aTerm) => {
		return (aTerm != null) && (aTerm.length > 0);
	});
	// printLog("[DBG] formArray : \n" + JSON.stringify(formArray), undefined, undefined);
	// var dicedArray = formArray.map((aTerm) => {
	// 	if (aTerm.toLowerCase().search("d") > -1) {
	// 		var diceArg = aTerm.split("d");
	// 		var dices = rollDices(diceArg[0], diceArg[1]);
	// 		return ["("].concat(dices).concat([")"]);
	// 	} else { return aTerm; }
	// });

	var dicedArray = [];
	var diceArg = undefined;
	for (var i = 0; i < formArray.length; i++) {
		diceArg = undefined;
		if (formArray[i].toLowerCase().search("d") > -1) {
			diceArg = formArray[i].split("d");
		} else if (formArray[i].toLowerCase().search("ㅇ") > -1) {
			diceArg = formArray[i].split("ㅇ");
		} else if (formArray[i].toLowerCase().search("ㄷ") > -1) {
			diceArg = formArray[i].split("ㄷ");
		}
		// if (formArray[i].toLowerCase().search("d") > -1) {
		// var diceArg = formArray[i].split("d");
		if (diceArg != undefined) {
			var dices = rollDices(diceArg[0], diceArg[1]);
			// return ["("].concat(dices).concat([")"]);
			if (dices[0] < 0) {
				return callback("wrong dice");
			}
			dicedArray = dicedArray.concat(["("]).concat(dices.join(" + ").split(" ")).concat([")"]);
			// formStr += " **" + formArray[i] + "**";
			formStr += " **" + formArray[i].replace(new RegExp("[dㅇㄷ]", "g"), "D") + "**";
			dicedStr += " ( **" + dices.join("** + **") + "** )";
		} else {
			dicedArray.push(formArray[i]);
			formStr += " " + avoidMarkdown(formArray[i]);
			dicedStr += " " + avoidMarkdown(formArray[i]);
		}
	}
	// printLog("[DBG] formArray : \n" + JSON.stringify(formArray), undefined, undefined);
	// printLog("[DBG] dicedArray : \n" + JSON.stringify(dicedArray), undefined, undefined);

	// printLog("[DBG] formStr = " + formStr);
	// printLog("[DBG] dicedStr = " + dicedStr);

	try {
		// printLog("[DBG] dicedArray result = " + ExprParser.evaluate(dicedArray.join(" ")), undefined, undefined);
		callback(undefined, formStr, dicedStr, ExprParser.evaluate(dicedArray.join(" ")));
	} catch (error) {
		// printLog("[DBG] dicedArray ERROR = " + error, undefined, undefined);
		callback("parse error");
	}

	// callback(undefined,)


	// printLog("[DBG] dicedArray result = " + eval(dicedArray.join(" ")), undefined, undefined);
}

function stringifyHtmlSnippet(snp) {
	var res = HtmlEntities.decode(snp);
	var mRules = [{
		html: [],
		replace: "*",
		replace_regExp: "\\\*",
		reverse_replace: "＊"
	}, {
		html: ["<b>", "<\/b>"],
		replace: "**",
		replace_regExp: "\\\*\\\*",
		reverse_replace: "＊＊"
	}, {
		html: ["<i>", "<\/i>", "<em>", "<\/em>"],
		replace: "_",
		replace_regExp: "_",
		reverse_replace: "＿"
	}, {
		html: ["<strike>", "<\/strike>"],
		replace: "~~",
		replace_regExp: "~~",
		reverse_replace: "～～"
	}, {
		html: ["<br>", "<\/br>", "<br \/>"],
		replace: "",
		reverse_replace: undefined
	}, {
		html: [],
		replace: "`",
		replace_regExp: "\\\`",
		reverse_replace: "｀"
	}];

	for (var i = 0; i < mRules.length; i++) {
		// printLog("Trying replace = " + mRules[i].replace);
		if (mRules[i].reverse_replace != undefined) {
			// printLog("A Before\t: " + res);
			res = res.replace(new RegExp(mRules[i].replace_regExp, "g"), mRules[i].reverse_replace);
			// printLog("A After\t: " + res);
		}
		var htmls = "";
		mRules[i].html.map((aHtml) => {
			if (htmls.length > 0) {
				htmls += "|" + aHtml;
			} else {
				htmls = "(" + aHtml;
			}
		});
		htmls += htmls.length > 0 ? ")" : "";
		if (htmls.length > 0) {
			// printLog("B Before\t: " + res);
			res = res.replace(new RegExp(htmls, "g"), mRules[i].replace);
			// printLog("B After\t: " + res);
		}
	}
	return res;
}

function avoidMarkdown(inputString) {
	var tmpStr = inputString;
	var rules = [{
		from: "\\\*",
		to: "＊"
	}, {
		from: "_",
		to: "＿"
	}, {
		from: "~~",
		to: "～～"
	}];
	rules.map((aRule) => {
		tmpStr.replace(new RegExp(aRule.from, "g"), aRule.to);
	})
	return tmpStr;
}

async function tryRequestOld(tries, options, callback) {
	var mTries = (Number.isInteger(tries)) && (Number(tries) >= 0) ? Number(tries) : 1;
	if (mTries > 0) {
		Request.get(options, (error, response, body) => {
			if ((!error) && (response.statusCode === 200)) {
				callback(error, response, body);
			} else {
				if (mTries > 0) {
					tryRequestOld(--mTries, options, callback);
				} else {
					callback(error, response, body);
				}
			}
		});
	}
}

async function tryRequest(options, tries, callback) {
	var mTries = (Number.isInteger(tries)) && (Number(tries) >= 0) ? Number(tries) : 1;
	if (mTries > 0) {
		Request(options, (error, response, body) => {
			if (error) {
				printLog(`tryRequest timeout`, {
					embed: {
						color: COLOR_WARN,
						title: `tryRequest() timeout ${tries - 1} time left`,
						description: `url : ${options.url}`
					}
				}, `tryRequest timeout`);
				tryRequest(options, --mTries, callback);
			} else {
				callback(error, response, body);
			}
		});
	} else {
		Request(options, (error, response, body) => {
			callback(error, response, body);
		});
	}
}

async function searchGoogle(sOpt, callback) {
	sOpt.auth = GOOGLE_API_KEY;
	sOpt.cx = CSE_ID;
	CustomSearch.cse.list(sOpt)
		.then((response) => {
			callback(undefined, response);
		},
			(error) => {
				if (error.toString().startsWith("Error: This API requires billing")) {
					printLog("[WAN] Custom search query limit exceeded :\n" + error, {
						embed: {
							color: COLOR_WARN,
							title: "Custom search query limit exceeded",
							description: error
						}
					});
					sOpt.auth = GOOGLE_JP_API_KEY;
					sOpt.cx = CSE_JP_ID;
					CustomSearchJp.cse.list(sOpt)
						.then((response) => {
							callback(undefined, response);
						},
							(errorJP) => {
								callback(errorJP, undefined);
							});
				} else {
					callback(error, undefined);
				}
			})
		.catch((error) => {
			callback(error, undefined);
		});
}

function getHelpEmbed(message) {
	var helpCmdList = "";
	Commands.map((aCmd) => {
		if (aCmd.visible) {
			helpCmdList = helpCmdList.concat("```http\n" + aCmd.inputs[0] + " (" + aCmd.inputs[1] + ") : " + aCmd.short_usage + "```");
		}
	});
	switch (message.channel.type) {
		default:
		case "text":
			return {
				embed: {
					title: (message.guild.me.nickname != null ? message.guild.me.nickname : Bot.user.username) + " 사용법",
					color: COLOR_GREEN,
					description: "**" + (message.guild.me.nickname != null ? message.guild.me.nickname : Bot.user.username) + " 호출 방법**\n" +
						"```ini\n" + BOT_PREFIX + "[명령어] ([--옵션])```" +
						"```ini\n" + message.guild.me.nickname + " [명령어] ([--옵션])```" +
						"```ini\n@" + message.guild.me.nickname + "(멘션) [명령어] ([--옵션])```" +
						"(" + message.guild.me + "에게 직접 DM으로도 사용 가능, 바로 명령어부터 시작)\n\n" +
						"**헤봇 명령어 목록**\n" + helpCmdList +
						"모든 명령어 뒤에 `--help(--도움말)` 옵션을 붙여 자세한 사용법을 알 수 있습니다"
					// fields: [{
					// 	name: "헤봇 호출 방법",
					// 	inline: false,
					// 	value: "```ini\n" + BOT_PREFIX + "[명령어] ([--옵션])\n" +
					// 		message.guild.me.nickname + " [명령어]\n" +
					// 		"@" + message.guild.me.nickname + " [명령어]\n```" +
					// 		"(" + message.guild.me + "에게 직접 DM으로도 사용 가능, 바로 명령어부터 시작)\n"
					// }, {
					// 	name: "명령어 목록",
					// 	inline: false,
					// 	value: helpCmdList
					// }]
				}
			};
			break;
		case "dm":
			return {
				embed: {
					title: Bot.user.username + " 사용법",
					color: COLOR_GREEN,
					description: "**" + Bot.user.username + " 명령어 목록**" + helpCmdList +
						"모든 명령어 뒤에 `--help(--도움말)` 옵션을 붙여 자세한 사용법을 알 수 있습니다"
				}
			};
		case "group":
			return {
				embed: {
					title: Bot.user.username + " 사용법",
					color: COLOR_GREEN,
					description: "**" + Bot.user.username + " 호출 방법**\n" +
						"```ini\n" + BOT_PREFIX + "[명령어] ([--옵션])```" +
						"```ini\n" + Bot.user.username + " [명령어] ([--옵션])```" +
						"```@" + Bot.user.username + " [명령어]\n ([--옵션])```" +
						"(" + Bot.user.username + "에게 직접 DM으로도 사용 가능, 바로 명령어부터 시작)\n\n" +
						"**" + Bot.user.username + " 명령어 목록**" + helpCmdList +
						"모든 명령어 뒤에 `--help(--도움말)` 옵션을 붙여 자세한 사용법을 알 수 있습니다"
				}
			};
			break;
	}
}

function getDetailedHelpEmbed(iCommand) {
	var res = {
		embed: {
			title: iCommand.command + " 명령어 사용법",
			color: COLOR_INFO
		}
	};
	Commands.map((aCmd) => {
		if (aCmd.command === iCommand.command) {
			res.embed.description = aCmd.inputs.map((aCmdInput) => {
				return " `" + aCmdInput + "`";
			}).toString().trim() + "\n" +
				aCmd.usage;
			res.embed.fields = aCmd.options.map((anOpt) => {
				return {
					name: "--" + anOpt.name,
					value: anOpt.inputs.map((anOptInput) => {
						return " `--" + anOptInput + "`";
					}).toString().trim() + "\n" + anOpt.usage,
					inline: false
				};
			});
		}
	});
	return res;
}


/* ~~~~ DataBase functions ~~~~ */
async function initializePostgres(callback) {
	pgPool.connect((error, client, release) => {
		if (error) {
			callback(error, undefined);
		} else {
			callback(undefined, pgPool);
		}
		release();
	});
}

async function queryToDb(iQuery, callback) {
	pgPool.connect((connectionError, client, release) => {
		if (connectionError) { callback(connectionError, undefined) } else {
			pgPool.query(iQuery, (queryError, queryResult) => {
				// if(queryError){callback(queryError,undefined)}
				callback(queryError, queryResult);
			});
		}
		release();
	});
}

async function testDb(callback) {
	// anime
	queryToDb("SELECT * FROM " + TablesForm[0].name, (qSelErr, qSelRes) => {
		if (qSelErr) {
			if (qSelErr.code === "42P01") {
				queryToDb(`CREATE TABLE ${TablesForm[0].name} ( ${TablesForm[0].columns[0]} text, ${TablesForm[0].columns[1]} text )`, (qCreateErr, qCreateRes) => {
					callback(qCreateErr, qCreateRes);
				});
			} else {
				callback(qSelErr, undefined);
			}
		} else {
			callback(undefined, qSelRes);
		}
	});

	// channel_anime
	queryToDb("SELECT * FROM " + TablesForm[1].name, (qSelErr, qSelRes) => {
		if (qSelErr) {
			if (qSelErr.code === "42P01") {
				queryToDb(`CREATE TABLE ${TablesForm[1].name} ( ${TablesForm[1].columns[0]} text, ${TablesForm[1].columns[1]} text )`, (qCreateErr, qCreateRes) => {
					callback(qCreateErr, qCreateRes);
				});
			} else {
				callback(qSelErr, undefined);
			}
		} else {
			callback(undefined, qSelRes);
		}
	});

	// server_meme
	queryToDb("SELECT * FROM " + TablesForm[2].name, (qSelErr, qSelRes) => {
		if (qSelErr) {
			if (qSelErr.code === "42P01") {
				queryToDb(`CREATE TABLE ${TablesForm[2].name} ( ${TablesForm[2].columns[0]} text, ${TablesForm[2].columns[1]} text, ${TablesForm[2].columns[2]} text )`, (qCreateErr, qCreateRes) => {
					callback(qCreateErr, qCreateRes);
				});
			} else {
				callback(qSelErr, undefined);
			}
		} else {
			callback(undefined, qSelRes);
		}
	});
}

async function updateCryental(callback) {

}

async function updateAnimeDb(callback) {
	tryRequest({
		uri: OHYS_JSON_URL,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; Charset=utf-8"
		},
		method: "GET",
		encoding: "utf8",
		timeout: 3000
	}, 3,
		(ohysReqErr, ohysReqRes, ohysReqBody) => {
			if (ohysReqErr) {
				printLogError(undefined, 0, "tryRequest(ohysJSON) error", ohysReqErr);
				if (callback != undefined) {
					callback(ohysReqErr, undefined);
				}
			} else {
				//var liveAnimeList = JSON.parse(ohysReqBody);
				//var newAnimeList = [];
				queryToDb("SELECT * FROM " + TablesForm[0].name, (qSelAnimesErr, qSelAnimesRes) => {
					if (qSelAnimesErr) {
						printLogError(undefined, 0, "qSelAnimesErr", JSON.stringify(qSelAnimesErr, null, 2));
						if (callback != undefined) {
							callback(JSON.stringify(qSelAnimesErr, null, 2), undefined);
						}
					} else {
						//answerToTheChannel(message, JSON.stringify(qSelAnimesRes, null, 2), undefined, (sentMessage) => { message.channel.stopTyping(); });
						//printLog(JSON.stringify(qSelAnimesRes, null, 2), undefined, undefined);
						//printLog(JSON.stringify(liveAnimeList, null, 2), undefined, undefined);
						//var tmpInsertQuery = "INSERT INTO " + TablesForm[0].name + "(";

						var newAnimes = JSON.parse(ohysReqBody).filter((anAnimeFromLive) => {
							return !qSelAnimesRes.rows.includes(anAnimeFromLive);
						});

						queryToDb(`SELECT * FROM ${TablesForm[1].name}`, (qSelChannelErr, qSelChannelRes) => {
							if (qSelChannelErr) {
								printLogError(undefined, 0, "qSelChannelErr", JSON.stringify(qSelChannelErr, null, 2));
							} else {
								qSelChannelRes.rows.map((aChannelAnime) => {
									newAnimes.map((aNewAnime) => {
										if (aNewAnime[OHYS_COLUMN_TITLE].toLowerCase().includes(aChannelAnime.anime_text)) {
											searchGoogle({
												q: aNewAnime[OHYS_COLUMN_TITLE].replace(/(\[ohys-raws\])|(\((?:.(?!\())+$)/gi, "").trim(),
												num: 1,
												start: 1,
												searchType: "image"
											}, (searchErr, searchRes) => {
												if (searchErr) {
													printLogError(undefined, 0, "updateAnimeDb(), get new Anime image error", "updateAnimeDb(), get new Anime image error");
												}

											})
											Bot.channels.get(aChannelAnime.channel).send(undefined, {
												embed: {
													color: COLOR_INFO,
													author: {
														name: "Ohys-raws",
														url: "http://raws.ohys.net/t/",
														icon_url: OHYS_FAVICON
													},
													title: aNewAnime[OHYS_COLUMN_TITLE].replace(/(\[ohys-raws\])|(.torrent)/gi, "").trim(),
													description: "New Anime found from [Ohys-Raws](http://raws.ohys.net/t/v)",
													url: `OHYS_URL${aNewAnime[OHYS_COLUMN_URL]}`
												}
											});
											/*.then((sentMessage) => {
												if (callback != undefined) {
													callback(sentMessage);
												}
											})
											.catch((error) => {
												printLogError(undefined, 0, "answerToTheChannel() failed", JSON.stringify(error, null, 2));
											});*/
										}
									})

								})

							}
						});
						liveAnimeList.map((anAnime) => {
							queryToDb(`INSERT INTO ${TablesForm[0].name} (${TablesForm[0].columns[0]}, ${TablesForm[0].columns[1]})
												VALUES ($$${anAnime.t}$$, $$${anAnime.a}$$);`, (qInsertErr, qInsertRes) => {
								if (qInsertErr) {
									printLogError(message, 0, "qInsertErr in Anime", JSON.stringify(qInsertErr, null, 2));
									answerToTheChannel(message, "애니DB 쿼리 삽입 실패", undefined, undefined);
								}
							});
						});
						queryToDb("SELECT * FROM " + TablesForm[0].name, (qReSelErr, qReSelRes) => {
							if (qReSelErr) {
								printLogError(message, 0, "qReSelErr", JSON.stringify(qReSelErr, null, 2));
								answerToTheChannel(message, "qReSelErr", undefined, undefined);
							} else {
								printLog(JSON.stringify(qReSelRes, null, 2), undefined, undefined);
							}
						});
					}
				});
				//answerToTheChannel(message, "```\n" + JSON.parse(ohysReqBody) + "\n```", undefined, (sentMessage) => {
				/*answerToTheChannel(message, "```\n" + (ohysReqBody) + "\n```", undefined, (sentMessage) => {
					message.channel.stopTyping();
				});*/
				//printLog(ohysReqBody, undefined, undefined);
			}
		}
	);
}


// async function 


/* ~~~~ Sending functions ~~~~ */
function getGeneralDebugLog(message) {
	var tmpEmbed = {
		embed: {
			color: COLOR_DEBUG,
			title: "General Debug"
		}
	};
	// if (iTitle != undefined) {
	// 	tmpEmbed.embed.title = iTitle;
	// }
	// if (iColor != undefined) {
	// 	tmpEmbed.embed.color = iColor;
	// }
	if (message != undefined) {
		switch (message.channel.type) {
			default:
			case "text":
				tmpEmbed.embed.fields = [{
					name: "Server",
					value: message.channel.guild.name + "\n(Owner : " + `<@${message.channel.guild.ownerID}>` + ")",
					inline: true
				},
				{
					name: "Channel",
					value: `<#${message.channel.id}>`,
					inline: true
				},
				{
					name: "Author",
					value: `<@!${message.author.id}>`,
					inline: true
				},
				{
					name: "Message",
					value: "```" + message.content + "```",
					inline: false
				}
				];
				break;
			case "group":
				tmpEmbed.embed.fields = [{
					name: "Author",
					value: `<@!${message.author.id}>`,
					inline: true
				},
				{
					name: "Message",
					value: "```" + message.content + "```",
					inline: false
				}
				];
				break;
			case "dm":
				tmpEmbed.embed.fields = [{
					name: "Author",
					value: `<@!${message.author.id}>`,
					inline: true
				},
				{
					name: "Message",
					value: "```" + message.content + "```",
					inline: false
				}
				];
				break;
		}
	}
	return tmpEmbed;
}

async function printLog(consoleLog, logEmbed, logText) {
	if (consoleLog != undefined) {
		console.log("HeBot : " + consoleLog + "\n");
	}
	if (logEmbed != undefined) {
		logEmbed.embed.footer = { text: getKoTimeString() };
		Bot.channels.get(BOT_LOG_CHANNEL).send((logText === undefined ? "" : logText), logEmbed)
			.catch((error) => {
				console.log("HeBot : [ERR] printLog() :\n" + error);
			});
	} else if (logText != undefined) {
		Bot.channels.get(BOT_LOG_CHANNEL).send(logText).catch((error) => {
			console.log("HeBot : [ERR] printLog() :\n" + error);
		});
	} else {
		Bot.channels.get(BOT_LOG_CHANNEL).send(consoleLog).catch((error) => {
			console.log("HeBot : [ERR] printLog() :\n" + error);
		});
	}
}

async function printLogError(message, level, consoleLog, eDesc) {
	var tmpEmbed = {
		embed: {
			color: COLOR_ERROR
		}
	};
	if (level != 0) {
		tmpEmbed.embed.color = COLOR_WARN;
	}
	if (message != undefined) {
		tmpEmbed = getGeneralDebugLog(message);
	}
	// tmpEmbed.embed.color = COLOR_ERROR;
	// tmpEmbed.title = eTitle;
	tmpEmbed.embed.title = consoleLog;
	tmpEmbed.embed.description = eDesc;
	if (level === 0) {
		printLog("[ERR] " + consoleLog, tmpEmbed, `<@${DEVELOPER_ID}> !! 에러라구!!`);
	} else {
		printLog("[WRN] " + consoleLog, tmpEmbed, "☢️ ＷＡＲＮＩＮＧ ☢️");
	}
}

async function answerToTheChannel(inputMessage, outputText, outputOptions, callback) {
	inputMessage.channel.send(outputText, (outputOptions != undefined ? outputOptions : null))
		.then((sentMessage) => {
			// if (stopTypingFlag) {
			// 	// responseFeedback(inputMessage, 0);
			// 	// inputMessage.channel.stopTyping();
			// }
			if (callback != undefined) {
				callback(sentMessage);
			}
		})
		.catch((error) => {
			printLogError(inputMessage, 0, "answerToTheChannel() failed", JSON.stringify(error, null, 2));
		});
}


/* ~~~~ Main response function ~~~~ */
async function checkBotCall(message) {
	if (message.type === "DEFAULT" && message.author.id != Bot.user.id) {
		switch (message.channel.type) {
			default:
			case "text":
				// switch (message.type) {
				// 	case "DEFAULT":
				// 		break;
				// 	case "CALL":
				// 		break;
				// }
				if (message.content.startsWith(BOT_PREFIX)) {
					handleArgs(message, message.content.replace(BOT_PREFIX, "").trim());
				} else if (message.content.startsWith((message.guild.me.nickname != null ? message.guild.me.nickname : Bot.user.username) + " ")) {
					handleArgs(message, message.content.replace((message.guild.me.nickname != null ? message.guild.me.nickname : Bot.user.username) + " ", "").trim());
				} else if (message.isMentioned(BOT_SELF_ID)) {
					handleArgs(message, message.content.replace(`<@!${BOT_SELF_ID}>`, "").trim());
				}
				break;
			case "group":
				if (message.content.startsWith(BOT_PREFIX)) {
					handleArgs(message, message.content.replace(BOT_PREFIX, "").trim());
				} else if (message.content.startsWith(Bot.user.username)) {
					handleArgs(message, message.content.replace(Bot.user.username, "").trim());
				} else if (message.isMentioned(BOT_SELF_ID)) {
					handleArgs(message, message.content.replace(`<@!${BOT_SELF_ID}>`, "").trim());
				}
				break;
			case "dm":
				handleArgs(message, message.content);
				break;
		}
	}
}

async function handleArgs(message, content) {
	if (content.length < 1) {
		answerToTheChannel(message, "명령어가 없서염... 아래의 도움말을 참고해주세여", getHelpEmbed(message), undefined);
	} else {
		var rawArgsArray = content.replace(/　/g, " ").split(" ");
		var foundCommand = Commands.find((aCmd) => {
			return aCmd.inputs.find((anInput) => { return anInput === rawArgsArray[0].toLowerCase(); });
		});

		if (foundCommand === undefined) {
			answerToTheChannel(message,
				"**" + avoidMarkdown(rawArgsArray[0]) + "**...? 제가 모르는 명령어에염...", undefined);
		} else {
			var argsStruct = {
				command: undefined,
				options: [],
				// { name: "option name", value: "option arg" }
				arg: undefined
			};
			argsStruct.command = foundCommand.command;
			rawArgsArray.shift();

			var detailedHelpFlag = false;
			for (var i = 0; i < rawArgsArray.length; i++) {
				if (rawArgsArray[i].startsWith("--")) {
					if (Commands.find((aCmd) => { return aCmd.command === "help"; }).inputs.find((aHelpInput) => {
						return aHelpInput === rawArgsArray[i].replace("--", "").toLowerCase().trim();
					})) {
						if (foundCommand.command === "help") {
							answerToTheChannel(message, "", {
								embed: {
									color: COLOR_INFO,
									title: "헤봇 정보",
									description: "재미로 만들어봤다가 점점 커진 봇입니당",
									thumbnail: {
										url: Bot.user.displayAvatarURL
									},
									fields: [{
										name: "Github",
										value: "https://github.com/Excute/HeBot003",
										inline: false
									}, {
										name: "Discord server",
										value: "https://discord.gg/Wt6N6AX",
										inline: false
									}, {
										name: "Developer",
										value: `<@!${DEVELOPER_ID}>` + ", http://excute.xyz",
										inline: false
									}]
								}
							}, undefined);
						} else { answerToTheChannel(message, undefined, getDetailedHelpEmbed(foundCommand), undefined); }
						detailedHelpFlag = true;
					} else if (!detailedHelpFlag) {
						if ((foundCommand.multi_options) || (argsStruct.options.length < 1)) {
							var anOptionFound = foundCommand.options.find((anCmdOpt) => {
								return anCmdOpt.inputs.find((anCmdOptInput) => { return anCmdOptInput === rawArgsArray[i].toLowerCase().replace("--", "") });
							});
							if (anOptionFound != undefined) {
								if (anOptionFound.need_arg) {
									if (rawArgsArray[i + 1] != undefined) {
										argsStruct.options.push({
											name: anOptionFound.name,
											value: rawArgsArray[i + 1]
										});
										rawArgsArray[i] = rawArgsArray[i + 1] = "";
									} else {
										argsStruct.options.push({ name: anOptionFound.name });
										rawArgsArray[i] = "";
									}
								} else {
									argsStruct.options.push({ name: anOptionFound.name });
									rawArgsArray[i] = "";
								}
							}
						}
					}
				}
			}
			if (!detailedHelpFlag) {
				var tmpArg = "";
				for (var i = 0; i < rawArgsArray.length; i++) {
					if (rawArgsArray[i].length > 0) { tmpArg += rawArgsArray[i] + " "; }
				}
				if (tmpArg.length > 0) { argsStruct.arg = tmpArg.trim(); }

				/*
				printLog("Debug 190612_01", {
					embed: {
						color: COLOR_DEBUG,
						title: "Debug 190612_01",
						fields: [{
							name: "command",
							value: argsStruct.command + " .",
							inline: false
						}, {
							name: "options",
							value: JSON.stringify(argsStruct.options) + " .",
							inline: false
						}, {
							name: "arg",
							value: argsStruct.arg + " .",
							inline: false
						}]
					}
				});
				*/
				// message.channel.startTyping().then(()=>{
				// 	responseToMessage(message, argsStruct);
				// });
				await message.channel.startTyping();
				responseToMessage(message, argsStruct).then(() => {
					message.channel.stopTyping();
				});
			}
		}
	}
}

/*
async function responseFeedback(message, startFlag) {
	if (incomeMessageIds.includes((message.id))) { // Exist
		incomeMessageIds = incomeMessageIds.filter((anIncomeMessageId) => {
			return anIncomeMessageId != message.id;
		});
		if (startFlag < 1) {
			message.channel.stopTyping();
			message.reactions.map((aReact) => {
				if (aReact.me && (aReact.emoji.identifier === "%E2%9D%97")) {
					aReact.remove();
					// printLog(`Logging Emoji`, {
					// 	embed: {
					// 		description: `emoji : ${aReact.emoji}\nidentifier : ${aReact.emoji.identifier}\nname : ${aReact.emoji.name}`
					// 	}
					// }, undefined)
				}
			});
			message.react("✅");
		}
	} else { // Not exist
		incomeMessageIds.push(message.id);
		if (startFlag > 0) {
			message.channel.startTyping();
			message.react("❗");
		}
	}
}
*/

async function responseToMessage(message, args) {
	// if (incomeMessageIds.find((anMessageId) => {
	// 		return anMessageId === message.id;
	// 	}) === undefined) {
	// 	message.channel.startTyping().then((responsingMessage) => {
	// 		incomeMessageIds.push(responsingMessage.id);
	// 	});
	// }
	// responseFeedback(message, 1);
	var authorCallname = "";
	switch (message.channel.type) {
		default:
		case "text":
			authorCallname = message.guild.member(message.author).nickname === null ? message.author.username : message.guild.member(message.author).nickname;
			break;
		case "group":
		case "dm":
			authorCallname = message.author.username;
			break;
	}
	switch (args.command) {
		default:
			printLog("[WUT] Unexpected command!", getGeneralDebugLog(message, "Error command", COLOR_ERROR), `<@${DEVELOPER_ID}>` + "!! 이상한 커멘드가 왔다구!!");
			answerToTheChannel(message, "엥!? 여긴 어떻게 들어왔어?!?", getHelpEmbed(message), undefined);
			break;
		case "help":
			answerToTheChannel(message, "", getHelpEmbed(message), undefined);
			break;
		case "uptime":
			if (args.options.find((anInputOpt) => {
				return anInputOpt.name === "system";
			}) != undefined) {
				answerToTheChannel(message, "", {
					embed: {
						title: "봇 서버 업타임",
						description: "" + secToDHMS(Os.uptime()),
						color: COLOR_GREEN
					}
				}, undefined);
			} else {
				answerToTheChannel(message, "", {
					embed: {
						title: "봇 업타임",
						description: "" + secToDHMS(Process.uptime()),
						color: COLOR_GREEN
					}
				}, undefined);
			}
			break;
		case "chanid":
			answerToTheChannel(message, "```" + message.channel.id + "```", undefined, undefined);
			break;
		case "restart":
			var restartJokeFlag = 0;
			if (message.content.includes("죽")) {
				restartJokeFlag = 1;
			} else if (message.content.includes("스위치")) {
				restartJokeFlag = 2;
			}
			var restartJoke = [
				[{
					answer: "재로그인 시도",
					login: "봇 재로그인 성공"
				}],
				[{
					answer: "*히데붓!!*",
					login: "*햣하-! 되살아났다-!*"
				}],
				[{
					answer: "*아니! 한계다, 누르겠어! 지금이다!!*",
					login: "*해, 해냈어! 발동했다! 돌아왔다고!*"
				}]
			];
			answerToTheChannel(message, (restartJoke[restartJokeFlag][0].answer), undefined, (sentMessage) => {
				Bot.destroy().then(() => {
					Bot.login(BOT_TOKEN).then(() => {
						answerToTheChannel(message, restartJoke[restartJokeFlag][0].login, undefined, undefined);
					});
				});
			})

			break;
		case "dice":
			if (args.arg === undefined || args.arg.length < 1) {
				var diceEmoji = ":waitWhat:";
				switch (rollDices(1, 6)[0]) {
					case 1:
						diceEmoji = ":one:";
						break;
					case 2:
						diceEmoji = ":two:";
						break;
					case 3:
						diceEmoji = ":three:";
						break;
					case 4:
						diceEmoji = ":four:";
						break;
					case 5:
						diceEmoji = ":five:";
						break;
					case 6:
						diceEmoji = ":six:";
						break;
				}
				if (args.options != undefined || args.options.length > 0) {
					diceEmoji += "\n";
					args.options.map((anOpt) => {
						if (anOpt.name === "comment") {
							diceEmoji += "*#" + anOpt.value + "* ";
						}
					});
				}
				answerToTheChannel(message, "", {
					embed: {
						color: COLOR_GREEN,
						title: ":game_die: " + authorCallname + "의 다이스 롤!",
						description: diceEmoji
					}
				}, undefined);
			} else {
				doMathWithDice(args.arg, (error, formStr, dicedStr, formSum) => {
					if (error) {
						//TODO : 오류 자세히 말해주기?
						answerToTheChannel(message, "수식 입력 오류인것 같은데염...", undefined, undefined);
					} else {
						// var tmpComment = undefined;
						var tmpTitle = ":game_die: **" + authorCallname + "**, " + formStr + "\n = " + dicedStr + "\n = **" + formSum + "**";
						if (args.options != undefined || args.options.length > 0) {
							tmpTitle += "\n";
							args.options.map((anOpt) => {
								if (anOpt.name === "comment") {
									tmpTitle += "*#" + anOpt.value + "* ";
								}
							});
						}
						answerToTheChannel(message, undefined, {
							embed: {
								color: COLOR_GREEN,
								title: tmpTitle
								// title: ":game_die: **" + authorCallname + "**, " + formStr + "\n = " + dicedStr + "\n = **" + formSum + "**\n" + (tmpComment != undefined ? +tmpComment : ""),
								// description: formStr + "\n = " + dicedStr + "\n = **" + formSum + "**\n*#" + tmpComment + "*"
							}
						}, undefined);
					}
				});
			}
			/*if (args.arg.length > 0) {
				var diceInput = args.arg.toLowerCase().split("d");
				if (diceInput.filter((aDiceInput) => {
						return (Number.isInteger(Number(aDiceInput))) &&
							(Number(aDiceInput) > 0) &&
							(Number(aDiceInput) < 101);
					}).length == 2) {
					rollDices(diceInput[0], diceInput[1], (dices) => {
						if (dices.length === 1) {
							answerToTheChannel(message, "", {
									embed: {
										color: COLOR_GREEN,
										title: ":game_die: " + authorCallname + "의 " + diceInput[1] + "면체 주사위 " + diceInput[0] + "개 다이스 롤!",
										description: "**" + dices[0] + "**"
									}
								},
								(sentMessage) => {
									message.channel.stopTyping();
								});
						} else {
							var diceSum = dices[0];
							var diceTxt = "" + dices[0];
							for (var i = 1; i < dices.length; i++) {
								diceSum += dices[i];
								diceTxt += " + " + dices[i];
							}
							diceTxt += " = **" + diceSum + "**";
							answerToTheChannel(message, "", {
									embed: {
										color: COLOR_GREEN,
										title: ":game_die: " + authorCallname + "의 " + diceInput[1] + "면체 주사위 " + diceInput[0] + "개 다이스 롤!",
										description: diceTxt
									}
								},
								(sentMessage) => {
									message.channel.stopTyping();
								});
						}
					});
				} else {
					answerToTheChannel(message, "*" + args.arg + "* 는 주사위 구문이 잘못된것 같은데여...", getDetailedHelpEmbed(args),
						(sentMessage) => {
							message.channel.stopTyping();
						});
				}
			} else {
				rollDices(1, 6, (aDices) => {
					var diceEmoji = "";
					switch (aDices[0]) {
						case 1:
							diceEmoji = ":one:";
							break;
						case 2:
							diceEmoji = ":two:";
							break;
						case 3:
							diceEmoji = ":three:";
							break;
						case 4:
							diceEmoji = ":four:";
							break;
						case 5:
							diceEmoji = ":five:";
							break;
						case 6:
							diceEmoji = ":six:";
							break;
					}
					answerToTheChannel(message, "", {
							embed: {
								color: COLOR_GREEN,
								title: ":game_die: " + authorCallname + "의 다이스 롤!",
								description: diceEmoji
							}
						},
						(sentMessage) => {
							message.channel.stopTyping();
						});
				});
			}*/
			break;
		case "google":
		case "youtube":
		case "namu":
		case "soundcloud":
			// printLog("[DBG] search arg = " + args.arg, undefined, undefined);
			if (args.arg === undefined || args.arg === null || args.arg.length === 0) {
				answerToTheChannel(message, "검색어가 입력되지 않았서염...", undefined, undefined);
			} else {
				var qNum = 3;
				var qPage = 1;
				switch (args.command) {
					// case "google":
					// break;
					case "youtube":
					case "soundcloud":
						qNum = 1;
						break;
					// case "namu":
					// break;
				}
				// if(args.arg===undefined||args.arg===null||args.arg.length<1){
				// 	answerToTheChannel(message,)
				// }
				args.options.map((anOpt) => {
					if (anOpt != undefined &&
						anOpt.name != undefined &&
						Number.isInteger(Number(anOpt.value))) {
						if (anOpt.name === "quantity") {
							qNum = anOpt.value;
						} else if (anOpt.name === "page") {
							qPage = anOpt.value;
						}
					}
				});
				if (qNum < 1 || qPage < 1) {
					answerToTheChannel(message, "*" + qNum + "*개 검색결과의 *" + qPage + "* 페이지를 가져온다는건 이상한데여...", undefined, undefined);
				} else {
					var iQuery = {
						q: args.arg,
						num: qNum,
						start: 1 + (qNum * (qPage - 1))
					};
					switch (args.command) {
						// case "google":
						// 	break;
						case "youtube":
							iQuery = {
								q: args.arg,
								num: qNum,
								start: 1 + (qNum * (qPage - 1)),
								siteSearch: "www.youtube.com/watch"
							};
							break;
						case "namu":
							iQuery = {
								q: args.arg,
								num: qNum,
								start: 1 + (qNum * (qPage - 1)),
								siteSearch: "namu.wiki/w/"
							};
							break;
						case "soundcloud":
							iQuery = {
								q: args.arg,
								num: qNum,
								start: 1 + (qNum * (qPage - 1)),
								siteSearch: "soundcloud.com"
							};
							break;
					}
					searchGoogle(iQuery, (error, response) => {
						if (error) {
							printLogError(message, 0, "searchGoogle failed?", error);
							answerToTheChannel(message, "구글 검색 실패...?", undefined, undefined);
						} else if (response.data != undefined) {
							if (response.data.searchInformation.totalResults === "0") {
								answerToTheChannel(message, "검색 결과가 없섯서염...", undefined, undefined);
							} else {
								switch (args.command) {
									case "google":
									case "namu":
										var searchResultEmbeds = response.data.items.map((anItem) => {
											// printLog("[DBG] " + JSON.stringify(anItem.pagemap.metatags));
											var res = {
												embed: {
													color: COLOR_GREEN,
													// color: anItem.pagemap.metatags[0]["theme-color"] != undefined ? getValueOfHex(anItem.pagemap.metatags[0]["theme-color"]) : undefined,
													title: stringifyHtmlSnippet(anItem.htmlTitle) + "\n_" + anItem.htmlFormattedUrl.replace(/<b>|<\/b>/g, "") + "_",
													// title: stringifyWithEntityDecoder(anItem.htmlTitle) + "\n_" + anItem.htmlFormattedUrl.replace(/<b>|<\/b>/g, "") + "_",
													url: anItem.link,
													description: stringifyHtmlSnippet(anItem.htmlSnippet.replace(/\n/g, " ")),
													// description: stringifyWithEntityDecoder(anItem.htmlSnippet.replace("\n", " ")),
													thumbnail: {
														url: anItem.pagemap.cse_thumbnail != undefined ? anItem.pagemap.cse_thumbnail[0].src : undefined
													},
													// image: {
													// 	url: anItem.pagemap.cse_image != undefined ? anItem.pagemap.cse_image[0].src : undefined
													// },
													footer: {
														// icon_url: anItem.pagemap.metatags[0]["og:image"],
														// icon_url: "https://" + anItem.displayLink + "/favicon.ico",
														text: anItem.displayLink
													}
												}
											};
											return res;
										});
										answerToTheChannel(message,
											((response.data.spelling != undefined) ? "혹시 " + stringifyHtmlSnippet(response.data.spelling.htmlCorrectedQuery) + "를 검색하려 하셨나염?\n" : "") +
											"`" + response.data.queries.request[0].searchTerms + " 검색 결과 약 " +
											response.data.searchInformation.formattedTotalResults + "건 중 " +
											(response.data.queries.request[0].count === 1 ?
												response.data.queries.request[0].startIndex :
												response.data.queries.request[0].startIndex + " ~ " + (response.data.queries.request[0].startIndex + response.data.queries.request[0].count - 1) + "") +
											"번째 결과, " + response.data.searchInformation.searchTime + "초 소요`", searchResultEmbeds[0], false, (sentMessage) => {
												if (searchResultEmbeds.length > 1) {
													var i = 1;

													function answerSearchResultEmbed(message, idx) {
														if (idx + 1 < searchResultEmbeds.length) {
															answerToTheChannel(message, "", searchResultEmbeds[idx], answerSearchResultEmbed(message, idx + 1));
														} else if (idx < searchResultEmbeds.length) {
															answerToTheChannel(message, "", searchResultEmbeds[idx], undefined);
														}
													}
													answerSearchResultEmbed(message, i);
												}
											},
											undefined, undefined);
										break;
									case "youtube":
									case "soundcloud":
										var tmpArray = [];
										response.data.items.map((anItem) => { tmpArray.push(anItem.link) });
										answerToTheChannel(message, tmpArray.join("\n"), undefined, undefined);
										break;
								}
							}
						} else {
							printLogError(message, 0, "searchGoogle error : No error, No response", "What the...??");
							answerToTheChannel(message, "엥...? 검색 오류도 없는데 구글 응답이 없어요...", undefined, undefined);
						}
					});
				}
			}
			break;
		case "image":
			if (args.arg.length === 0) {
				answerToTheChannel(message, "검색어가 입력되지 않았서염...", getDetailedHelpEmbed(args), undefined);
			} else {
				var detailedFlag = false;
				var indexOpt = 1;
				// var qNum = 1;
				args.options.map((anOpt) => {
					if (anOpt != undefined) {
						switch (anOpt.name) {
							default: // undefined
								break;
							case "index":
								if (Number.isInteger(Number(anOpt.value))) {
									indexOpt = Number(anOpt.value);
								} else {
									indexOpt = -1;
								}
								break;
							case "detail":
								detailedFlag = true;
								break;
						}
					}
				});
				if (indexOpt < 1) {
					answerToTheChannel(message, "옵션을 잘못 입력하신것 같은대...", undefined, undefined);
				} else {
					searchGoogle({
						q: args.arg,
						num: 1,
						start: indexOpt,
						searchType: "image"
					}, (searchErr, searchRes) => {
						if (searchErr) {
							printLogError(message, 0, "searchGoogle(image) error", searchErr);
							answerToTheChannel(message, "이미지 검색 에러... 라는대여...??", undefined, undefined);
						} else if (searchRes.data != undefined) {
							if (searchRes.data.searchInformation.totalResults === "0") {
								answerToTheChannel(message, "검색 결과가 없섯서염...", undefined, undefined);
							} else {
								if (!detailedFlag) {
									tryRequest({
										uri: searchRes.data.items[0].link,
										method: "GET",
										encoding: null,
										timeout: 3000
									}, 3,
										(imgReqErr, imgReqRes, imgReqBody) => {
											if (imgReqErr) {
												printLogError(message, 0, "tryRequest(image) error", JSON.stringify(imgReqErr));
												answerToTheChannel(message, "이미지 다운로드 실패...??", undefined, undefined);
											} else {
												if (imgReqRes.statusCode != 200) {
													if (searchRes.data.items[0].link.startsWith("https://w.namu")) {
														answerToTheChannel(message, "_나무위키 이미지 표시 제한, 구글 썸네일로 대체_", {
															embed: {
																color: COLOR_WARN,
																image: {
																	url: searchRes.data.items[0].image.thumbnailLink
																}
															}
														}, undefined);
													} else {
														printLogError(message, 1, "imgReqRes.statusCode != 200", searchRes.data.items[0].link);
														answerToTheChannel(message, "_403 이미지 표시 제한, 구글 썸네일로 대체_", {
															embed: {
																color: COLOR_WARN,
																image: {
																	url: searchRes.data.items[0].image.thumbnailLink
																}
															}
														}, undefined);
													}
												} else {
													/*
													var imageFileName = searchRes.data.items[0].link.match(/([^\/]+)(?=\.\w+$)/gm);
													switch (searchRes.data.items[0].mime) {
														default:
														case "image/jpeg":
															imageFileName += ".jpg";
															break;
														case "image/gif":
															imageFileName += ".gif";
															break;
														case "image/png":
															imageFileName += ".png";
															break;
													}
													answerToTheChannel(message, undefined, {
														file: {
															name: imageFileName,
															attachment: imgReqBody
														}
													}, true, undefined);
													*/
													/*
													answerToTheChannel(message, undefined, {
															embed: {
																color: COLOR_GREEN,
																image: {
																	url: searchRes.data.items[0].link
																}
															}
														}, true, undefined);
													*/
													answerToTheChannel(message, searchRes.data.items[0].link, undefined, undefined);
												}
											}
										});
								} else { // if(detailedFlag)
									answerToTheChannel(message, ((searchRes.data.spelling != undefined) ? "혹시 " + stringifyHtmlSnippet(searchRes.data.spelling.htmlCorrectedQuery) + "를 검색하려 하셨나염?\n" : "") +
										"`" + searchRes.data.queries.request[0].searchTerms + " 이미지 검색 결과 약 " +
										searchRes.data.searchInformation.formattedTotalResults + "건 중 " +
										(searchRes.data.queries.request[0].count === 1 ?
											searchRes.data.queries.request[0].startIndex :
											searchRes.data.queries.request[0].startIndex + " ~ " + (searchRes.data.queries.request[0].startIndex + searchRes.data.queries.request[0].count - 1) + "") +
										"번째 결과, " + searchRes.data.searchInformation.searchTime + "초 소요`", {
										embed: {
											color: COLOR_GREEN,
											title: stringifyHtmlSnippet(searchRes.data.items[0].htmlTitle),
											description: searchRes.data.items[0].link,
											image: {
												url: searchRes.data.items[0].link
											},
											thumbnail: {
												url: searchRes.data.items[0].image.thumbnailLink
											},
											footer: {
												text: searchRes.data.items[0].image.contextLink
											}
										}
									}, undefined);
								}
							}
						} else {
							printLogError(message, 0, "searchGoogle(image) No error, no response", "Not an error, but undefined searchRes.data returned");
							answerToTheChannel(message, "엥?? 검색 에러도 없고 결과도 없는대요???? :thinking:", undefined, undefined);
						}
					});
				}
			}
			break;
		case "swpower":
			if (args.arg === undefined) {
				answerToTheChannel(message, "위력값을 입력하셔야...", undefined, undefined);
			} else {
				// var operands = ["+", "-", "/", "*", "%", "(", ")"];
				var operandsRegExp = ["\\\+", "\\\-", "\\\/", "\\\*", "\\\%", "\\\(", "\\\)"];
				var tmpForm = args.arg;
				operandsRegExp.map((anOper) => {
					tmpForm = tmpForm.replace(new RegExp(anOper, "g"), " " + anOper[1] + " ");
				});
				var argArray = tmpForm.split(" ");
				argArray = argArray.map((aTerm) => { return aTerm.trim(); });
				argArray = argArray.filter((aTerm) => {
					return (aTerm != null) && (aTerm.length > 0) && (aTerm != undefined);
				});
				var inputPower = undefined;
				var powerPointer = -1;
				for (var i = 0; i < argArray.length; i++) {
					if (argArray[i].startsWith("[") && argArray[i].endsWith("]")) {
						if (powerPointer >= 0) {
							powerPointer = -2;
						} else {
							inputPower = argArray[i].replace("[", "").replace("]", "").trim();
							// argArray[i] = "power";
							powerPointer = i;
						}
					}
				}
				if (powerPointer === -2) {
					answerToTheChannel(message, "위력은 한 번만 입력해주새여;;", undefined, undefined);
				} else {
					if (powerPointer === -1) {
						// printLog("[DBG] powerPointer = -1, argArray[0] = " + argArray[0], undefined, undefined);
						inputPower = argArray[0];
						// argArray[0] = "power";
						powerPointer = 0;
					}
					// printLog("[DBG] inputPower = " + inputPower, undefined, undefined);
					if (!Number.isInteger(Number(inputPower))) {
						answerToTheChannel(message, "**" + inputPower + "** 은 숫자가 아닌것 같은데여...?", undefined, undefined);
					} else if ((inputPower < 0) || (inputPower > 100)) {
						answerToTheChannel(message, "**" + inputPower + "** 은 0보다 작거나 100보다 큽니다, 그런 위력은 업소요...", undefined, undefined);
					} else if (args.options.length > 0 && args.options.find((anOpt) => { return anOpt.name === "lookup"; })) {
						var tmpStr = "```ini\n";
						for (var i = 0; i < SwPowerTable[inputPower].value.length; i++) {
							tmpStr += "" + (i + 3) + " → [" + SwPowerTable[inputPower].value[i] + "]\n";
						}
						answerToTheChannel(message, ":scroll: 위력값 **" + inputPower + "**의 위력표" + tmpStr + "```", undefined, undefined);
					} else {
						var comments = [];
						if (args.options.length > 0) {
							args.options.map((anOpt) => {
								if (anOpt.name === "comment") {
									comments.push(anOpt.value);
								}
							});
						}
						var powerDices = rollDices(2, 6);
						var powerFromTable = SwPowerTable[inputPower].value[(powerDices[0] + powerDices[1] - 3)];
						// printLog("[DBG] powerDices[0],[1] = " + powerDices[0] + ", " + powerDices[1]);
						// printLog("[DBG] powerFromTable = " + powerFromTable);
						var prePowerArray = argArray.slice(0, powerPointer);
						var prePowerStr = prePowerArray.map((aTerm) => { return avoidMarkdown(aTerm) }).join(" ");
						var postPowerArray = argArray.slice(powerPointer + 1, argArray.length);
						var postPowerStr = postPowerArray.map((aTerm) => { return avoidMarkdown(aTerm) }).join(" ");
						try {
							// var result = ExprParser.evaluate((powerFromTable).toString());
							// printLog("[DBG] result = " + result);
							if ((powerDices[0] === 1) && (powerDices[1] === 1)) {
								var tmpTitle = ":muscle: **" + authorCallname + "**, 위력 **" + inputPower + "**의 2D6 = ( **" + powerDices[0] + "** + **" + powerDices[1] + "** ) = :boom:**펌블**:boom: (자동실패)";
								if (comments != undefined && comments.length > 0) {
									tmpTitle += "\n*#" + comments.join(" #") + "*";
								}
								answerToTheChannel(message, undefined, {
									embed: {
										color: COLOR_ERROR,
										title: tmpTitle
									}
								}, undefined);
							} else {
								var result = ExprParser.evaluate(prePowerArray.join(" ") + powerFromTable + postPowerArray.join(" "));
								var tmpTitle = ":muscle: **" + authorCallname + "**, 위력 **" + inputPower + "**의 2D6 = ( **" + powerDices[0] + "** + **" + powerDices[1] + "** ) = **" + (powerDices[0] + powerDices[1]) + "** → [ **" + powerFromTable + "** ]" +
									"\n → " + prePowerStr + " [ **" + powerFromTable + "** ] " + postPowerStr + " = **" + result + "**";
								// "**\n결과 = [ **" + powerFromTable + "** ]" + argArray.join(" ") + " = **" + result + "**";
								if (comments != undefined && comments.length > 0) {
									tmpTitle += "\n*#" + comments.join(" #") + "*";
								}
								answerToTheChannel(message, undefined, {
									embed: {
										color: COLOR_GREEN,
										title: tmpTitle
									}
								}, undefined);
							}
						} catch (error) {
							printLogError(message, 0, "Eval error...?", error.toString());
							answerToTheChannel(message, "수식이 잘못된것 같은데여...?", undefined, undefined);
						}
					}
				}
			}
			break;
		case "saucenao":
			if (args.options != undefined && args.options.find((anOpt) => { return anOpt.name === "last" })) {
				var foundImageUrl = undefined;
				message.channel.fetchMessages({ limit: 20 }).then((fetchedMessages) => {
					fetchedMessages.map((aFetchedMessage) => {
						if (foundImageUrl === undefined) {
							aFetchedMessage.attachments.map((anAttatchment) => {
								if ((anAttatchment != undefined) && (anAttatchment.height > 0) && (foundImageUrl === undefined)) {
									foundImageUrl = anAttatchment.url;
								}
							});
						}
						// printLog(`[DBG] foundImageUrl = ${foundImageUrl}`, undefined, undefined);
					});
					if (foundImageUrl === undefined) {
						answerToTheChannel(message, "최근 메세지 20개중에서 이미지를 찾을 수 없었습니당...", undefined, undefined);
					} else {
						answerToTheChannel(message, "http://saucenao.com/search.php?db=999&url=" + foundImageUrl, undefined, undefined);
					}
				}).catch((error) => {
					answerToTheChannel(message, "어라...? 메세지 기록을 읽어오지 못했나봐여...", undefined, undefined);
					printLogError(message, 0, "fetchMessages() failed : " + error, undefined);
				});
			} else if (args.arg === undefined || args.arg === null || args.arg.length < 1) {
				answerToTheChannel(message, "검색할 url을 입력해주세여... 디스코드 이미지라면 우클릭->링크복사해서 붙여넣으시면 편해염", undefined, undefined);
			} else {
				answerToTheChannel(message, "http://saucenao.com/search.php?db=999&url=" + args.arg, undefined, undefined);
			}
			break;
		case "anime":
			// args.options.map
			// var tmpAnimeFooter = -1;
			var tmpAnimeAuther = {
				name: "Cryental's Anime DataBase",
				url: CRYENTAL_HOME,
				icon_url: CRYENAL_FAVICON
			};

			// printLog(JSON.stringify(args, null, "\t"), undefined, ">>> " + JSON.stringify(args, null, "\t"));

			if (args.options.length === 0) {
				args.options.push({ name: "search" });
				tmpAnimeFooter++;
			}

			//answerToTheChannel(message, JSON.stringify(args), undefined, false, undefined);
			switch (args.options[0].name) {
				default:
				case "search":
					// var tmpAnimeKeyword = "";
					tmpAnimeAuther.url = CRYENTAL_SERVICE;
					var tmpAnimeSearchQuery = {
						uri: CRYENTAL_LIST,
						headers: {
							"Content-Type": "application/json; Charset=utf-8"
						},
						method: "GET",
						encoding: "utf8",
						timeout: 3000
					};
					if ((args.arg != undefined) && (args.arg != null)) {
						tmpAnimeSearchQuery.uri = `${CRYENTAL_LIST}?keyword=${encodeURIComponent(args.arg)}`.toString();
						tmpAnimeFooter++;
					}
					// printLog("tmpAnimeSearchQuery.uri = " + tmpAnimeSearchQuery.uri, undefined, undefined);

					tryRequest(tmpAnimeSearchQuery, 3, (animeSearchErr, animeSearchRes, animeSearchBody) => {
						if (animeSearchErr) {
							printLogError(message, 0, `anime animeSearchErr`, JSON.stringify(animeSearchErr));
							answerToTheChannel(message, `검색에 실패했서요... 모지...??`, undefined, undefined);
						} else {
							if (animeSearchRes.statusCode != 200) {
								printLogError(message, 0, `anime search bad response code`, undefined);
								answerToTheChannel(message, `Cryental API 응답이 이상해요...`, undefined, undefined);
							} else {
								if (JSON.parse(animeSearchBody).length < 1) {
									answerToTheChannel(message, `애니 *${args.arg}* Cryental 검색 결과`, {
										embed: {
											color: COLOR_WARN,
											author: tmpAnimeAuther,
											description: `검색 결과가 없슴니다... (영어로 짧게 검색해주세요)`
										}
									}, undefined);
								} else {
									var tmpCryentalBody = JSON.parse(animeSearchBody);

									var tmpDebug = "";
									// printLog(`[LOG] Logging Anime search result`, undefined, logText);
									// printLog(JSON.stringify(tmpCryentalBody[1], null, "\t"), undefined, "```JSON\n" + JSON.stringify(tmpCryentalBody[1], null, "\t") + "\n```");


									var tmpEmbedTotalSize = 0;

									var tmpEmbed = {
										embed: {
											title: `*args.arg* 애니 검색 결과`,
											color: COLOR_GREEN,
											author: tmpAnimeAuther,
											description: "",
											footer: {
												text: ""
											},
											image: {
												url: ""
											},
											thumbnail: {
												url: ""
											},
											fields: []
										}
									};

									tmpEmbed.embed.author.url = `${CRYENTAL_SERVICE}?search=${encodeURIComponent(args.arg)}`.toString();
									// tmpEmbedTotalSize += tmpEmbed.embed.author.url.length;
									tmpDebug += "author.url = " + tmpEmbed.embed.author.url;

									var tmpDiffs = -1;
									var tmpTitle = "";

									tmpCryentalBody.map((anAnime) => {
										if (anAnime.anime === null) {
											tmpDiffs += 2;
										} else {
											if (tmpTitle != anAnime.anime.title.canonical) {
												tmpTitle = anAnime.anime.title.canonical;
												tmpDiffs++;
											}
										}
									});

									// var tmpFooterTemplate = footer `애니 시리즈 검색 ${0}, ${1}화 검색 됨`;
									if (tmpDiffs < 1) { // Found the unique anime
										var tmpFoundSeries = tmpCryentalBody[0].anime;
										// tmpEmbed.embed.title = `${tmpFoundSeries.title.japanese} (${tmpFoundSeries.title.synonyms})`;
										tmpEmbed.embed.title = tmpFoundSeries.title.japanese;
										if (tmpFoundSeries.title.synonyms != null) {
											tmpEmbed.embed.title += ` (${tmpFoundSeries.title.synonyms})`;
										}
										tmpEmbedTotalSize += tmpEmbed.embed.title.length;
										tmpDebug += "\ntitle = " + tmpEmbed.embed.title;

										tmpEmbed.embed.url = ANIDB_ANIME_URI + tmpFoundSeries.mappings.find((aMap) => {
											return aMap.service.toLowerCase().startsWith("anidb");
										}).serviceId;
										tmpEmbedTotalSize += tmpEmbed.embed.url.length;
										tmpDebug += "\nurl = " + tmpEmbed.embed.url;

										tmpEmbed.embed.image.url = tmpFoundSeries.image;
										tmpEmbedTotalSize += tmpEmbed.embed.image.url.length;
										tmpDebug += "\nimage.url = " + tmpEmbed.embed.image.url;

										tmpEmbed.embed.thumbnail.url = tmpFoundSeries.image;
										tmpEmbedTotalSize += tmpEmbed.embed.thumbnail.url.length;
										tmpDebug += "\nthumbnail.url = " + tmpEmbed.embed.thumbnail.url;

										tmpEmbed.embed.description = "평점 : " + Math.round(tmpFoundSeries.rating * 100) / 100 +
											"\n원작 : " + tmpFoundSeries.originalFrom +
											"\n타입 : " + tmpFoundSeries.type.toUpperCase() + ", " + tmpFoundSeries.duration + ", " + tmpFoundSeries.totalEpisodes + "화" +
											"\n방영 : " + tmpFoundSeries.status + ", " + tmpFoundSeries.startDate + " ~ " + tmpFoundSeries.endDate;
										tmpEmbedTotalSize += tmpEmbed.embed.description.length;
										tmpDebug += "\ndescription = " + tmpEmbed.embed.description;

										tmpEmbed.embed.footer.text = `애니 시리즈 검색 성공, ${tmpCryentalBody.length}건 검색 됨`;
										tmpEmbedTotalSize += tmpEmbed.embed.footer.text.length;
										tmpDebug += "\nfooter.text = " + tmpEmbed.embed.footer.text;
									} else { //Found some serieses
										tmpEmbed.embed.footer.text = `애니 시리즈 검색 실패, ${tmpCryentalBody.length}건 검색 됨`;
										tmpEmbedTotalSize += tmpEmbed.embed.footer.text.length;
										tmpDebug += "\nfooter.text = " + tmpEmbed.embed.footer.text;
									}

									Object.values(tmpEmbed.embed.author).map((aEle) => {
										tmpEmbedTotalSize += aEle.length;
									});

									// tmpEmbedTotalSize += tmpEmbed.embed.title.length + tmpEmbed.embed.url.length + tmpEmbed.embed.thumbnail.url.length +
									// 	tmpEmbed.embed.description.length + tmpEmbed.embed.footer.text.length;

									// if(tmpEmbedTotalSize > 6000)
									// printLog("tmpEmbedTotalSize = " + tmpEmbedTotalSize, undefined, undefined);

									var tmpAFieldLength = 0;
									var tmpAField = {};
									// var tmpFields = [];


									tmpCryentalBody.map((anAnime) => {
										// printLog(tmpEmbed.embed.fields.length, undefined, undefined);

										if (tmpEmbed.embed.fields.length < MSG_FIELDS_LIMIT) {
											tmpAField = {
												name: anAnime.title,
												value: `${anAnime.info.createdDate} [Magnet link](${anAnime.download.magnet})`
											};
											if (anAnime.episode != null) {
												tmpAField.name += " - " + anAnime.episode;
											}

											tmpAFieldLength = tmpAField.name.length + tmpAField.value.length;
											if ((tmpEmbedTotalSize + tmpAFieldLength) <= MSG_EMBED_TOTAL_LIMIT) {
												tmpEmbed.embed.fields.push(tmpAField);
												// tmpFields.push(tmpAField);
												tmpEmbedTotalSize += tmpAFieldLength;
												// printLog(tmpFields.length, undefined, undefined);
											}
										}
									});
									// tmpEmbed.embed.fields = tmpFields;
									// printLog(tmpDebug, undefined, ">>> " + tmpDebug);
									answerToTheChannel(message, undefined, tmpEmbed, undefined);

								}
							}
						}
					});

					break;
				case "list":
				// queryToDb(`SELECT * FROM `, (qSelErr, qSelRes) => {

				// });
				// break;
				case "add":
				/*if (args.arg === undefined || args.arg === null || args.arg.length === 0) {
					answerToTheChannel(message, "검색어가 입력되지 않았서염...", undefined,
						(sentMessage) => {
							message.channel.stopTyping();
						});
				} else {

				}
				break;*/
				case "remove":
					/*if (args.arg === undefined || args.arg === null || args.arg.length === 0) {
						answerToTheChannel(message, "검색어가 입력되지 않았서염...", undefined,
							(sentMessage) => {
								message.channel.stopTyping();
							});
					} else {

					}*/
					answerToTheChannel(message, "아직 헤봇이 복구되지 않앗서염... 만든놈을 탓하세여 " + `<@!${DEVELOPER_ID}>`, undefined, undefined);
					break;
				case "schedule":
					var tmpAnimeScheduleQuery = {
						uri: CRYENTAL_TIMETABLE,
						headers: {
							"Content-Type": "application/json; Charset=utf-8"
						},
						method: "GET",
						encoding: "utf8",
						timeout: 3000
					};

					tryRequest(tmpAnimeScheduleQuery, 3, (animeScheduleError, animeScheduleRes, animeScheduleBody) => {
						if (animeScheduleError) {
							printLogError(message, 0, `anime animeScheduleError`, JSON.stringify(animeScheduleError));
							answerToTheChannel(message, `애니 스케쥴을 받아오는데 실패했서요... 모지...??`, undefined, undefined);
						} else {
							if (animeScheduleRes.statusCode != 200) {
								printLogError(message, 0, `anime search bad response code`, undefined);
								answerToTheChannel(message, `Cryental API 응답이 이상해요...`, undefined, undefined);
							} else {
								if (JSON.parse(animeScheduleBody).length < 1) {
									answerToTheChannel(message, `애니 *${args.arg}* Cryental 검색 결과`, {
										embed: {
											color: COLOR_WARN,
											author: tmpAnimeAuther,
											description: `스케쥴 내용이 없는데요...? Cryental DB가 이상한것 같은데...`
										}
									}, undefined);
								} else {
									var tmpCryentalBody = JSON.parse(animeScheduleBody);
									if (!tmpCryentalBody.result) {
										answerToTheChannel(message, `현재 시간표가 없습니다, 저도 처음보는 현상이에요! <@${DEVELOPER_ID}> 야! 이것좀 봐!`, undefined, undefined);
										printLog(`animeSchedule result = false`, undefined, undefined);
									} else {
										// var tmpEmbedTitle = "";
										var tmpEmbed = {
											embed: {
												color: COLOR_GREEN,
												author: tmpAnimeAuther,
												title: tmpCryentalBody.season,
												url: tmpCryentalBody.based_on.source,
												footer: {
													text: `현재 시각 : ${getKoTimeString()}`
												},
												fields:[]
											}
										};

										// tmpCryentalBody.database
										function setNPushADayField(sDayData, sString) {
											var tmpString = "";
											var tmpAField = {
												name: sString,
												value: ""
											};
											sDayData.map((anAni) => {
												if (args.arg === undefined) {
													tmpString += "\n" + `${anAni.time} : ${anAni.title}`;
												} else if (args.arg.toLowerCase().startsWith("j")) {
													tmpString += "\n" + `${anAni.time} : ${anAni.ja_title}`;
												} else if (args.arg.toLowerCase().startsWith("k")) {
													tmpString += "\n" + `${anAni.time} : ${anAni.kor_title}`;
												} else if (args.arg.toLowerCase().startsWith("e")) {
													tmpString += "\n" + `${anAni.time} : ${anAni.eng_title}`;
												} else {
													tmpString += "\n" + `${anAni.time} : ${anAni.title}`;
												}
											});
											tmpAField.value = tmpString.trim();
											tmpEmbed.embed.fields.push(tmpAField);
										}

										
										setNPushADayField(tmpCryentalBody.database.Monday, "월요일");
										setNPushADayField(tmpCryentalBody.database.Tuesday, "화요일");
										setNPushADayField(tmpCryentalBody.database.Wednesday, "수요일");
										setNPushADayField(tmpCryentalBody.database.Thursday, "목요일");
										setNPushADayField(tmpCryentalBody.database.Friday, "금요일");
										setNPushADayField(tmpCryentalBody.database.Saturday, "토요일");
										setNPushADayField(tmpCryentalBody.database.Sunday, "일요일");

										answerToTheChannel(message, undefined, tmpEmbed, undefined);
									}


								}
							}
						}
					});


					break;
			}

			break;
		case "meme":
			answerToTheChannel(message, "아직 헤봇이 복구되지 않앗서염... 만든놈을 탓하세여 " + `<@!${DEVELOPER_ID}>`, undefined, undefined);
			break;
		case "db":
			if (args.options.length === 0) {
				answerToTheChannel(message, "DB 뭐! 옵션을 말해!", undefined, undefined);
			} else {
				switch (args.options[0].name) {
					case "show":
						break;
					case "delete":
						break;
				}
			}
			break;
	}
}


/* ~~~~ Event handling ~~~~ */
Bot.on("message", (message) => {
	checkBotCall(message);
});

Bot.on("ready", () => {
	BOT_SELF_ID = Bot.user.id;
	// var resTimeStr = getKoTimeString();
	printLog("Logged In", {
		embed: {
			title: "Bot logged in",
			color: COLOR_GREEN
		}
	});
	Bot.user.setActivity(BOT_PREFIX + "help", { type: "LISTENING" })
		.catch(console.error);

	initializePostgres((error, pool) => {
		if (error) {
			printLogError(undefined, 0, `Postgres connect() fail`, JSON.stringify(error, null, 2));
		} else {
			testDb((dbErr, dbRes) => {
				if (dbErr) {
					printLogError(undefined, 0, "DB table test error", JSON.stringify(dbErr, null, 2));
				} else {
					// printLog("testDB success\n" + JSON.stringify(dbRes, null, 2), undefined, undefined);
					// printLog("testDB success", undefined, undefined); // TODO : Log differently between tables // Really?? Do we need that??
					printLog("init testDB success", undefined, "init testDB success");
					// printLog("```JSON\n" + JSON.stringify(dbRes, null, "\t") + "\n```", undefined, "```JSON\n" + JSON.stringify(dbRes, null, "\t") + "\n```");
				}
			});
		}
	});
	// setSwPowerTable();
	// doMathWithDice("(23+25)-2d6+21*25/29%(35+13-23*35)");
	// doMathWithDice("10d6+10-2fffferx");
});

function logAndThenExit(exitSignal) {
	// var resTimeStr = getKoTimeString();
	printLog("Got exit signal \"" + exitSignal + "\"", {
		embed: {
			title: "Bot destroyed",
			color: COLOR_INFO,
			fields: [{
				name: "Exit signal",
				value: exitSignal,
				inline: false
			}]
		}
	});
	// Bot.channels.map((aChannel) => {
	// 	aChannel.stopTyping(true);
	// 	// printLog(JSON.stringify(aChannel));
	// });
	Bot.destroy();
}

process.on("SIGINT", () => {
	logAndThenExit("SIGINT");
});

process.on("SIGTERM", () => {
	logAndThenExit("SIGTERM");
});

Bot.login(BOT_TOKEN);