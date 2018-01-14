const Guild = require("../../model/guild").Guild;

const GUILD_PROJECTION = {
    __v: false,
    _id: false,
};

function getAllGuilds() {
    return new Promise((resolve, reject) => {
        Guild.find({}, GUILD_PROJECTION, function (err, guilds) {
            if (err) {
                return reject("Couldn't query for all guilds. Error: " + err);
            } else {
                return resolve(guilds);
            }
        });
    });
}

function getGuildById(discordGuildId) {
    return new Promise((resolve, reject) => {
        Guild.findOne({discord_id: discordGuildId}, GUILD_PROJECTION, function (err, guild) {
            if (err) {
                return reject("Couldn't query for this guild: " + discordGuildId + ". Error: " + err);
            } else {
                return resolve(guild);
            }
        });
    });
}

function deleteGuildsNotInListOfIds(discordGuildIds) {
    return new Promise((resolve, reject) => {
        Guild.remove({
            "discord_id": {
                "$nin": discordGuildIds
            }
        }, function(err, removalResult) {
            if (err) {
                return reject(err);
            } else {
                return resolve(removalResult);
            }
        });
    });
}

function updateVolumeForGuild(volume, discordGuildId) {
    return new Promise((resolve, reject) => {
        Guild.update({discord_id: discordGuildId}, {
            $set: {
                volume: volume
            }
        }, function (err) {
            if (err) {
                return reject("Couldn't update update volume " + volume + " for guild: " + discordGuildId + ". Error: " + err);
            } else {
                return resolve();
            }
        });
    });
}

function insertGuild(discordGuild) {
    return new Promise((resolve, reject) => {
        Guild.create({
            discord_id: discordGuild.id,
            discord_name: discordGuild.name
        }, function(err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

function getGuildsCount() {
    return new Promise((resolve, reject) => {
        Guild.count(function (err, count) {
            if (err) {
                return reject(err);
            } else {
                return resolve(count);
            }
        });
    });
}

module.exports.getAllGuilds = getAllGuilds;
module.exports.getGuildById = getGuildById;
module.exports.getGuildsCount = getGuildsCount;
module.exports.insertGuild = insertGuild;
module.exports.updateVolumeForGuild = updateVolumeForGuild;
module.exports.deleteGuildsNotInListOfIds = deleteGuildsNotInListOfIds;
