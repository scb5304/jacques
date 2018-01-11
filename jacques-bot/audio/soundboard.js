const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");
const logger = require("../../jacques-common/util/logger.js");
const fsReader = require("../../jacques-common/util/file-system-reader.js");

function insertSoundEvent(sound, guildId, memberName, eventType) {
    try {
        soundsRepository.insertSoundEvent(sound.name, guildId, memberName, eventType);
    } catch (err) {
        logger.error(err);
    }
}

function playRandomSound(message) {
    soundsRepository.getRandomSoundInDiscordGuild(message.member.guild.id)
        .then(function(sound) {
            if (sound) {
                playSound(sound, message.member.voiceChannel);
                insertSoundEvent(sound, message.member.guild.id, message.member.displayName, "playRandom");
            } else {
                logger.error("Couldn't get a random sound, there are likely no sounds in the database for this guild.");
            }
        })
        .catch(logger.error);
}

function playTargetedSound(message, soundName) {
    logger.info("Play targeted sound: sound " + soundName);
    soundsRepository.getSoundByDiscordGuildIdAndName(message.member.guild.id, soundName)
        .then(function(sound) {
            if (sound) {
                playSound(sound, message.member.voiceChannel);
                insertSoundEvent(sound, message.member.guild.id, message.member.displayName, "playTargeted");
            } else {
                logger.info("Sound " + soundName + " does not exist.");
            }
        })
        .catch(logger.error);
}

function playSound(sound, voiceChannel) {
    const soundPath = fsReader.getSoundPathFromSound(sound) + ".mp3";

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