const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");
const logger = require("../../jacques-common/util/logger");

function updateGuildVolume(guildId, volume) {
    guildsRepository.updateVolumeForGuild(volume, guildId).then(function() {
        logger.info("Successfully set volume to " + volume + " in the database for " + guildId);
    }).catch(logger.error);
}

function getGuildVolume(guildId) {
    return new Promise((resolve, reject) => {
        guildsRepository.getGuildById(guildId).then(function(guild) {
            if (guild) {
                return resolve(guild.volume && guild.volume > 0 ? guild.volume : 0.40);
            } else {
                return reject("No guild with ID " + guildId + " to get a volume from.");
            }
        }).catch(function(err) {
            return reject(err);
        });
    });
}

function refreshGuilds(botGuilds) {
    const discordGuildIds = [];

    botGuilds.forEach(function(discordGuild) {
        discordGuildIds.push(discordGuild.id);

        guildsRepository.getGuildById(discordGuild.id).then(function(jacquesGuild) {
            if (!jacquesGuild) {
                guildsRepository.insertGuild(discordGuild).then(function() {
                    logger.info("Jacques has a new guild: " + discordGuild.name);
                }).catch(logger.error);
            }
        }).catch(logger.error);
    });

    guildsRepository.deleteGuildsNotInListOfIds(discordGuildIds).then(function(removalResult) {
        if (removalResult.result.n) {
            logger.info("Removed from " + removalResult.result.n + " guilds.");
        }
    }).catch(logger.error);
}

module.exports.updateGuildVolume = updateGuildVolume;
module.exports.getGuildVolume = getGuildVolume;
module.exports.refreshGuilds = refreshGuilds;