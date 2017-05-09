const Discord = require('discord.js');
const bot = new Discord.Client();
module.exports = bot;
const config = require('./../config.json');
const directMessageHandler = require('./messageHandlers/directMessageHandler');
const textChannelMessageHandler = require('./messageHandlers/textChannelMessageHandler');
const logger = require('./../common/util/logger.js');

bot.on("message", handleMessage);

function handleMessage(message) {
    if (message.channel instanceof Discord.DMChannel) {
        directMessageHandler.handleDirectMessage(message);
    } else if (message.channel instanceof Discord.TextChannel) {
        textChannelMessageHandler.handleTextChannelMessage(message);
    }
}

logger.info("Getting bot ready!");
bot.on('ready', () => {
    logger.info('I am ready!');
    if (bot.user) {
        bot.user.setGame("http://jacquesbot.io");
    }
});

bot.login(config.token);