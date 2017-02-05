const Discord = require("discord.js");
const bot = new Discord.Client();
module.exports = bot;
const config = require('./config.json');
const directMessageHandler = require('./messageHandlers/directMessageHandler')
const textChannelMessageHandler = require('./messageHandlers/textChannelMessageHandler')

bot.on("message", handleMessage);
bot.on("voiceStateUpdate", handleVoiceStateUpdate);

function handleVoiceStateUpdate(oldMember, newMember) {
	if (oldMember.voiceChannel != newMember.voiceChannel && newMember.displayName === "Eldre Hund") {
		newMember.voiceChannel.join().then(connection => {
			const dispatcher = connection.playFile("D:/Sounds/hehorg.mp3");
			dispatcher.once('end', function() {
				console.log("Leaving after playing sound.");
				connection.disconnect();
			});
		})
		.catch(console.error);
	}
}

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
