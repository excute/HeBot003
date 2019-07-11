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
const Strings = require("./strings.json");
const Discord = require("discord.js");
// const { Client } = require("pg");
const Request = require("request");
const { google } = require("googleapis");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_JP_API_KEY = process.env.GOOGLE_JP_API_KEY;
const CSE_ID = process.env.CSE_ID;
const CSE_JP_ID = process.env.CSE_JP_ID;
const CustomSearch = google.customsearch("v1");
const CustomSearchJp = google.customsearch("v1");

const SwPowerTable = require("./sw_power_table.json");

// const Aws = require("aws-sdk");
// const Postgres
// const pgClient = new Client({
// 	connectionString: process.env.DATABASE_URL,
// 	ssl: true,
// });

const HtmlEntitiesC = require("html-entities").Html5Entities;
const HtmlEntities = new HtmlEntitiesC();
const Os = require("os");
const Process = require("process");

/* ~~~~ Constants ~~~~ */
const Bot = new Discord.Client();
const BOT_TOKEN = process.env.BOT_TOKEN;
// const BOT_SELF_ID = "354220127799214092";
var BOT_SELF_ID = "";
const BOT_PREFIX = "//";
const BOT_LOG_CHANNEL = "531633010433458178";
const COLOR_GREEN = 0x4CAF50;
const COLOR_INFO = 0x2196F3;
const COLOR_WARN = 0xFFC107;
const COLOR_ERROR = 0xF44336;
const COLOR_DEBUG = 0x9C27B0;

const DEVELOPER_ID = "272958758999818241";
const DEVELOPER_DMID = "354221823120113665";

const CALL_PREFIX = "//";

var swPowerTable = [];

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

function milsecToDHMS(milSec) {
	var tmp = milSec / 1000; // Sec
	return "" + Math.floor(tmp / 86400) + "D" +
		addZeroToNumber(2, Math.floor((tmp % 86400) / 3600)) + ":" +
		addZeroToNumber(2, Math.floor((tmp % 3600) / 60)) + ":" +
		addZeroToNumber(2, tmp % 60);
}

function secToDHMS(sec) {
	return "" + Math.floor(sec / 86400) + "D " +
		addZeroToNumber(2, Math.floor((sec % 86400) / 3600)) + "h " +
		addZeroToNumber(2, Math.floor((sec % 3600) / 60)) + "m " +
		addZeroToNumber(2, Math.floor(sec % 60)) + "s";
}

function getValueOfHex(hexStr) {
	return parseInt(hexStr.replace("#", "0x"));
}

