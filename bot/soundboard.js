var Db = require("./../common/data/db");
var logger = require("./../common/util/logger.js");
var fsReader = require("./fileSystemReader.js");

function playParameterizedSound(message, firstCommandArg, secondCommandArg) {
    var soundName;
    var soundCategoryName;

    Db.categoryExists(firstCommandArg)
        .then(function(category) {
            if (category != null) {
                soundCategoryName = category.name;
                logger.info("Category exists: " + category.name);
                if (secondCommandArg != null) {
                    soundName = secondCommandArg;
                    logger.info("Play targeted category sound: " + soundName);
                    playTargetedSound(message, soundName, soundCategoryName);
                } else {
                    logger.info("Play random category sound: " + soundCategoryName);
                    playRandomSound(message, soundCategoryName);
                }
            } else {
                soundCategoryName = firstCommandArg;
                logger.info("Category does not exist: " + soundCategoryName);
                soundName = firstCommandArg;
                playTargetedSound(message, soundName);
            }
        })
        .catch(logger.error);
}

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
    var soundPath = fsReader.getSoundPathFromSound(sound);

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

function insertSoundEvent(sound, memberName, eventType) {
    try {
        Db.insertSoundEvent(sound.name, memberName, eventType);
    } catch (err) {
        logger.error(err);
    }
}

module.exports.playParameterizedSound = playParameterizedSound;
module.exports.playRandomSound = playRandomSound;
module.exports.playSound = playSound;