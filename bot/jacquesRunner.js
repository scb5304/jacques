var logger = require('./../common/util/logger.js');
var jacques = require('./jacques.js');
var Discord = require('discord.js');
var Db = require('./../common/data/db');
var config = require('./../config.json');

run();

function run() {
	Db.connect();
    var bot = new Discord.Client();
    jacques.initialize(bot);
    bot.login(config.token);
    bot.on("ready", onReady);
    bot.on("message", onMessage);
}

function onReady() {
    jacques.onReady();
}

function onMessage(message) {
    if (message.channel instanceof Discord.TextChannel) {
        jacques.onTextChannelMessage(message);
    } else if (message.channel instanceof Discord.DMChannel) {
        jacques.onDirectChannelMessage(message);
    }
}
