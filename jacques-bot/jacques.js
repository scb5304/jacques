var Discord = require("discord.js");

var Db = require("./../common/data/db");
var logger = require("./../common/util/logger.js");

var soundboard = require("./soundboard.js");
var streamer = require("./streamer.js");
var messenger = require("./messenger.js");
var UIDGenerator = require('uid-generator');


var bot;
var site = "http://jacquesbot.io";
var prefix = process.env.JACQUES_PREFIX;

function initialize() {
    Db.connect();
    bot = new Discord.Client();
    bot.login(process.env.JACQUES_TOKEN);
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
    if (!cleanedMessageContent.startsWith(prefix)) {
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

    var logMessage = "Valid Jacques message " + message.content + " from " + member.displayName + " on server " + message.guild.name;
    if (member.voiceChannel) {
        logMessage += " in voice channel " + member.voiceChannel.name;
    }
    logger.info(logMessage);
    routeTextChannelMessage(message, cleanedMessageContent);
    return true;
}

function onDirectChannelMessage(message) {
    if (message.author.username !== bot.user.username) {
        messenger.sendHelp(message);
    }
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
            case "stop":
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
            case "help":
            case "sounds":
                logger.info("Help.");
                help(message);
                break;
            case "helptext":
                logger.info("Sound dump.");
                sendSoundDump(message);
                break;
            case "upload":
                sendUploadBirdfeed(message);
                break;
            default:
                logger.info("Default: play targeted sound.");
                playTargetedSound(message, commandArgs);
                break;
        }
    }

    cleanUp(message);
}

function playRandomSound(message) {
    if (!message.member.voiceChannel || alreadySpeaking(message)) {
        return;
    }
    soundboard.playRandomSound(message);
}

function cancelVoiceConnection(message) {
    if (!message.member.voiceChannel) {
        return false;
    }
    var connection = message.member.voiceChannel.connection;
    if (connection) {
        connection.disconnect();
    }
}

function streamAudio(message, commandArgs) {
    if (!message.member.voiceChannel || alreadySpeaking(message)) {
        return;
    }
    var streamLink = commandArgs.length > 1 ? commandArgs[1] : null;
    streamer.streamAudio(message.member.voiceChannel, streamLink);
}

function volume(message, commandArgs) {
    if (!message.member.voiceChannel) {
        return;
    }
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

function sendUploadBirdfeed(message) {
    var user = message.author;
    var guildMember = message.member;

    if (!user) {
        logger.error("This upload message doesn't have a user.");
        return;
    }
    if (!guildMember.guild) {
        logger.error("This upload message doesn't have a guild member with a guild.");
        return;
    }

    var messageBase = "Hello. You requested a sound upload on '" + guildMember.guild.name + "'. ";
    var messageToSend;

    if (userHasUploadPermissions(guildMember)) {
        createBirdfeedForGuildMember(guildMember).then(function(birdfeed) {
            messageToSend = messageBase + "Here is your birdfeed: " + birdfeed + ". Please copy it, visit http://jacquesbot.io, and include it in your sound upload.";
            messenger.sendDirectMessage(user, messageToSend);
        }).catch(function(err) {
            messageToSend = messageBase + "Sorry, but there was an error giving you birdfeed. Which is unfortunate, because I'm starving.";
            messenger.sendDirectMessage(user, messageToSend);
            logger.error(err);
        });
    } else {
        messageToSend = messageBase + "Sorry, but you need the 'Attach Files' permission to upload sounds for this server.";
        messenger.sendDirectMessage(user, messageToSend);
    }
}

function userHasUploadPermissions(guildMember) {
    try {
        return guildMember.hasPermission("ATTACH_FILES");
    } catch(err) {
        logger.error(err);
        return false;
    }
}

function createBirdfeedForGuildMember(guildMember) {
    return new Promise((resolve, reject) => {
        var token = new UIDGenerator(UIDGenerator.BASE16, 10).generateSync();
        Db.upsertUserWithDiscordDataAndToken(guildMember, token).then(function() {
            return resolve(token);
        }).catch(function(err) {
            return reject(err);
        });
    });
}

function playTargetedSound(message, commandArgs) {
    if (!message.member.voiceChannel || alreadySpeaking(message)) {
        return;
    }
    var soundArg = commandArgs[0];
    soundboard.playTargetedSound(message, soundArg);
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
    return commandArgs;
}

function alreadySpeaking(message) {
    if (!bot) {
        return;
    }
    var currentVoiceConnection = bot.voiceConnections.get(message.guild.id);

    if (currentVoiceConnection) {
        message.reply("Already speaking in channel " + currentVoiceConnection.channel.name);
        return true;
    }

    return false;
}

module.exports.initialize = initialize;
module.exports.onTextChannelMessage = onTextChannelMessage;