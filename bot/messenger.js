var HELP_STRING = "Jacques is a soundboard bot. To play a sound, type ! followed by the name of the sound. If you don't supply a sound name, it will play a random one. You can also " +
    "stream the audio of a youtube video with !stream.\n\n" +
    "Visit Jacques online at http://jacquesbot.io for a list of sounds, or use !helptext if you really want a text dump.";

function sendHelp(message) {
    message.reply(HELP_STRING);
}

function sendSounds(message, sounds) {
    var helpText = "";

    sounds.sort();
    sounds.forEach(function(sound) {
        helpText += sound.name.split("\.")[0] + ", ";
    });

    helpText = helpText.substring(0, helpText.length - 2);
    var helpTextSegments = helpText.match(/.{1,1500}/g);

    helpTextSegments.forEach(function(helpTextSegment) {
        message.reply(helpTextSegment).catch(console.error);
    })
}

function deleteMessage(message) {
    if (message.channel.name !== "commands") {
        message.delete(2000).catch(logger.error);
    }
}

module.exports.sendHelp = sendHelp;
module.exports.sendSounds = sendSounds;
module.exports.deleteMessage = deleteMessage;
