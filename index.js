"use strict";

const Commands = require("./commands.json");
const Strings = require("./strings.json");
const Discord = require("discord.js");
// const { Client } = require("pg");
const { google } = require("googleapis");
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const GOOGLE_JP_API_KEY = process.env.GOOGLE_JP_API_KEY;
const CSE_ID = process.env.CSE_ID;
const CSE_JP_ID = process.env.CSE_JP_ID;
const CustomSearch = google.customsearch("v1");
const CustomSearchJp = google.customsearch("v1");

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

// var logDate = new Date();
// logDate.setUTCHours(logDate.getUTCHours() + 9);
// var timeString = logDate.toUTCString() + "+09:00";

function addZeroToNumber(length, num) {
	// return new Promise((resolve) => {
	var res = "" + num;
	if (num >= 0 && length > 0 && Math.pow(10, length - 1) > num) {
		for (var i = 1; i < length; i++) {
			if (Math.pow(10, i) > num) {
				res = "0" + res;
			}
		}
	}
	return res;
	// resolve(res);
	// });
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
	return "" + addZeroToNumber(2, koDate.getMonth() + 1) + "/" + addZeroToNumber(2, koDate.getDate()) + " " + koDay + ", " + addZeroToNumber(2, koDate.getHours()) + ":" + addZeroToNumber(2, koDate.getMinutes()) + ":" + addZeroToNumber(2, koDate.getSeconds());
	// return koDate.getMinutes();
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

async function printLog(consoleLog, embedLog) {
	// embedLog.embed.footer = {
	// 	text: getKoTimeString()
	// };
	if (consoleLog != undefined) {
		console.log("HeBot : " + consoleLog + "\n");
	}
	if (embedLog != undefined) {
		embedLog.embed.timestamp = new Date();
		try {
			if (embedLog.embed.color === COLOR_ERROR) {
				// Bot.channels.get(DEVELOPER_DMID).send()
				Bot.channels.get(BOT_LOG_CHANNEL).send(`<@!${DEVELOPER_ID}>` + ", 에러라구!!", embedLog);
			} else {
				Bot.channels.get(BOT_LOG_CHANNEL).send(embedLog);
			}
		} catch (err) {
			console.log("HeBot : ERROR : printLog() :\n" + err);
		}
	}
}

async function answerToTheChannel(inputMessage, outputText, outputOptions, callback) {
	inputMessage.channel.send(outputText, (outputOptions != undefined ? outputOptions : null))
		.then((sentMessage) => {
			if (callback != undefined) {
				callback(sentMessage);
			}
		})
		.catch((err) => {
			printLog("ERROR : answerToTheChannel() failed :\n" + err, {
				embed: {
					color: COLOR_ERROR,
					title: "ERROR : answerToTheChannel() failed",
					description: err
				}
			});
		});
}

// function setHelpEmbed(message) {
function getHelpEmbed(message) {
	// var helpCmdList = "```http";
	var helpCmdList = "";
	Commands.map((aCmd) => {
		// helpCmdList=Commands.map((aCmd)=>{
		if (aCmd.visible) {
			helpCmdList = helpCmdList.concat("```http\n" + aCmd.inputs[0] + " (" + aCmd.inputs[1] + ") : " + aCmd.short_usage + "```");
			// return "```http\n"+aCmd.inputs[0]+" ("+aCmd.inputs[1]+") : "+"\n```";
		}
	});
	// helpCmdList = helpCmdList.concat("```");
	// var selfText="";
	/*printLog("DEBUG 190613_01", {
		embed: {
			title: "DEBUG 190613_01",
			color: COLOR_DEBUG,
			fields: [{
				name: "message",
				value: message.content,
				inline: true
			}, {
				name: "type",
				value: message.channel.type,
				inline: true
			}]
		}
	});*/
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

function getDetailedHelpEmbed(thisInput) {
	var res = {
		embed: {
			title: thisInput.command + " 명령어 사용법",
			color: COLOR_INFO
		}
	};
	Commands.map((aCmd) => {
		if (aCmd.command === thisInput.command) {
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
function checkCall(message) {
	var isCalled = 0; // false=0, prefix=1, name=2, mention=3
	if (message.content.startsWith(BOT_PREFIX)) {
		isCalled = 1;
	} else if (message.content.startsWith(message.guild.me)) {
		isCalled = 2;
	} else if (message.isMentioned(BOT_SELF_ID)) {
		isCalled = 3;
	} else {
		isCalled = 0;
	}
	return isCalled;
}
*/
function getCommandArg(message) {
	var res;
	switch (message.channel.type) {
		default:
		case "text":
			if (message.content.startsWith(BOT_PREFIX)) {
				res = message.content.replace(BOT_PREFIX, "");
				// res = message.content.replace(/BOT_PREFIX/g, "");
			} else if (message.content.startsWith(message.guild.me)) {
				res = message.content.replace(message.guild.me, "");
			} else if (message.isMentioned(BOT_SELF_ID)) {
				res = message.content.replace(`<@!${BOT_SELF_ID}>`, "");
			}
			break;
		case "dm":
			return message.content;
			break;
		case "group":
			if (message.content.startsWith(BOT_PREFIX)) {
				res = message.content.replace(BOT_PREFIX, "");
			} else if (message.content.startsWith(Bot.user.username)) {
				res = message.content.replace(message.guild.me, "");
			} else if (message.isMentioned(BOT_SELF_ID)) {
				res = message.content.replace(`<@!${BOT_SELF_ID}>`, "");
			}
			break;
	}
	return res;
}

async function rollDices(numA, numB, callback) {
	var dices = [];
	for (var i = 0; i < numA; i++) {
		dices.push(Math.floor(Math.random() * numB + 1));
	}
	if (callback != undefined) {
		return callback(dices);
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
	// mRules.map((aRule) => {

	// });
	// for (var i = 0; i < rules.length; i++) {
	// 	// res = res.replace(rules[i].ori, rules[i].to);
	// 	res = res.replace(new RegExp(rules[i].ori, "g"), rules[i].to);
	// }
	return res;
}

// async function searchGoogle(sOpt, responseCallback, errorCallback) {
async function searchGoogle(sOpt, callback) {
	sOpt.auth = GOOGLE_API_KEY;
	sOpt.cx = CSE_ID;
	CustomSearch.cse.list(sOpt)
		.then((response) => {
				// responseCallback(response);
				callback(undefined, response);
			},
			(err) => {
				// errorCallback(err);
				if (err.toString().startsWith("Error: This API requires billing")) {
					printLog("Warning : Custom search exceeded :\n" + err, {
						embed: {
							color: COLOR_WARN,
							title: "ERROR : Custom search exceeded",
							description: err
						}
					});
					sOpt.auth = GOOGLE_JP_API_KEY;
					sOpt.cx = CSE_JP_ID;
					CustomSearchJp.cse.list(sOpt)
						.then((response) => {
								// responseCallback(response);
								callback(undefined, response);
							},
							(errJP) => {
								printLog("ERROR : Custom search (JP) :\n" + err, {
									embed: {
										color: COLOR_ERROR,
										title: "ERROR:Custom search (JP)",
										description: errJP
									}
								});
								// errorCallback(errJP);
								callback(errJP, undefined);
							});
				} else {
					printLog("ERROR : Custom search :\n" + err, {
						embed: {
							color: COLOR_ERROR,
							title: "ERROR:Custom search",
							description: err
						}
					});
					// errorCallback(err);
					callback(err, undefined);
				}
			})
		.catch((err) => {
			printLog(err);
			message.channel.stopTyping();
		})
}

async function responseBotCall(message, input, callback) {
	message.channel.startTyping();
	// var resTimeStr = getKoTimeString();
	// var dateNow = new Date();
	var thisInputRaw = input.replace(/　/g, " ").split(" ");
	var thisInput = {
		// command: "",
		options: [
			/* 
			{
				name:"option name",
				value:"option arg"
			}
			*/
		],
		arg: ""
	};

	var authorCallname = "";
	switch (message.channel.type) {
		default:
		case "text":
			authorCallname = message.guild.member(message.author).nickname;
			authorCallname = authorCallname == null ? message.author.username : authorCallname;
			break;
		case "dm":
		case "group":
			authorCallname = message.author.username;
			break;
	}

	Commands.map((aCmd) => {
		if (aCmd.inputs.find((anInput) => {
				return anInput === thisInputRaw[0];
			}) != undefined) { // Command found
			thisInput.command = aCmd.command;
			thisInputRaw.shift();
			/*
			thisInput.options = aCmd.options.map((aCmdOpt) => {
				var isOption = false;
				thisInputRaw = thisInputRaw.filter((aWord) => {
					// if (aWord.toLowerCase() === "--" + aCmdOpt) {
					if (aCmdOpt.inputs.find((aCmdOptInput) => {
							return "--" + aCmdOptInput === aWord.toLowerCase();
						}) != undefined) {
						isOption = true;
						return false;
					} else {
						return true;
					}
				});
				if (isOption) {
					return aCmdOpt.name;
				}
			});
			*/
			for (var i = 0; i < thisInputRaw.length; i++) {
				if (thisInputRaw[i].startsWith("--")) {
					var aFoundOption = aCmd.options.find((aCmdOpt) => {
						// if (aCmdOpt.inputs.find((aCmdOptInput) => {
						// 		return "--" + aCmdOptInput === thisInputRaw[i].toLowerCase();
						// 	})!=undefined){
						// 	return true;
						// }
						return aCmdOpt.inputs.find((aCmdOptInput) => {
							return "--" + aCmdOptInput === thisInputRaw[i].toLowerCase();
						}) != undefined;
					});
					if (aFoundOption != undefined) {
						if (aFoundOption.need_arg) {
							if (thisInputRaw[i + 1].length != 0) {
								thisInput.options.push({
									name: aFoundOption.name,
									value: thisInput[i + 1]
								});
								thisInputRaw[i + 1] = "";
							} else {
								// 아몰라;; 걍 커맨드마다 케이스 안에서 해결해;;
								thisInput.options.push({
									name: aFoundOption.name
								});
							}
						} else {
							thisInput.options.push({
								name: aFoundOption.name
							});
						}
					}
				}
			}
		}
	});

	// for (var i = 0; i < thisInputRaw.length; i++) {
	// 	thisInput.arg += thisInputRaw[i] + " ";
	// }
	// thisInput.arg = thisInput.arg.trim();
	// thisInput.arg = thisInputRaw.join().replace(",", " ").trim();
	thisInput.arg = thisInputRaw.join().replace(/,/g, " ").trim();
	/*
	printLog("Debug 190612_01", {
		embed: {
			title: "Debug 190612_01",
			fields: [{
				name: "command",
				value: thisInput.command,
				inline: false
			}, {
				name: "options",
				value: thisInput.options.toString(),
				inline: false
			}, {
				name: "arg",
				value: thisInput.arg,
				inline: false
			}]
		}
	});
	*/
	var detailedHelpFlag = 0;
	Commands.find((aCmd) => {
		return aCmd.command === "help";
	}).inputs.map((aCmdInput) => {
		if (thisInput.arg.includes(aCmdInput)) {
			detailedHelpFlag++;
		}
	});
	// if (thisInput.arg.includes("--help")) {
	if (detailedHelpFlag) {
		switch (thisInput.command) {
			default:
				answerToTheChannel(message,
					"*" + thisInput.arg + "*...? 제가 모르는 명령어인데여... 아래의 사용법을 참조해주세여",
					getHelpEmbed(message),
					(sentMessage) => {
						message.channel.stopTyping();
					}
				);
				// message.channel.send("*" + thisInput.arg + "*...? 제가 모르는 명령어인데여... 아래의 사용법을 참조해주세여");
				// message.channel.send(getHelpEmbed(message));
				break;

			case "help":
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
					(sentMessage) => {
						message.channel.stopTyping();
					});
				break;
			case "uptime":
			case "dice":
			case "google":
			case "image":
			case "youtube":
			case "namu":
			case "anime":
			case "saucenao":
			case "chanid":
			case "meme":
				answerToTheChannel(message, "", getDetailedHelpEmbed(thisInput),
					(sentMessage) => {
						message.channel.stopTyping();
					});
				// message.channel.send(getDetailedHelpEmbed(thisInput));
				break;
		}
	} else {
		switch (thisInput.command) { // Main function starts here
			default:
				answerToTheChannel(message,
					"*" + thisInput.arg + "*...? 제가 모르는 명령어인데여... 아래의 사용법을 참조해주세여",
					getHelpEmbed(message),
					(sentMessage) => {
						message.channel.stopTyping();
					}
				);
				// message.channel.send("*" + thisInput.arg + "*...? 제가 모르는 명령어인데여... 아래의 사용법을 참조해주세여");
				// message.channel.send(getHelpEmbed(message));
				break;

			case "help":
				answerToTheChannel(message, "", getHelpEmbed(message),
					(sentMessage) => {
						message.channel.stopTyping();
					});
				// message.channel.send(getHelpEmbed(message));
				break;

			case "uptime":
				// var processOpt = 0;
				// var systemOpt = 0;
				// thisInput.options.map((anInputOpt) => {
				// 	if (anInputOpt === "process") {
				// 		processOpt++;
				// 	} else if (anInputOpt === "system") {
				// 		systemOpt++;
				// 	}
				// });
				if (thisInput.options.find((anInputOpt) => {
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
					// message.channel.send({
					// 	embed: {
					// 		title: "봇 서버 업타임",
					// 		description: "" + secToDHMS(Os.uptime()),
					// 		color: COLOR_INFO
					// 	}
					// });
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
					// message.channel.send({
					// 	embed: {
					// 		title: "봇 업타임",
					// 		description: "" + secToDHMS(Process.uptime()),
					// 		color: COLOR_INFO
					// 	}
					// });
				}
				break;

			case "chanid":
				message.channel.send("```message.channel.id```");
				break;

			case "dice":
				if (thisInput.arg.length > 0) {
					var diceInput = thisInput.arg.toLowerCase().split("d");
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
								// dices.map((aDice)=>{
								// 	diceSum+=aDice;
								// });
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
						/*
						if (Number(diceInput[1]) > 300) {
							var diceSum = 0;

							for (var i = 0; i < Number(diceInput[0]); i++) {
								// diceArr.push(Math.floor(Math.random() * Number(diceInput[1]) + 1));
								diceSum += Math.floor(Math.random() * Number(diceInput[1]) + 1);
							}
							message.channel.send({
								embed: {
									title: ":game_die: " + authorCallname + "의 " + diceInput[1] + "면체 주사위 " + diceInput[0] + "개 다이스 롤!",
									description: "... = " + diceSum,
									color: COLOR_INFO
								}
							});
						} else {
							var diceArr = [];
							var diceSum = 0;
							for (var i = 0; i < Number(diceInput[0]); i++) {
								diceArr.push(Math.floor(Math.random() * Number(diceInput[1]) + 1));
								diceSum += diceArr[i];
							}
							var diceTxt = "" + diceArr[0];
							for (var i = 1; i < diceArr.length; i++) {
								diceTxt += " + " + diceArr[i];
							}
							diceTxt += "\n = " + diceSum;
							message.channel.send({
								embed: {
									title: ":game_die: " + authorCallname + "의 " + diceInput[1] + "면체 주사위 " + diceInput[0] + "개 다이스 롤!",
									description: diceTxt,
									color: COLOR_INFO
								}
							});
						}
						*/
					} else {
						answerToTheChannel(message, "*" + thisInput.arg + "* 는 주사위 구문이 잘못된것 같은데여...", getDetailedHelpEmbed(thisInput),
							(sentMessage) => {
								message.channel.stopTyping();
							});
					}
				} else {
					// var diceEmoji = rollDices(1, 6)[0];
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
				if (thisInput.arg.length === 0) {
					// message.channel.send("No arg error");
					answerToTheChannel(message, "검색어가 입력되지 않았서염...", getDetailedHelpEmbed(thisInput),
						(sentMessage) => {
							message.channel.stopTyping();
						});
				} else {
					// printLog("Google -> \"" + thisInput.arg + "\"");
					// answerToTheChannel(message, "*" + thisInput.arg + " 검색중...*", , (sentMessage) => {

					// });
					var qNum = 3;
					var qPage = 1;
					thisInput.options.map((anOpt) => {
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
							q: thisInput.arg,
							num: qNum,
							start: 1 + (qNum * (qPage - 1)),
						}, (err, response) => {
							// printLog("Got google result");
							if (err != undefined) {
								printLog(err);
							}
							if (response.data != undefined) {
								if (response.data.searchInformation.totalResults === "0") {
									answerToTheChannel(message, "검색 결과가 없섯서염...", undefined, message.channel.stopTyping());
								} else {
									var searchResultEmbeds = response.data.items.map((anItem) => {
										// printLog(anItem.htmlTitle);
										var res = {
											embed: {
												color: COLOR_GREEN,
												title: stringifyHtmlSnippet(anItem.htmlTitle) + "\n_" + anItem.htmlFormattedUrl.replace(/<b>|<\/b>/g, "") + "_",
												// title: stringifyWithEntityDecoder(anItem.htmlTitle) + "\n_" + anItem.htmlFormattedUrl.replace(/<b>|<\/b>/g, "") + "_",
												url: anItem.link,
												description: stringifyHtmlSnippet(anItem.htmlSnippet.replace(/\n/g, " ")),
												// description: stringifyWithEntityDecoder(anItem.htmlSnippet.replace("\n", " ")),
												thumbnail: {
													url: anItem.pagemap.cse_thumbnail != undefined ? anItem.pagemap.cse_thumbnail[0].src : ""
												},
												footer: {
													text: anItem.displayLink
												}
											}
										};
										// printLog(res.embed.title);
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
							}
						});
					}
				}
				break;
			case "image":
				if (thisInput.arg.length === 0) {
					answerToTheChannel(message, "검색어가 입력되지 않았서염...", getDetailedHelpEmbed(thisInput),
						(sentMessage) => {
							message.channel.stopTyping();
						});
				} else {
					var detailedFlag = false;
					var indexOpt = 1;
					thisInput.options.map((anOpt) => {
						if (anOpt != undefined &&
							anOpt.name != undefined && ) {
							switch (anOpt.name) {
								case "index":
									if (Number.isInteger(Number(anOpt.value))) {
										indexOpt = Number(anOpt.value);
									}
									break;
								case "detail":
									detailedFlag = true;
									break;
							}
						}
					});
					if (indexOpt < 1) {

					}
				}
			case "youtube":
			case "namu":
			case "anime":
			case "saucenao":
			case "meme":

				// message.channel.send("Sorry, HeBot is now in maintenance. Contact " + `<@!${DEVELOPER_ID}>`);
				message.channel.send("아직 헤봇이 복구되지 않앗서염... 만든놈을 탓하세여 " + `<@!${DEVELOPER_ID}>`);
				break;
		}
	}
	// message.channel.send("Sorry, HeBot is now in maintenance. Contact " + `<@!${DEVELOPER_ID}>`);
	// message.channel.stopTyping();
	// if(callback!=undefined){
	// 	callback();
	// }
}

Bot.on("message", (message) => {
	// var callTime = getKoTimeString();
	// var arg;
	if (message.type === "DEFAULT") {
		if (!message.author.bot) {
			var callTime = getKoTimeString();
			var arg = getCommandArg(message);
			switch (message.channel.type) {
				default: // Guild(server) channels
				case "text":
					if (arg != undefined) {
						printLog("Bot called", {
							embed: {
								title: "Bot called",
								color: COLOR_INFO,
								fields: [{
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
								],
								footer: {
									text: callTime
								}
							}
						});
						responseBotCall(message, arg);
					}
					break;
				case "group":
					if (arg != undefined) {
						printLog("Bot called at groupDM", {
							embed: {
								title: "Bot call at GroupDM",
								color: COLOR_INFO,
								description: "Bot called",
								fields: [{
										name: "Group name",
										value: message.channel.name,
										inline: false
									},
									{
										name: "Author",
										value: `<@!${message.author.id}>`,
										inline: false
									},
									{
										name: "Message",
										value: message.content,
										inline: false
									}
								],
								footer: {
									text: callTime
								}
							}
						});
						responseBotCall(message, arg);
					}
					break;
				case "dm":
					printLog("Bot called by DM", {
						embed: {
							title: "Bot call by DM",
							color: COLOR_INFO,
							description: "Bot called",
							fields: [{
									name: "Author",
									value: `<@!${message.author.id}>`,
									inline: true
								},
								{
									name: "Message",
									value: message.content,
									inline: true
								}
							],
							footer: {
								text: callTime
							}
						}
					});
					responseBotCall(message, message.content)
					break;
			}
		}
	}
});
/*
function prepareDB() {
	pgClient.connect();
	pgClient.query("SELECT table_schema, table_name FROM information_schema.tables;")
}
*/
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
	// setHelpEmbed();
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
	Bot.destroy();
}

process.on("SIGINT", () => {
	logAndThenExit("SIGINT");
});

process.on("SIGTERM", () => {
	logAndThenExit("SIGTERM");
});

Bot.login(BOT_TOKEN);