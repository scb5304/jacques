var Db = require('./../common/data/db');
var logger = require('./../common/util/logger.js');
const fs = require('fs');
const path = require('path');
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;

function playRandomSound(message, categoryName) {
    Db.getRandomSound(categoryName)
        .then(function(sound) {
            playSound(sound, message.member.voiceChannel);
            if (categoryName) {
                insertSoundEvent(sound, message.member.displayName, "playCategoryRandom");
            } else {
                insertSoundEvent(sound, message.member.displayName, "playRandom");
            }
        })
        .catch(logger.error);
}

function playTargetedSound(message, soundName, categoryName) {
    logger.info("Play targeted sound: sound " + soundName + ", category " + categoryName);
    Db.soundExists(soundName, categoryName)
        .then(function(sound) {
            if (sound) {
                console.log("I found a sound with name " + sound.name + " and category " + sound.category);
                playSound(sound, message.member.voiceChannel);
                if (categoryName) {
                    insertSoundEvent(sound, message.member.displayName, "playCategoryTargeted");
                } else {
                    insertSoundEvent(sound, message.member.displayName, "playTargeted");
                }
            } else {
                logger.info("Sound " + soundName + " does not exist with category " + categoryName);
            }

        })
        .catch(logger.error);
}

function playSound(sound, voiceChannel) {
    var soundsDirectoryCleansed = path.join(SOUNDS_DIRECTORY);
    var rootPath = path.resolve(soundsDirectoryCleansed);
    var soundPath = path.join(rootPath, sound.category, sound.name);

    if (!fs.existsSync(soundPath)) {
        logger.error("Couldn't find sound at " + soundPath);
        return;
    }

    voiceChannel.join()
        .then(function(connection) {
            const dispatcher = connection.playFile(soundPath);
            dispatcher.once('end', function() {
                logger.info("Leaving after playing sound.");
                connection.disconnect();
            });
        })
        .catch(logger.error);
}

function insertSoundEvent(sound, memberName, eventType) {
    try {
        Db.insertSoundEvent(sound.name, memberName, eventType);
    } catch (err) {
        logger.error(err);
    }
}

module.exports.playRandomSound = playRandomSound;
module.exports.playTargetedSound = playTargetedSound;