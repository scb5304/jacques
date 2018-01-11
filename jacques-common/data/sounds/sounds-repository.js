const Sound = require("../../model/sound").Sound;
const SoundEvent = require("../../model/sound").SoundEvent;
const logger = require("../../util/logger");
const util = require("../../util/utility");

const SOUNDS_PROJECTION = {
    __v: false,
    _id: false,
    "sound_events._id": false
};

function insertSoundForGuildByUser(soundName, user) {
    return new Promise((resolve, reject) => {
        Sound.create({
            name: soundName,
            add_date: new Date(),
            added_by: user.discord_username ? user.discord_username : "Server",
            discord_guild: user.discord_last_guild_id
        }, function(err, sound) {
            if (err) {
                return reject(err);
            } else {
                return resolve(sound);
            }
        });
    });
}

function insertSoundEvent(soundName, guildId, performedBy, eventCategory) {
    return new Promise((resolve, reject) => {
        Sound.findOne({
            name: soundName,
            discord_guild: guildId
        }, function (err, sound) {
            if (err || !sound) {
                return reject(err ? err : "Sound was null when trying to add a sound event.");
            } else {
                let soundEvent = SoundEvent({
                    category: eventCategory,
                    date: new Date(),
                    performed_by: performedBy
                });
                sound.sound_events.push(soundEvent);
                sound.save(function (err, sound) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(sound);
                    }
                });
            }
        });
    });
}

function getAllSounds() {
    return new Promise((resolve, reject) => {
        Sound.find({}, SOUNDS_PROJECTION, function (err, sounds) {
            if (err) {
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
            if (err) {
                return reject("Couldn't query for all sounds in guild " + discordGuildId + ". Error: " + err);
            } else {
                return resolve(sounds);
            }
        }).sort({name: "asc"});
    });
}

function getRandomSoundInDiscordGuild(discordGuildId) {
    return new Promise((resolve, reject) => {
        Sound.find({discord_guild: discordGuildId}, SOUNDS_PROJECTION, function (err, sounds) {
            if (err) {
                return reject("Couldn't get random sound. Error: " + err);
            } else {
                var random = util.getRandomInt(0, (sounds.length - 1));
                var randomSound = sounds ? sounds[random] : undefined;
                return resolve(randomSound);
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
                return resolve(result[0].count);
            }
        });
    });
}


module.exports.getAllSounds = getAllSounds;
module.exports.getSoundsByDiscordGuildId = getSoundsByDiscordGuildId;
module.exports.getSoundByDiscordGuildIdAndName = getSoundByDiscordGuildIdAndName;
module.exports.getRandomSoundInDiscordGuild = getRandomSoundInDiscordGuild;

module.exports.getSoundsCount = getSoundsCount;
module.exports.getSoundEventsCount = getSoundEventsCount;

module.exports.insertSoundForGuildByUser = insertSoundForGuildByUser;
module.exports.insertSoundEvent = insertSoundEvent;

module.exports.deleteSoundByDiscordGuildIdAndName = deleteSoundByDiscordGuildIdAndName;
