const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config.json');
const fs = require('fs');
const Sound = require('./model/sound');
const ytdl = require('ytdl-core');
const apiai = require('apiai');

const SOUNDS_DIRECTORY = config.soundsDirectory;
const APIAI_KEY = config.apiaiKey;

var volume = 0.25;
var app = apiai(APIAI_KEY);
bot.on("message", handleMessage);

function handleMessage(message) {
	if (message.channel instanceof Discord.DMChannel) {
		handleDirectMessage(message);
	} else if (message.channel instanceof Discord.TextChannel) {
		handleTextChannelMessage(message);
	}
}

function handleDirectMessage(message) {
	var request = app.textRequest(message.content, {
		sessionId: 1
	});
	request.on('response', function(response) {
		var responseMessage = response.result.fulfillment.speech;
		message.author.sendMessage(responseMessage)
			.then(message => console.log(`Sent message: ${message.content}`))
			.catch(null);
		console.log(response.result.fulfillment.speech);
	});
	request.on('error', function(error) {
		//console.log(error);
	});

	request.end();
}

function handleTextChannelMessage(message) {
	var prefix = "!";
	var messageContent = message.content;
	if (!messageContent.startsWith(prefix)) return;

	messageContent = messageContent.substring(1);
	var commandArgs = messageContent.split(" ");
	var member = message.member;

	var voiceChannel = member.voiceChannel;
	if (!voiceChannel) return;
	if (commandArgs[0] === "cancel") {
		voiceChannel.connection.disconnect();
	} else if (commandArgs[0] === "stop" && member.displayName === "Spitsonpuppies") {
		console.log("Stopping.");
		bot.destroy();
	} else if (commandArgs[0] === "stream") {
		if (commandArgs[1] != undefined) {
			const streamOptions = {
				seek: 0,
				volume: 1
			};
			voiceChannel.join()
				.then(connection => {
					const stream = ytdl(commandArgs[1], {
						filter: 'audioonly'
					});

					const dispatcher = connection.playStream(stream, streamOptions);
					dispatcher.setVolume(0.25);
				})
				.catch(console.error);
		}
	} else if (commandArgs[0] === "volume") {
		var requester = message.member;
		if (requester) {
			try {
				var currentVoiceConnectionInThisGuild = bot.voiceConnections.get(requester.guild.id);
				var requestedVolume = commandArgs[1];
				var actualVolume = commandArgs[1] / 100;
				if (actualVolume > 1) {
					actualVolume = 1;
				}
				volume = actualVolume;

				if (currentVoiceConnectionInThisGuild) {
					currentVoiceConnectionInThisGuild.player.dispatcher.setVolume(actualVolume);
				}
			} catch (err) {
				console.error(err);
			}
		}
	} else {
		var soundName = commandArgs[0] + ".mp3";
		if (voiceChannel.connection != null && voiceChannel.connection.speaking == true) {
			console.log("Already playing a sound!");
			return;
		}
		soundExists(soundName, function(err) {
			if (err) {
				console.log(err);
			} else {
				playSound(soundName, voiceChannel);
			}
		});
	}
}

function playSound(soundName, voiceChannel) {
	var path = SOUNDS_DIRECTORY + soundName;
	console.log("Attempting to play sound " + soundName);
	voiceChannel.join().then(connection => {
			console.log("Connected.");
			const dispatcher = connection.playFile(path);
			dispatcher.once('end', function() {
				console.log("Disconnected.");
				connection.disconnect();
			});
		})
		.catch(console.error);
}

function soundExists(soundName, callback) {
	fs.readdir(SOUNDS_DIRECTORY, function(err, files) {
		for (var file of files) {
			if (file === soundName) {
				callback()
				return;
			}
		}
		callback("File not found!");
	});

}

function changeVolume(volume) {

}


console.log("Getting bot ready!");
bot.on('ready', () => {
	console.log('I am ready!');
});

bot.login(config.token);