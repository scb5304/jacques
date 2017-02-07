const Discord = require("discord.js");
const bot = require('../jontronbot');
const config = require('../config.json');
const fs = require('fs');
const Sound = require('../model/sound').Sound;;
const ytdl = require('ytdl-core');
const Db = require('../db');

var STREAM_VOLUME = 0.225;

const SOUNDS_DIRECTORY = config.soundsDirectory;

function handleTextChannelMessage(message) {

	var prefix = "!";
	var messageContent = message.content;
	if (!messageContent.startsWith(prefix)) return;
	console.log("Received message: " + message.content);

	var member = message.member;
	if (!member) return;

	var voiceChannel = member.voiceChannel;
	if (!voiceChannel) return;

	messageContent = messageContent.substring(1);

	var commandArgs = messageContent.split(" ");

	console.log("Routing message to appropriate call.");

	switch (commandArgs[0]) {
		case "cancel":
			//Submitted by Chris Skosnik on Feburary 6th, 2017
		case "byejon":
			cancelVoiceConnection(voiceChannel);
			break;
		case "stop":
			if (member.displayName != "Spitsonpuppies") return;
			shutdownJontronBot();
			break;
		case "stream":
			streamAudio(voiceChannel, message);
			break;
		case "volume":
			changeVolume(message);
			break;
			//command for last played "uncancel"
		case "sync":
			Db.syncSounds();
			break;
		case "":
			if (alreadySpeaking(voiceChannel)) return;
			Db.getRandomSoundName()
				.then(function(soundName) {
					playSound(soundName, message.member, voiceChannel, "random");
				})
				.catch(console.error);
			break;
		default:
			if (alreadySpeaking(voiceChannel)) return;
			var soundName = commandArgs[0];

			Db.soundExists(soundName)
				.then(function() {
					playSound(soundName, message.member, voiceChannel, "play");
				})
				.catch(console.error);
			break;
	}
}

function alreadySpeaking(voiceChannel) {
	var connection = voiceChannel.connection;
	var alreadySpeaking = connection && connection.speaking;
	if (alreadySpeaking) {
		console.log("Already speaking in channel " + voiceChannel.name);
	}
	return alreadySpeaking;
}

function cancelVoiceConnection(voiceChannel) {
	console.log("Cancelling voice connection.")
	var connection = voiceChannel.connection;
	if (!connection) return;
	connection.disconnect();
}

function shutdownJontronBot() {
	console.log("Stopping...");
	bot.destroy()
		.then(function() {
			console.log("Shut down successfully.")
		})
		.catch(console.error);
}

function streamAudio(voiceChannel, message) {
	console.log("Attempting to stream audio...")
	var streamArg = message.content.split(" ")[1];

	const streamOptions = {
		seek: 0,
		volume: 1
	};
	voiceChannel.join()
		.then(connection => {
			const stream = ytdl(streamArg, {
				filter: 'audioonly'
			});

			const dispatcher = connection.playStream(stream, streamOptions);
			dispatcher.once('end', function() {
				console.log("Leaving after playing sound.");
				connection.disconnect();
			});
			dispatcher.setVolume(STREAM_VOLUME);
		})
		.catch(console.error);
}

function playSound(soundName, member, voiceChannel, eventType) {
	console.log("Attempting to play sound " + soundName + " in " + voiceChannel.name);
	var path = SOUNDS_DIRECTORY + soundName + ".mp3";
	voiceChannel.join().then(connection => {
			const dispatcher = connection.playFile(path);
			Db.insertSoundEvent(soundName, member.displayName, eventType);
			dispatcher.once('end', function() {
				console.log("Leaving after playing sound.");
				connection.disconnect();
			});
		})
		.catch(console.error);
}

function changeVolume(message) {
	var requester = message.member;
	if (!requester) return;
	var requestedVolume = message.content.split(" ")[1];

	try {
		var currentVoiceConnectionInThisGuild = bot.voiceConnections.get(requester.guild.id);
		var actualVolume = requestedVolume / 100;
		if (actualVolume > 1) {
			actualVolume = 1;
		}
		STREAM_VOLUME = actualVolume;

		currentVoiceConnectionInThisGuild.player.dispatcher.setVolume(STREAM_VOLUME);
	} catch (err) {
		console.error(err);
	}
}

module.exports.handleTextChannelMessage = handleTextChannelMessage;