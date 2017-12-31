const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const Sound = require("./../model/sound").Sound;
const SoundEvent = require("./../model/sound").SoundEvent;
const User = require("./../model/user").User;
const Guild = require("./../model/Guild").Guild;
const util = require("./../util/utility");
const logger = require("./../util/logger.js");
const SOUNDS_PROJECTION = {
    __v: false,
    _id: false,
    "sound_events._id": false
};

const GUILD_PROJECTION = {
    __v: false,
    _id: false,
};

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect("mongodb://localhost/jacques", function () {
        logger.info("Db connected!");
    });
}

function insertSoundForGuildByUser(soundName, user) {
    return new Promise((resolve, reject) => {
        var newSound = Sound({
            name: soundName,
            add_date: new Date(),
            added_by: user.discord_username ? user.discord_username : "Server",
            discord_guild: user.discord_last_guild_id
        });
        newSound.save(function(err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

function insertSoundEvent(soundName, guildId, performedBy, eventCategory) {
    Sound.findOne({
        name: soundName,
        discord_guild: guildId
    }, function (err, sound) {
        if (err) {
            logger.error(err);
            return;
        }

        if (sound === null) {
            logger.info("Sound was null for " + soundName + ", " + performedBy + ", " + eventCategory);
            return;
        }
        var soundEvent = SoundEvent({
            category: eventCategory,
            date: new Date(),
            performed_by: performedBy
        });
        sound.sound_events.push(soundEvent);
        sound.save(function (err, doc, numRowsAffected) {
            if (err) {
                logger.error(err);
            }
        });
    });
}

function deleteSoundWithDiscordGuildIdAndName(discordGuildId, soundName) {
    return new Promise((resolve, reject) => {
        Sound.remove({name: soundName, discord_guild: discordGuildId}, function (err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

function getAllSounds() {
    return new Promise((resolve, reject) => {
        Sound.find({}, SOUNDS_PROJECTION, function (err, sounds) {
            if (err || !sounds) {
                return reject("Couldn't query for all sounds, error: " + err);
            } else {
                return resolve(sounds);
            }
        }).sort({name: "asc"});
    });
}

function getSoundByDiscordGuildIdAndName(discordGuildId, soundName) {
    return new Promise((resolve, reject) => {
        Sound.findOne({discord_guild: discordGuildId, name: soundName}, SOUNDS_PROJECTION, function (err, sound) {
            if (err) {
                return reject("Couldn't query for sound with name " + soundName + " and guild " + discordGuildId + ", Error: " + err);
            } else {
                return resolve(sound);
            }
        }).sort({name: "asc"});
    });
}

function deleteSoundByDiscordGuildIdAndName(discordGuildId, soundName) {
    return new Promise((resolve, reject) => {
        Sound.findOneAndRemove({discord_guild: discordGuildId, name: soundName}, function (err, sound) {
            if (err) {
                return reject("Couldn't delete sound with name " + soundName + " and guild " + discordGuildId + ", Error: " + err);
            } else {
                return resolve(sound);
            }
        });
    });
}

function getSoundsByDiscordGuildId(discordGuildId) {
    return new Promise((resolve, reject) => {
        Sound.find({discord_guild: discordGuildId}, SOUNDS_PROJECTION, function (err, sounds) {
            if (err || !sounds) {
                return reject("Couldn't query for all sounds in guild " + discordGuildId + ". Error: " + err);
            } else {
                return resolve(sounds);
            }
        }).sort({name: "asc"});
    });
}

function getSoundsByName(soundName) {
    return new Promise((resolve, reject) => {
        Sound.find({name: soundName}, SOUNDS_PROJECTION, function (err, sounds) {
            if (err || !sounds) {
                return reject("Couldn't query for all sounds with name " + soundName + ", Error: " + err);
            } else {
                return resolve(sounds);
            }
        }).sort({name: "asc"});
    });
}

function getRandomSoundInDiscordGuild(discordGuildId) {
    return new Promise((resolve, reject) => {
        Sound.find({discord_guild: discordGuildId}, SOUNDS_PROJECTION, function (err, sounds) {
            var random = util.getRandomInt(0, (sounds.length - 1));
            if (err || !sounds) {
                return reject("Couldn't get random sound. Error: " + err);
            } else {
                var randomSound = sounds[random];
                return resolve(randomSound);
            }
        })
    });
}

function getUserFromDiscordId(discordId) {
    return new Promise((resolve, reject) => {
        User.findOne({discord_id: discordId}, function (err, user) {
            if (err || !user) {
                return reject("Couldn't query for this user: " + discordId + ". Error: " + err);
            } else {
                return user;
            }
        })
    });
}

function getUserFromBirdfeed(birdfeed) {
    return new Promise((resolve, reject) => {
        User.findOne({birdfeed_token: birdfeed}, function (err, user) {
            if (err) {
                return reject("Couldn't find user with birdfeed: " + birdfeed + ". Error: " + err);
            } else {
                return resolve(user);
            }
        })
    });
}

function upsertUserWithDiscordDataAndToken(guildMember, token) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({discord_id: guildMember.id}, {
            $set: {
                discord_username: guildMember.user.username,
                discord_last_guild_id: guildMember.guild.id,
                birdfeed_token: token,
                birdfeed_date_time: new Date(),
            }
        }, {
            upsert: true, new: true
        }, function (err, user) {
            if (err || !user) {
                return reject("Couldn't update find/update user: " + guildMember.user.username + ". Error: " + err);
            } else {
                return resolve();
            }
        })
    });
}

function getAllGuilds() {
    return new Promise((resolve, reject) => {
        Guild.find({}, GUILD_PROJECTION, function (err, guilds) {
            if (err) {
                return reject("Couldn't query for all guilds. Error: " + err);
            } else {
                return resolve(guilds);
            }
        })
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
        })
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
        })
    })
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
        })
    });
}

