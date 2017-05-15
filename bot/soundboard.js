var Db = require('./../common/data/db');
var logger = require('./../common/util/logger.js');

var SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;

function playRandomSound(message) {
    Db.getRandomSoundName()
        .then(function(fullSoundName) {
            playSound(fullSoundName, message.member.voiceChannel);
            insertSoundEvent(fullSoundName, message.member.displayName, "playRandom");
        })
        .catch(logger.error);
}

function playTargetedSound(message, soundName) {
    Db.soundExists(soundName)
        .then(function(fullSoundName) {
            playSound(fullSoundName, message.member.voiceChannel);
            insertSoundEvent(fullSoundName, message.member.displayName, "playTargeted");
        })
        .catch(logger.error);
}

function playSound(soundName, voiceChannel) {
    logger.info("Attempting to play sound " + soundName + " in " + voiceChannel.name);
    var path = SOUNDS_DIRECTORY + soundName;
    voiceChannel.join()
        .then(function(connection) {
            const dispatcher = connection.playFile(path);
            dispatcher.once('end', function() {
                logger.info("Leaving after playing sound.");
                connection.disconnect();
            });
        })
        .catch(logger.error);
}

function insertSoundEvent(soundName, memberName, eventType) {
    try {
        Db.insertSoundEvent(soundName, memberName, eventType);
    } catch (err) {
        logger.error(err);
    }
}

module.exports.playRandomSound = playRandomSound;
module.exports.playTargetedSound = playTargetedSound;
