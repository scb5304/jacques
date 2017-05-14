var Discord = require('discord.js');

var Db = require('./../common/data/db');
var Sound = require('./../common/model/sound').Sound;
var config = require('./../config.json');
var logger = require('./../common/util/logger.js');

var soundboard = require('./soundboard.js');
var streamer = require('./streamer.js');
var messenger = require('./messenger.js');

var bot;
var site = "http://jacquesbot.io";

function initialize() {
	Db.connect();
	bot = new Discord.Client();
	bot.login(config.token);
    bot.on("ready", onReady);
    bot.on("message", onMessage);
}

function onReady() {
    logger.info("I'm ready, I'm ready.");
    if (bot.user) {
        bot.user.setGame(site);
    }
}

function onMessage(message) {
    if (message.channel instanceof Discord.TextChannel) {
        onTextChannelMessage(message);
    } else if (message.channel instanceof Discord.DMChannel) {
        onDirectChannelMessage(message);
    }
}

function onTextChannelMessage(message) {
    var cleanedMessageContent = message.content.trim();
    if (!cleanedMessageContent.startsWith(config.prefix)) {
        return false;
    } else {
        logger.info("Received potentially valid Jacques message: " + message.content);
        cleanedMessageContent = cleanedMessageContent.substring(1);
    }

    var member = message.member;
    if (!member) {
        logger.info("Message has no guild member.");
        return false;
    }

    var voiceChannel = member.voiceChannel;
    if (!voiceChannel) {
        logger.info("Guild member not in a voice channel.");
        return false;
    }

    logger.info("Valid Jacques message " + message.content + " from " + member.displayName + " in voice channel " + voiceChannel.name + " on server " + message.guild.name);
    routeTextChannelMessage(message, cleanedMessageContent);
    return true;
}

function onDirectChannelMessage(message) {
    //message.reply("I don't know how to do shit here. Squawk.");
}

function routeTextChannelMessage(message, cleanedMessageContent) {
    var commandArgs = parseCommandArgs(cleanedMessageContent);
    var baseCommandArg = commandArgs[0];

    if (!baseCommandArg) {
        playRandomSound(message);
    } else {
        var lowerBaseCommandArg = baseCommandArg.toLowerCase();
        switch (lowerBaseCommandArg) {
            case "cancel":
            case "byejon":
            case "byejacques":
                logger.info("Cancel voice connection.");
                cancelVoiceConnection(message);
                break;
            case "stream":
                logger.info("Stream audio.");
                streamAudio(message, commandArgs);
                break;
            case "volume":
                logger.info("Volume.");
                volume(message, commandArgs);
                break;
            case "sync":
                logger.info("Sync.");
                sync();
                break;
            case "help":
            case "sounds":
                logger.info("Help.");
                help(message);
                break;
            case "helptext":
                logger.info("Sound dump.");
                sendSoundDump(message);
                break;
            default:
                logger.info("Default: play targeted sound.");
                playTargetedSound(message, baseCommandArg);
                break;
        }
    }

    cleanUp(message);
};

function playRandomSound(message) {
    if (alreadySpeaking(message)) return;
    soundboard.playRandomSound(message);
}

function cancelVoiceConnection(message) {
    var connection = message.member.voiceChannel.connection;
    if (connection) {
    	connection.disconnect();
    }
}

function streamAudio(message, commandArgs) {
    if (alreadySpeaking(message)) return;
    var streamLink = commandArgs.length > 1 ? commandArgs[1] : null;
    streamer.streamAudio(message.member.voiceChannel, streamLink);
}

function volume(message, commandArgs) {
    var currentVoiceConnection = bot.voiceConnections.get(message.member.guild.id);
    var requestedVolume = commandArgs.length > 1 ? commandArgs[1] : null;
    if (requestedVolume) {
        logger.info("Change the volume.");
        streamer.changeVolume(message, requestedVolume, currentVoiceConnection);
    } else {
        logger.info("Print the volume.");
        messenger.printVolume(message, streamer.getVolume());
    }
}

function sync() {
    if (member.displayName !== "Spitsonpuppies") return;
    Db.syncSounds();
}

function help(message) {
    messenger.sendHelp(message);
}

function sendSoundDump(message) {
    Db.getAllSounds()
        .then(function(sounds) {
            messenger.sendSounds(message, sounds);
        })
        .catch(logger.error);
}

function playTargetedSound(message, soundName) {
    if (alreadySpeaking(message)) return;
    soundboard.playTargetedSound(message, soundName);
}

function cleanUp(message) {
    messenger.deleteMessage(message);
}

function parseCommandArgs(messageContent) {
    var commandArgs = messageContent.split(" ");
    commandArgs.forEach(function(commandArg, i, array) {
        if (commandArg === " " || commandArg === "") {
            array.splice(i, 1);
        }
    });
    logger.info("commandArgs: " + commandArgs);
    return commandArgs;
}

function alreadySpeaking(message) {
    if (!bot) return;
    var currentVoiceConnection = bot.voiceConnections.get(message.guild.id);

    if (currentVoiceConnection) {
        message.reply("Already speaking in channel " + currentVoiceConnection.channel.name);
        return true;
    }

    return false;
}

module.exports.initialize = initialize;
module.exports.onTextChannelMessage = onTextChannelMessage;