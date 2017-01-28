const Discord = require("discord.js");
const bot = new Discord.Client();
const config = require('./config.json');
const fs = require('fs');
const Sound = require('./model/sound');
const ytdl = require('ytdl-core');

const SOUNDS_DIRECTORY = config.soundsDirectory;

bot.on("message", handleMessage);

function handleMessage(message) {
	var messageContent = message.content;
	var prefix = "!";
	if (!messageContent.startsWith(prefix)) return;

	messageContent = messageContent.substring(1);
	var commandArgs = messageContent.split(" ");
	handleCommand(message.member, commandArgs);
}

function handleCommand(member, commandArgs) {
	var voiceChannel = member.voiceChannel;
	
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
					dispatcher.setVolume(0.125);
				})
				.catch(console.error);
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


console.log("Getting bot ready!");
bot.on('ready', () => {
	console.log('I am ready!');
});

bot.login(config.token);