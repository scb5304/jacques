const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const Sound = require("./../model/sound").Sound;
const SoundEvent = require("./../model/sound").SoundEvent;
const User = require("./../model/user").User;
const util = require("./../util/utility");
const logger = require("./../util/logger.js");
const SOUNDS_PROJECTION = {
    __v: false,
    _id: false,
    "sound_events._id": false
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

function insertSoundEvent(soundName, performedBy, eventCategory) {
    Sound.findOne({
        name: soundName
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

function getSoundFromName(soundName) {
    return new Promise((resolve, reject) => {
        Sound.findOne({name: soundName}, function (err, sound) {
            if (err) {
                return reject("Couldn't get sound from db: " + soundName + ". Error: " + err);
            } else {
                return resolve(sound);
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

function getRandomSound() {
    return new Promise((resolve, reject) => {
        Sound.find({}, SOUNDS_PROJECTION, function (err, sounds) {
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

module.exports.connect = connect;
module.exports.insertSoundForGuildByUser = insertSoundForGuildByUser;
module.exports.insertSoundEvent = insertSoundEvent;

module.exports.getAllSounds = getAllSounds;
module.exports.getRandomSound = getRandomSound;
module.exports.getSoundsByDiscordGuildId = getSoundsByDiscordGuildId;
module.exports.getSoundByDiscordGuildIdAndName = getSoundByDiscordGuildIdAndName;
module.exports.getSoundsByName = getSoundsByName;

module.exports.deleteSoundWithGuildIdAndName = deleteSoundWithDiscordGuildIdAndName;
module.exports.getUserFromDiscordId = getUserFromDiscordId;
module.exports.getUserFromBirdfeed = getUserFromBirdfeed;
module.exports.upsertUserWithDiscordDataAndToken = upsertUserWithDiscordDataAndToken;