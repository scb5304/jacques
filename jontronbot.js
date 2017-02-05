const Discord = require("discord.js");
const bot = new Discord.Client();
module.exports = bot;
const config = require('./config.json');
const directMessageHandler = require('./messageHandlers/directMessageHandler')
const textChannelMessageHandler = require('./messageHandlers/textChannelMessageHandler')

bot.on("message", handleMessage);

function handleMessage(message) {
	if (message.channel instanceof Discord.DMChannel) {
		directMessageHandler.handleDirectMessage(message);
	} else if (message.channel instanceof Discord.TextChannel) {
		textChannelMessageHandler.handleTextChannelMessage(message);
	}
}


console.log("Getting bot ready!");
bot.on('ready', () => {
	console.log('I am ready!');
});

bot.login(config.token);
