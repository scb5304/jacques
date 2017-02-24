const Discord = require("discord.js");
const bot = require('../jacques');
const config = require('../config.json');
const fs = require('fs');
const Sound = require('../model/sound').Sound;;
const ytdl = require('ytdl-core');
const Db = require('../db');
const logger = require('../logger.js')

var mStreamVolume = 0.40;

const SOUNDS_DIRECTORY = config.soundsDirectory;

function handleTextChannelMessage(message) {

	var prefix = "!";
	var messageContent = message.content;
	if (!messageContent.startsWith(prefix)) return;
	logger.info("Received message: " + message.content);

	var member = message.member;
	if (!member) return;

	var voiceChannel = member.voiceChannel;
	if (!voiceChannel) return;

	messageContent = messageContent.substring(1);
	messageContent = messageContent.toLowerCase();

	var commandArgs = messageContent.split(" ");

	logger.info("Routing message to appropriate call.");

	switch (commandArgs[0]) {
		case "cancel":
			//Submitted by Chris Skosnik on Feburary 6th, 2017
		case "byejon":
		case "byejacques":
			logger.info("Received request to cancel voice connection.");
			cancelVoiceConnection(voiceChannel);
			break;
		case "stop":
			if (member.displayName != "Spitsonpuppies") return;
			shutdownJontronBot();
			break;
		case "stream":
			logger.info("Received request to stream a youtube video.");
			if (alreadySpeaking(voiceChannel)) return;
			streamAudio(voiceChannel, message);
			break;
		case "volume":
			logger.info("Received request to change volume.");
			changeVolume(message);
			break;
			//command for last played "uncancel"
		case "sync":
			Db.syncSounds();
			break;
		case "tag":
		case "tags":
			logger.info("Received request to play a sound with tags.");
			if (alreadySpeaking(voiceChannel)) return;
			var tags = commandArgs;
			//Remove elements starting at index 0, and remove 1 of them. Basically, tags.remove(0) in Java.
			tags.splice(0, 1);
			Db.getRandomSoundNameWithTags(tags)
				.then(function(fullSoundName) {
					playSound(fullSoundName, message.member, voiceChannel, "playTag")
				})
				.catch(logger.error);
			break;
		case "sounds":
			logger.info("Attempting to print all sounds.");
			Db.getAllSounds()
				.then(function(sounds) {
					var helpText = "";
					sounds.sort();
					var i = 0;
					for (var sound of sounds) {
						helpText += sound.name.split("\.")[0] + ", ";
					}
					helpText = helpText.substring(0, helpText.length - 2);

					logger.info("length:" + helpText.length);
					//TODO this is bad.
					if (helpText.length >= 1500) {
						message.reply(helpText.substring(0, 1500))
							.then(msg => logger.info(`Sent a reply to ${msg.author.username}`))
							.catch(console.error);

						message.reply(helpText.substring(1500))
						.then(msg => logger.info(`Sent a reply to ${msg.author.username}`))
						.catch(console.error);

					} else {
						message.reply(helpText)
						.then(msg => logger.info(`Sent a reply to ${msg.author.username}`))
						.catch(console.error);
					}
					
				})
				.catch(logger.error);
			break;
		case "":
			logger.info("No arguments provided, going to play a random sound.")
			if (alreadySpeaking(voiceChannel)) return;
			Db.getRandomSoundName()
				.then(function(fullSoundName) {
					playSound(fullSoundName, message.member, voiceChannel, "playRandom");
				})
				.catch(logger.error);
			break;
		default:
			logger.info("Default case: request to play a sound.");
			if (alreadySpeaking(voiceChannel)) return;
			var soundName = commandArgs[0];

			Db.soundExists(soundName)
				.then(function(fullSoundName) {
					playSound(fullSoundName, message.member, voiceChannel, "playTargeted");
				})
				.catch(logger.error);
			break;
	}

	if (message.channel.name != "commands") {
		message.delete(2000).catch(logger.error);
	}
}

function alreadySpeaking(voiceChannel) {
	var connection = voiceChannel.connection;
	var alreadySpeaking = connection && connection.speaking;
	if (alreadySpeaking) {
		logger.info("Already speaking in channel " + voiceChannel.name);
	}
	return alreadySpeaking;
}

function cancelVoiceConnection(voiceChannel) {
	logger.info("Cancelling voice connection.")
	var connection = voiceChannel.connection;
	if (!connection) return;
	connection.disconnect();
}

function shutdownJontronBot() {
	logger.info("Stopping...");
	bot.destroy()
		.then(function() {
			logger.info("Shut down successfully.")
		})
		.catch(logger.error);
}

function streamAudio(voiceChannel, message) {
	logger.info("Attempting to stream audio...")
	var streamArg = message.content.split(" ")[1];

	const streamOptions = {
		seek: 0,
		volume: mStreamVolume
	};
	voiceChannel.join()
		.then(connection => {
			const stream = ytdl(streamArg, {
				filter: 'audioonly'
			});

			const dispatcher = connection.playStream(stream, streamOptions);
			dispatcher.once('end', function() {
				logger.info("Leaving after playing sound.");
				connection.disconnect();
			});
			dispatcher.once('speaking', function() {
				dispatcher.setVolumeLogarithmic(mStreamVolume);
			})
		})
		.catch(logger.error);
}

function playSound(soundName, member, voiceChannel, eventType) {
	logger.info("Attempting to play sound " + soundName + " in " + voiceChannel.name);
	var path = SOUNDS_DIRECTORY + soundName;
	voiceChannel.join().then(connection => {
			const dispatcher = connection.playFile(path);
			Db.insertSoundEvent(soundName, member.displayName, eventType);
			dispatcher.once('end', function() {
				logger.info("Leaving after playing sound.");
				connection.disconnect();
			});
		})
		.catch(logger.error);
}

function changeVolume(message) {
	var requestedVolume = message.content.split(" ")[1];
	if (!requestedVolume) {
		message.reply("Volume is currently at " + mStreamVolume * 100 + "%");
		return;
	}

	var requester = message.member;
	var currentVoiceConnection = bot.voiceConnections.get(requester.guild.id);
	//No voice connection or message author not in current voice channel.
	if (!currentVoiceConnection || currentVoiceConnection.channel != requester.voiceChannel) return;

	//Not a number
	if (isNaN(requestedVolume)) return;

	var actualVolume = requestedVolume / 100;
	if (actualVolume > 1) {
		actualVolume = 1;
	}

	message.reply("Changing volume from " + (mStreamVolume * 100) + "% to " + requestedVolume + "%")

	mStreamVolume = actualVolume;
	currentVoiceConnection.player.dispatcher.setVolumeLogarithmic(mStreamVolume);
}

module.exports.handleTextChannelMessage = handleTextChannelMessage;