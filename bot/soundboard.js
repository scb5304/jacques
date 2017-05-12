var Db = require('./../common/data/db');
var config = require('./../config.json');
var logger = require('./../common/util/logger.js');

function playRandomSound(message) {
    Db.getRandomSoundName()
        .then(function(fullSoundName) {
            playSound(fullSoundName, message.member, message.member.voiceChannel, "playRandom");
        })
        .catch(logger.error);
}

function playTargetedSound(message, soundName) {
    Db.soundExists(soundName)
        .then(function(fullSoundName) {
            playSound(fullSoundName, message.member, message.member.voiceChannel, "playTargeted");
        })
        .catch(logger.error);
}

function playSound(soundName, member, voiceChannel, eventType) {
    logger.info("Attempting to play sound " + soundName + " in " + voiceChannel.name);
    var path = config.soundsDirectory + soundName;
    logger.info("Sound path: " + path);
    voiceChannel.join().then(function(connection) {
            const dispatcher = connection.playFile(path);
            Db.insertSoundEvent(soundName, member.displayName, eventType);
            dispatcher.once('end', function() {
                logger.info("Leaving after playing sound.");
                connection.disconnect();
            });
        })
        .catch(logger.error);
}

module.exports.playRandomSound = playRandomSound;
module.exports.playTargetedSound = playTargetedSound;
