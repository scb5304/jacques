const Discord = require("discord.js");
const logger = require("../../common/util/logger");
const soundboard = require("../modules/soundboard");
const streamer = require("../modules/streamer");
const messenger = require("../modules/messenger");
const guildManager = require("../modules/guild-manager");
const birdfeedManager = require("../modules/birdfeed-manager");

let bot;
const site = "http://jacquesbot.io";
const prefix = process.env.JACQUES_PREFIX;

function setClientInstance (clientInstance) {
    bot = clientInstance;
}

function onLoggedIn() {
    if (!bot) {
        logger.error("jacques-core did not have its client instance set prior to being logged in.");
    } else {
        guildManager.refreshGuilds(bot.guilds.array());
        if (bot.user) {
            bot.user.setGame(site).then(function(clientUser) {
                logger.info(clientUser.username + " is playing " + site);
            });
        }
    }
}

function onReady() {
    logger.info("I'm ready, I'm ready.");
}

function onMessage(message) {
    if (message.channel instanceof Discord.TextChannel) {
        return onTextChannelMessage(message);
    } else if (message.channel instanceof Discord.DMChannel) {
        return onDirectChannelMessage(message);
    }
    return false;
}

function onGuildCreate() {
    guildManager.refreshGuilds(bot.guilds.array());
}

function onGuildDelete() {
    guildManager.refreshGuilds(bot.guilds.array());
}

function onTextChannelMessage(message) {
    let cleanedMessageContent = message.content.trim();
    if (!cleanedMessageContent.startsWith(prefix)) {
        return false;
    } else {
        logger.info("Received potentially valid Jacques message: " + message.content);
        cleanedMessageContent = cleanedMessageContent.substring(1);
    }
    let member = message.member;
    if (!member) {
        logger.info("Message has no guild member.");
        return false;
    }

    let logMessage = "Valid Jacques message " + message.content + " from " + member.displayName + " on server " + message.guild.name;
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
        return true;
    }
    return false;
}

function routeTextChannelMessage(message, cleanedMessageContent) {
    const commandArgs = parseCommandArgs(cleanedMessageContent);
    let baseCommandArg = commandArgs[0];

    if (!baseCommandArg) {
        playRandomSound(message);
    } else {
        const lowerBaseCommandArg = baseCommandArg.toLowerCase();
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
                onStreamAudioMessageReceived(message, commandArgs);
                break;
            case "volume":
                logger.info("Volume.");
                onVolumeMessageReceived(message, commandArgs);
                break;
            case "help":
            case "sounds":
                logger.info("Help.");
                onHelpMessageReceived(message);
                break;
            case "birdfeed":
                onBirdfeedMessageReceived(message);
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
    message.member.voiceChannel.leave();
    const connection = message.member.voiceChannel.connection;
    if (connection) {
        connection.disconnect();
    }
}

function onStreamAudioMessageReceived(message, commandArgs) {
    if (!message.member.voiceChannel || alreadySpeaking(message)) {
        return;
    }
    const streamLink = commandArgs.length > 1 ? commandArgs[1] : null;

    guildManager.getGuildVolume(message.member.guild.id).then(function(volume) {
        streamer.streamAudio(message.member.voiceChannel, volume, streamLink);
    }).catch(logger.error);
}

function onVolumeMessageReceived(message, commandArgs) {
    if (!message.member.voiceChannel) {
        return;
    }

    const currentVoiceConnection = bot.voiceConnections.get(message.member.guild.id);
    const requestedVolume = commandArgs.length > 1 ? commandArgs[1] : null;

    if (requestedVolume) {
        logger.info("Change the volume.");
        const volumeSet = streamer.changeVolume(message, requestedVolume, currentVoiceConnection);
        messenger.replyToMessage(message, "Changing volume to " + requestedVolume + "%");
        guildManager.updateGuildVolume(message.member.guild.id, volumeSet);
    } else {
        logger.info("Print the volume.");
        guildManager.getGuildVolume(message.member.guild.id).then(function(volume) {
            messenger.printVolume(message, volume);
        }).catch(logger.error);
    }
}

function onHelpMessageReceived(message) {
    messenger.sendHelp(message);
}

function onBirdfeedMessageReceived(message) {
    let user = message.author;
    const guildMember = message.member;

    if (!user) {
        logger.error("This upload message doesn't have a user.");
        return;
    }
    if (!guildMember.guild) {
        logger.error("This upload message doesn't have a guild member with a guild.");
        return;
    }

    const messageBase = "Hello. You requested a sound upload on '" + guildMember.guild.name + "'. ";
    let messageToSend;

    if (birdfeedManager.userHasUploadPermissions(guildMember)) {
        birdfeedManager.createBirdfeedForGuildMember(guildMember).then(function(birdfeed) {
            messageToSend = messageBase + "Here is your birdfeed: " + birdfeed + ". Please copy it, visit http://jacquesbot.io, and use the birdfeeder to authenticate yourself.";
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

function playTargetedSound(message, commandArgs) {
    if (!message.member.voiceChannel || alreadySpeaking(message)) {
        return;
    }
    const soundArg = commandArgs[0];
    soundboard.playTargetedSound(message, soundArg);
}

function cleanUp(message) {
    messenger.deleteMessage(message);
}

function parseCommandArgs(messageContent) {
    const commandArgs = messageContent.split(" ");
    commandArgs.forEach(function(commandArg, i, array) {
        if (commandArg === " " || commandArg === "") {
            array.splice(i, 1);
        }
    });
    return commandArgs;
}

function alreadySpeaking(message) {
    if (!bot || !bot.voiceConnections) {
        return;
    }
    const currentVoiceConnection = bot.voiceConnections.get(message.guild.id);

    if (currentVoiceConnection) {
        message.reply("Already speaking in channel " + currentVoiceConnection.channel.name).then(function(message) {
            message.delete(3500).catch(logger.error);
        });
        return true;
    }

    return false;
}

module.exports.onReady = onReady;
module.exports.onMessage = onMessage;
module.exports.onGuildCreate = onGuildCreate;
module.exports.onGuildDelete = onGuildDelete;
module.exports.setClientInstance = setClientInstance;
module.exports.onLoggedIn = onLoggedIn;