async function rollDices(numA, numB, callback) {
	var dices = [];
	for (var i = 0; i < numA; i++) {
		dices.push(Math.floor(Math.random() * numB + 1));
	}
	if (callback != undefined) {
		callback(dices);
	} else {
		return dices;
	}
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
				tryRequest(options, --mTries, callback);
			} else {
				callback(error, response, body);
			}
		});
	} else {
		callback(error, response, body);
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
					title: message.guild.me.nickname + " 사용법",
					color: COLOR_GREEN,
					description: "**" + message.guild.me.nickname + " 호출 방법**\n" +
						"```ini\n" + CALL_PREFIX + "[명령어] ([--옵션])```" +
						"```ini\n" + message.guild.me.nickname + " [명령어] ([--옵션])```" +
						"```ini\n@" + message.guild.me.nickname + "(멘션) [명령어] ([--옵션])```" +
						"(" + message.guild.me + "에게 직접 DM으로도 사용 가능, 바로 명령어부터 시작)\n\n" +
						"**헤봇 명령어 목록**\n" + helpCmdList +
						"모든 명령어 뒤에 `--help(--도움말)` 옵션을 붙여 자세한 사용법을 알 수 있습니다"
					// fields: [{
					// 	name: "헤봇 호출 방법",
					// 	inline: false,
					// 	value: "```ini\n" + CALL_PREFIX + "[명령어] ([--옵션])\n" +
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
						"```ini\n" + CALL_PREFIX + "[명령어] ([--옵션])```" +
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

/*
function prepareDB() {
	pgClient.connect();
	pgClient.query("SELECT table_schema, table_name FROM information_schema.tables;")
}
*/

async function setSwPowerTable() {
	var tmpEle = {
		power: 0,
		value: []
	};
	for (var i = 0; i < SwPowerTable.length; i++) {
		tmpEle = {
			power: 0,
			value: []
		};
		tmpEle.power = SwPowerTable[i].power;
		tmpEle.value.push(SwPowerTable[i].a); // 3
		tmpEle.value.push(SwPowerTable[i].b);
		tmpEle.value.push(SwPowerTable[i].c);
		tmpEle.value.push(SwPowerTable[i].d);
		tmpEle.value.push(SwPowerTable[i].e);
		tmpEle.value.push(SwPowerTable[i].f);
		tmpEle.value.push(SwPowerTable[i].g);
		tmpEle.value.push(SwPowerTable[i].h);
		tmpEle.value.push(SwPowerTable[i].i);
		tmpEle.value.push(SwPowerTable[i].j); // 12
		swPowerTable.push(tmpEle);
	}
	// printLog(JSON.stringify(swPowerTable), undefined, undefined);
}

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

async function printLog(consoleLog, embedLog, embedText) {
	if (consoleLog != undefined) {
		console.log("HeBot " + consoleLog + "\n");
	}
	if (embedLog != undefined) {
		embedLog.embed.footer = { text: getKoTimeString() };
		Bot.channels.get(BOT_LOG_CHANNEL).send((embedText === undefined ? "" : embedText), embedLog)
			.catch((error) => {
				console.log("HeBot [ERR] printLog() :\n" + error);
			});
	}
}

async function printLogError(message, consoleLog, eDesc) {
	var tmpEmbed = {
		embed: {
			color: COLOR_ERROR
		}
	};
	if (message != undefined) {
		tmpEmbed = getGeneralDebugLog(message);
	}
	tmpEmbed.embed.color = COLOR_ERROR;
	// tmpEmbed.title = eTitle;
	tmpEmbed.embed.title = consoleLog;
	tmpEmbed.embed.description = eDesc;
	printLog("[ERR] " + consoleLog, tmpEmbed, `<@${DEVELOPER_ID}>` + "!! 에러라구!!");
}

async function answerToTheChannel(inputMessage, outputText, outputOptions, callback) {
	inputMessage.channel.send(outputText, (outputOptions != undefined ? outputOptions : null))
		.then((sentMessage) => {
			if (callback != undefined) {
				callback(sentMessage);
			}
		})
		.catch((error) => {
			printLogError(undefined, "answerToTheChannel() failed", error);
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
				} else if (message.content.startsWith(message.guild.me.nickname)) {
					handleArgs(message, message.content.replace(message.guild.me.nickname, "").trim());
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
				"**" + avoidMarkdown(rawArgsArray[0]) + "**...? 제가 모르는 명령어인데여... 아래의 사용법을 참조해주세여",
				getHelpEmbed(message),
				undefined);
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
								},
								undefined);
						} else { answerToTheChannel(message, undefined, getDetailedHelpEmbed(foundCommand), undefined); }
						detailedHelpFlag = true;
					} else if (!detailedHelpFlag) {
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
			if (!detailedHelpFlag) {
				var tmpArg = "";
				for (var i = 0; i < rawArgsArray.length; i++) {
					if (rawArgsArray[i].length > 0) { tmpArg += rawArgsArray[i]; }
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

				responseToMessage(message, argsStruct);
			}
		}
	}
}

