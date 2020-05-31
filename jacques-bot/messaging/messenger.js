const logger = require("../../jacques-common/util/logger.js");

const HELP_STRING = "Jacques is a soundboard bot. To play a sound, type ! followed by the name of the sound. If you don't supply a sound name, it will play a random one. You can also " +
    "stream the audio of a youtube video with !stream.\n\n" +
    "Visit Jacques online at http://jacquesbot.io for a list of sounds, sound upload, and additional help.";

function sendHelp(message) {
    message.reply(HELP_STRING);
}

function sendDirectMessage(user, message) {
    if (user) {
        const dmChannel = user.dmChannel;
        if (dmChannel) {
            dmChannel.send(message);
        } else {
            user.createDM().then(function(dmChannel) {
                dmChannel.send(message);
            }).catch(logger.error);
        }
    } else {
        logger.error("User doesn't exist to send a DM!");
    }
}

function replyToMessage(message, reply) {
    message.reply(reply).then(function(createdMessage) {
        createdMessage.delete({timeout: 3500}).catch(logger.error);
    });
}

function deleteMessage(message) {
    if (!message.channel.name.toUpperCase().includes("commands".toUpperCase())) {
        message.delete({timeout: 2000}).catch(logger.error);
    }
}

function printVolume(message, volume) {
    message.reply("Volume is currently at " + (volume * 100) + "%").then(function(message) {
        message.delete({timeout: 3500}).catch(logger.error);
    });
}

module.exports.sendHelp = sendHelp;
module.exports.sendDirectMessage = sendDirectMessage;
module.exports.replyToMessage = replyToMessage;
module.exports.deleteMessage = deleteMessage;
module.exports.printVolume = printVolume;
