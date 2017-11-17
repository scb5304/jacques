var Db = require("./../common/data/db");
var logger = require("./../common/util/logger.js");
var fsReader = require("./../common/util/fileSystemReader.js");

function insertSoundEvent(sound, memberName, eventType) {
    try {
        Db.insertSoundEvent(sound.name, memberName, eventType);
    } catch (err) {
        logger.error(err);
    }
}

function playRandomSound(message) {
    Db.getRandomSound()
        .then(function(sound) {
            playSound(sound, message.member.voiceChannel);
            insertSoundEvent(sound, message.member.displayName, "playRandom");
        })
        .catch(logger.error);
}

function playTargetedSound(message, soundName) {
    logger.info("Play targeted sound: sound " + soundName);
    Db.getSoundFromName(soundName)
        .then(function(sound) {
            if (sound) {
                playSound(sound, message.member.voiceChannel);
                insertSoundEvent(sound, message.member.displayName, "playTargeted");
            } else {
                logger.info("Sound " + soundName + " does not exist.");
            }
        })
        .catch(logger.error);
}

function playSound(sound, voiceChannel) {
    var soundPath = fsReader.getSoundPathFromSound(sound) + ".mp3";

    if (!fsReader.soundExistsInFileSystem(soundPath)) {
        logger.error("Couldn't find sound at " + soundPath);
        return;
    }

    voiceChannel.join()
        .then(function(connection) {
            const dispatcher = connection.playFile(soundPath);
            dispatcher.once("end", function() {
                logger.info("Leaving after playing sound.");
                connection.disconnect();
            });
        })
        .catch(logger.error);
}

module.exports.playTargetedSound = playTargetedSound;
module.exports.playRandomSound = playRandomSound;
module.exports.playSound = playSound;