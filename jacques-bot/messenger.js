var logger = require("./../common/util/logger.js");

var HELP_STRING = "Jacques is a soundboard bot. To play a sound, type ! followed by the name of the sound. If you don't supply a sound name, it will play a random one. You can also " +
    "stream the audio of a youtube video with !stream.\n\n" +
    "Visit Jacques online at http://jacquesbot.io for a list of sounds and additional help.";

function sendHelp(message) {
    message.reply(HELP_STRING);
}

function sendDirectMessage(user, message) {
    if (user !== null) {
        var dmChannel = user.dmChannel;
        if (dmChannel) {
            dmChannel.send(message);
        } else {
            user.createDM().then(function(dmChannel) {
                dmChannel.send(message);
            }).catch(logger.error);
        }
    }
}

function deleteMessage(message) {
    if (message.channel.name !== "commands") {
        message.delete(2000).catch(logger.error);
    }
}

function printVolume(message, volume) {
    message.reply("Volume is currently at " + (volume * 100) + "%");
}

module.exports.sendHelp = sendHelp;
module.exports.sendDirectMessage = sendDirectMessage;
module.exports.deleteMessage = deleteMessage;
module.exports.printVolume = printVolume;
