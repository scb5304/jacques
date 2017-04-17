const Discord = require('discord.js');
const bot = new Discord.Client();
module.exports = bot;
const config = require('./config.json');
const directMessageHandler = require('./messageHandlers/directMessageHandler');
const textChannelMessageHandler = require('./messageHandlers/textChannelMessageHandler');
const logger = require('./logger.js');
const app = require('./web/app.js')

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
});

bot.login(config.token);
