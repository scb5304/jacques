const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");
const logger = require("../../jacques-common/util/logger.js");
const fileSystemManager = require("../../jacques-common/util/file-system-manager.js");

function insertSoundEvent(sound, guildId, memberName, eventType) {
    soundsRepository.insertSoundEvent(sound.name, guildId, memberName, eventType).catch(logger.error);
}

function playRandomSound(message) {
    message.member.voiceChannel.join()
            .then(function(connection) {
                
            })
}

function playTargetedSound(message, soundName) {
    logger.info("Play targeted sound: " + soundName);
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
    voiceChannel.join()
            .then(function(connection) {
                const dispatcher = connection.play(soundPath);
                dispatcher.once("end", function() {
                    logger.info("Leaving after playing sound.");
                    connection.disconnect();
                });
            })
}

module.exports.playTargetedSound = playTargetedSound;
module.exports.playRandomSound = playRandomSound;
module.exports.playSound = playSound;