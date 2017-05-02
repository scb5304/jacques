const Discord = require("discord.js");
const bot = require('../jacques');
const config = require('../../config.json');
const fs = require('fs');
const Sound = require('../../common/model/sound').Sound;
const ytdl = require('ytdl-core');
const Db = require('../../common/data/db');
const logger = require('../../common/util/logger.js')
const util = require('../../common/util/utility');

var mStreamVolume = 0.40;
const HELP_STRING = "Jacques is a soundboard bot. To play a sound, type ! followed by the name of the sound. If you don't supply a sound name, it will play a random one. You can also " +
    "stream the audio of a youtube video with !stream.\n\n" +
    "Visit Jacques online at http://jacquesbot.io for a list of sounds, or use !helptext if you really want a text dump."
const SOUNDS_DIRECTORY = config.soundsDirectory;

function handleTextChannelMessage(message) {

    var prefix = "!";
    var messageContent = message.content;
    if (!messageContent.startsWith(prefix)) return;

    var member = message.member;
    if (!member) return;

    var voiceChannel = member.voiceChannel;
    if (!voiceChannel) return;

    logger.info("Received message: " + message.content + " from " + message.member.displayName + " on server " + message.guild);

    messageContent = messageContent.substring(1);
    messageContent = messageContent.toLowerCase();

    var commandArgs = messageContent.split(" ");

    logger.info("Routing message to appropriate call.");

    switch (commandArgs[0]) {
        case "cancel":
        //Submitted by Chris Skosnik on Feburary 6th, 2017
        case "byejon":
        case "byejacques":
            logger.info("Cancel voice connection.");
            cancelVoiceConnection(voiceChannel);
            break;
        case "stream":
            logger.info("Stream a youtube video.");
            if (alreadySpeaking(message)) return;
            streamAudio(voiceChannel, message);
            break;
        case "volume":
            logger.info("Change the volume.");
            changeVolume(message);
            break;
        case "sync":
            if (member.displayName != "Spitsonpuppies") return;
            logger.info("Sync the database.");
            Db.syncSounds();
            break;
        case "help":
        case "sounds":
            logger.info("Help.");
            message.reply(HELP_STRING);
            break;
        case "helptext":
            logger.info("Help text sound dump.")
            sendSoundDump(message);
            break;
        case "":
            logger.info("No arguments provided, going to play a random sound.")
            if (alreadySpeaking(message)) return;
            Db.getRandomSoundName()
                .then(function(fullSoundName) {
                    playSound(fullSoundName, message.member, voiceChannel, "playRandom");
                })
                .catch(logger.error);
            break;
        default:
            logger.info("Default case: request to play a specific sound.");
            if (alreadySpeaking(message)) return;
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

function alreadySpeaking(message) {
    var currentVoiceConnection = bot.voiceConnections.get(message.guild.id);

    if (currentVoiceConnection) {
        logger.info("Already speaking in channel " + currentVoiceConnection.channel.name);
        return true;
    }
    return false;
}

function cancelVoiceConnection(voiceChannel) {
    var connection = voiceChannel.connection;
    if (!connection) return;
    connection.disconnect();
}

function streamAudio(voiceChannel, message) {
    logger.info("Attempting to stream audio...")
    var secondsToSeek = 0;

    var streamArg = message.content.split(" ")[1]; //entire youtube URL
    var timeArg = streamArg.split("\?t=")[1]; // 3m4s

    if (timeArg) {
        secondsToSeek = util.secondsFromTimeArg(timeArg);
    }

    logger.info("Seconds: " + secondsToSeek)

    const streamOptions = {
        seek: secondsToSeek,
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

function sendSoundDump(message) {
    logger.info("Attempting to print all sounds.");
    Db.getAllSounds()
        .then(function(sounds) {
            var helpText = "";
            sounds.sort();
            for (var sound of sounds) {
                helpText += sound.name.split("\.")[0] + ", ";
            }
            helpText = helpText.substring(0, helpText.length - 2);

            var helpTextSegments = helpText.match(/.{1,1500}/g);
            for (var helpTextSegment of helpTextSegments) {
                message.reply(helpTextSegment)
                    .catch(console.error);
            }
        })
        .catch(logger.error);
}

module.exports.handleTextChannelMessage = handleTextChannelMessage;
