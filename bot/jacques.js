var fs = require('fs');
var Discord = require('discord.js');

var config = require('./../config.json');
var logger = require('./../common/util/logger.js');
var util = require('./../common/util/utility.js');
var Db = require('./../common/data/db');
var Sound = require('./../common/model/sound').Sound;

var soundboard = require('./soundboard.js');
var streamer = require('./streamer.js');
var messenger = require('./messenger.js');

var prefix = "!";

var bot;

function fly() {
    bot = new Discord.Client();
    bot.login(config.token);
    bot.on("ready", onReady);
    bot.on("message", onMessage);
    Db.connect();
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
    var messageContent = message.content;
    if (!messageContent.startsWith(prefix)) {
        return;
    }

    var member = message.member;
    if (!member) {
        logger.info("Message has no guild member.");
        return;
    }

    var voiceChannel = member.voiceChannel;
    if (!voiceChannel) {
        logger.info("Guild member not in a voice channel.");
        return;
    }

    logger.info("Received potentially valid Jacques message: " + messageContent + " from " +
        member.displayName + " in voice channel " + voiceChannel.name + " on server " + message.guild);
    logger.info("Handing off to routeTextChannelMessage...");
    routeTextChannelMessage(message);
}

function onDirectChannelMessage(message) {
    message.reply("I don't know how to do shit here. Squawk.");
}

function routeTextChannelMessage(message) {
    var messageContent = message.content.substring(1);

    var commandArgs = parseCommandArgs(messageContent);
    var baseCommandArg = commandArgs[0];

    if (!baseCommandArg) {
        playRandomSound(message);
    } else {
        baseCommandArg = baseCommandArg.toLowerCase();
        switch (baseCommandArg) {
            case "cancel":
            case "byejon":
            case "byejacques":
                logger.info("Cancel voice connection.");
                cancelVoiceConnection(message);
                break;
            case "stream":
                logger.info("Stream audio.");
                streamAudio(message);
                break;
            case "volume":
                logger.info("Change volume.");
                changeVolume(message);
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
    if (!connection) return;
    connection.disconnect();
}

function streamAudio(message) {
    if (alreadySpeaking(message)) return;
    var streamLink = commandArgs.length > 1 ? commandArgs[1] : null;
    streamer.streamAudio(message.member.voiceChannel, streamLink);
}

function changeVolume(message) {
    var currentVoiceConnection = bot.voiceConnections.get(message.member.guild.id);
    var requestedVolume = commandArgs.length > 1 ? commandArgs[1] : null;
    streamer.changeVolume(message, requestedVolume, currentVoiceConnection);
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
            messenger.sendSounds(sounds, message);
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

module.exports.fly = fly;
module.exports.routeTextChannelMessage = routeTextChannelMessage;