function insertGuild(discordGuild) {
    return new Promise((resolve, reject) => {
        var newGuild = new Guild({
            discord_id: discordGuild.id,
            discord_name: discordGuild.name
        });
        newGuild.save(function(err) {
            if (err) {
                logger.error(err);
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

function getSoundsCount() {
    return new Promise((resolve, reject) => {
        Sound.count(function (err, count) {
            if (err) {
                return reject(err);
            } else {
                return resolve(count);
            }
        });
    });
}

//https://stackoverflow.com/a/35814633/4672234
//https://stackoverflow.com/a/31656321/4672234
function getSoundEventsCount() {
    return new Promise((resolve, reject) => {
        var pipeline = [{
            "$project": {
                "sound_events": {
                    "$size": "$sound_events"
                }
            }
        }, {
            "$group": {
                "_id": null,
                "count": {"$sum": "$sound_events"}
            }
        }];
        Sound.aggregate(pipeline, function (err, result) {
            if (err) {
                return reject(err);
            } else {
                logger.info(result);
                return resolve(result[0].count);
            }
        });
    });
}

module.exports.connect = connect;
module.exports.insertSoundForGuildByUser = insertSoundForGuildByUser;
module.exports.insertSoundEvent = insertSoundEvent;

module.exports.getAllSounds = getAllSounds;
module.exports.getRandomSoundInDiscordGuild = getRandomSoundInDiscordGuild;
module.exports.getSoundsByDiscordGuildId = getSoundsByDiscordGuildId;
module.exports.getSoundByDiscordGuildIdAndName = getSoundByDiscordGuildIdAndName;
module.exports.deleteSoundByDiscordGuildIdAndName = deleteSoundByDiscordGuildIdAndName;
module.exports.getSoundsByName = getSoundsByName;

module.exports.insertGuild = insertGuild;
module.exports.getGuildById = getGuildById;
module.exports.getAllGuilds = getAllGuilds;
module.exports.deleteGuildsNotInListOfIds = deleteGuildsNotInListOfIds;
module.exports.updateVolumeForGuild = updateVolumeForGuild;

module.exports.deleteSoundWithGuildIdAndName = deleteSoundWithDiscordGuildIdAndName;
module.exports.getUserFromDiscordId = getUserFromDiscordId;
module.exports.getUserFromBirdfeed = getUserFromBirdfeed;
module.exports.upsertUserWithDiscordDataAndToken = upsertUserWithDiscordDataAndToken;

module.exports.getGuildsCount = getGuildsCount;
module.exports.getSoundsCount = getSoundsCount;
module.exports.getSoundEventsCount = getSoundEventsCount;