async function responseToMessage(message, args) {
	message.channel.startTyping();
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
			answerToTheChannel(message,
				"엥!? 여긴 어떻게 들어왔어?!?",
				getHelpEmbed(message),
				(sentMessage) => {
					message.channel.stopTyping();
				}
			);
			break;
		case "help":
			answerToTheChannel(message, "", getHelpEmbed(message),
				(sentMessage) => {
					message.channel.stopTyping();
				});
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
					},
					(sentMessage) => {
						message.channel.stopTyping();
					});
			} else {
				answerToTheChannel(message, "", {
						embed: {
							title: "봇 업타임",
							description: "" + secToDHMS(Process.uptime()),
							color: COLOR_GREEN
						}
					},
					(sentMessage) => {
						message.channel.stopTyping();
					});
			}
			break;
		case "chanid":
			answerToTheChannel(message, "```message.channel.id```", (sentMessage) => {
				message.channel.stopTyping();
			})
			break;
		case "dice":
			if (args.arg.length > 0) {
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
			}
			break;
		case "google":
			if (args.arg.length === 0) {
				answerToTheChannel(message, "검색어가 입력되지 않았서염...", getDetailedHelpEmbed(args),
					(sentMessage) => {
						message.channel.stopTyping();
					});
			} else {
				var qNum = 3;
				var qPage = 1;
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
					answerToTheChannel(message, "*" + qNum + "*개 검색결과의 *" + qPage + "* 페이지를 가져온다는건 이상한데여...");
				} else {
					searchGoogle({
						q: args.arg,
						num: qNum,
						start: 1 + (qNum * (qPage - 1)),
					}, (error, response) => {
						if (error) {
							printLogError(message, "searchGoogle failed?", error);
							answerToTheChannel(message, "구글 검색 실패...?", undefined, (sentMessage) => {
								message.channel.stopTyping();
							});
						} else if (response.data != undefined) {
							if (response.data.searchInformation.totalResults === "0") {
								answerToTheChannel(message, "검색 결과가 없섯서염...", undefined, message.channel.stopTyping());
							} else {
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
												url: anItem.pagemap.cse_thumbnail != undefined ? anItem.pagemap.cse_thumbnail[0].src : ""
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
									"번째 결과, " + response.data.searchInformation.searchTime + "초 소요`", searchResultEmbeds[0], (sentMessage) => {
										if (searchResultEmbeds.length > 1) {
											var i = 1;

											function answerSearchResultEmbed(message, idx) {
												if (idx + 1 < searchResultEmbeds.length) {
													answerToTheChannel(message, "", searchResultEmbeds[idx], answerSearchResultEmbed(message, idx + 1));
												} else if (idx < searchResultEmbeds.length) {
													answerToTheChannel(message, "", searchResultEmbeds[idx], message.channel.stopTyping());
												}
											}
											answerSearchResultEmbed(message, i);
										}
									}
								);
							}
						} else {
							printLogError(message, "searchGoogle error : No error, No response", "What the...??");
							answerToTheChannel(message, "엥...? 검색 오류도 없는데 구글 응답이 없어요...", undefined, (sentMessage) => { message.channel.stopTyping(); });
						}
					});
				}
			}
			break;
		case "image":
			if (args.arg.length === 0) {
				answerToTheChannel(message, "검색어가 입력되지 않았서염...", getDetailedHelpEmbed(args),
					(sentMessage) => {
						message.channel.stopTyping();
					});
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
					answerToTheChannel(message, "옵션을 잘못 입력하신것 같은대...", undefined, (sentMessage) => {
						message.channel.stopTyping();
					});
				} else {
					searchGoogle({
						q: args.arg,
						num: 1,
						start: indexOpt,
						searchType: "image"
					}, (searchErr, searchRes) => {
						if (searchErr) {
							printLogError(message, "searchGoogle(image) error", searchErr);
							answerToTheChannel(message, "이미지 검색 에러... 라는대여...??", undefined, (sentMessage) => {
								message.channel.stopTyping();
							});
						} else if (searchRes.data != undefined) {
							if (searchRes.data.searchInformation.totalResults === "0") {
								answerToTheChannel(message, "검색 결과가 없섯서염...", undefined, (sentMessage) => { message.channel.stopTyping() });
							} else {
								if (!detailedFlag) {
									tryRequest({
											uri: searchRes.data.items[0].link,
											method: "GET",
											encoding: null,
											timeout: 10000
										}, 3,
										(imgReqErr, imgReqRes, imgReqBody) => {
											if (imgReqErr) {
												printLogError(message, "tryRequest(image) error", imgReqErr);
												answerToTheChannel(message, "이미지 다운로드 실패...??", undefined, (sentMessage) => { message.channel.stopTyping(); });
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
														}, (sentMessage) => {
															message.channel.stopTyping();
														});
													} else {
														printLogError(message, "imgReqRes.statusCode != 200", searchRes.data.items[0].link);
														answerToTheChannel(message, "_403 이미지 표시 제한, 구글 썸네일로 대체_", {
															embed: {
																color: COLOR_WARN,
																image: {
																	url: searchRes.data.items[0].image.thumbnailLink
																}
															}
														}, (sentMessage) => {
															message.channel.stopTyping();
														});
													}
												} else {
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
													}, (sentMessage) => {
														message.channel.stopTyping();
													});
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
										}, (sentMessage) => { message.channel.stopTyping() });
								}
							}
						} else {
							printLogError(message, "searchGoogle(image) No error, no response", "Not an error, but undefined searchRes.data returned");
							answerToTheChannel(message, "엥?? 검색 에러도 없고 결과도 없는대요???? :thinking:", undefined, (sentMessage) => { message.channel.stopTyping(); });
						}
					});
				}
			}
			break;
		case "swpower":
			if (args.arg < 1 || args.arg === undefined) {
				answerToTheChannel(message, "위력값을 입력하셔야...", undefined, (sentMessage) => { message.channel.stopTyping(); });
			} else {
				var inputPower = Number(args.arg);
				if (!Number.isInteger(inputPower)) {
					answerToTheChannel(message, "**" + args.arg + "** 은 숫자가 아닌것 같은데여...?", undefined, (sentMessage) => { message.channel.stopTyping(); });
				} else {
					if ((inputPower < 0) || (inputPower > 100)) {
						answerToTheChannel(message, "**" + args.arg + "** 은 0보다 작거나 100보다 큽니다, 그런 위력은 업소요...", undefined, (sentMessage) => { message.channel.stopTyping(); });
					} else {
						if (args.options.length > 0) {
							if (args.options.find((anOpt) => { return anOpt.name === "lookup"; })) {
								var tmpStr = "```ini\n";
								for (var i = 0; i < swPowerTable[inputPower].value.length; i++) {
									tmpStr += "" + (i + 3) + " → [" + swPowerTable[inputPower].value[i] + "]\n";
								}
								answerToTheChannel(message, "위력값 **" + inputPower + "**의 위력표" + tmpStr + "```", undefined, (sentMessage) => { message.channel.stopTyping(); });
							}
						} else {
							rollDices(2, 6, (dices) => {
								// var diceSum = dices[0] + dices[1];
								if ((dices[0] === 1) && (dices[1] === 1)) {
									answerToTheChannel(message, undefined, {
										embed: {
											color: COLOR_ERROR,
											title: "**" + authorCallname + "**, 위력 **" + inputPower + "**의 데미지 롤!",
											description: "2D6 = [" + dices[0] + "] + [" + dices[1] + "] = :boom:펌블:boom: (자동실패)"
										}
									}, (sentMessage) => { message.channel.stopTyping(); });
								} else {
									answerToTheChannel(message, undefined, {
										embed: {
											color: COLOR_GREEN,
											title: "**" + authorCallname + "**, 위력 **" + inputPower + "**의 데미지 롤!",
											description: "2D6 = [" + dices[0] + "] + [" + dices[1] + "] = **" + (dices[0] + dices[1]) + "**\n→ 데미지 = " +
												swPowerTable[inputPower].value[dices[0] + dices[1] - 3]
										}
									}, (sentMessage) => { message.channel.stopTyping(); });
								}
							});
						}
					}
				}
			}
			break;
		case "youtube":
			// printLogError("Error Test", {
			// 	embed: {
			// 		title: "Error test",
			// 		description: ":waitWhat:"
			// 	}
			// }, message);
			// break;
		case "namu":
		case "anime":
		case "saucenao":
		case "meme":
			answerToTheChannel(message, "아직 헤봇이 복구되지 않앗서염... 만든놈을 탓하세여 " + `<@!${DEVELOPER_ID}>`, undefined, (sentMessage) => {
				message.channel.stopTyping();
			});
			break;
	}
}

/* ~~~~ Event handling ~~~~ */
Bot.on("message", (message) => {
	checkBotCall(message);
});

Bot.on("ready", () => {
	BOT_SELF_ID = Bot.user.id;
	var resTimeStr = getKoTimeString();
	printLog("Logged In", {
		embed: {
			title: "Bot logged in",
			color: COLOR_GREEN
		}
	});
	Bot.user.setActivity("//help", { type: "LISTENING" })
		.catch(console.error);

	setSwPowerTable();
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