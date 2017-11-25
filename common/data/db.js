const mongoose = require("mongoose");
mongoose.Promise = require('bluebird');
const Sound = require("./../model/sound").Sound;
const SoundEvent = require("./../model/sound").SoundEvent;
const User = require("./../model/user").User;
const util = require("./../util/utility");
const logger = require("./../util/logger.js");

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect("mongodb://localhost/jacques", function () {
        logger.info("Db connected!");
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

function deleteSoundWithName(soundName) {
    return new Promise((resolve, reject) => {
        Sound.remove({name: soundName}, function (err) {
            if (err) {
                logger.error(err);
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

function getAllSounds() {
    return new Promise((resolve, reject) => {
        var soundsProjection = {
            __v: false,
            _id: false,
            "sound_events._id": false
        };

        Sound.find({}, soundsProjection, function (err, sounds) {
            if (err || !sounds) {
                return reject("Couldn't query for all sounds. Error: " + err);
            } else {
                return resolve(sounds);
            }
        }).sort({name: "asc"});
    });
}

function getRandomSound() {
    return new Promise((resolve, reject) => {
        Sound.find({}, function (err, sounds) {
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

function insertOrUpdateDiscordUserWithToken(discordUser, token) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({discord_id: discordUser.id}, {
            $set: {
                discord_username: discordUser.username,
                birdfeed_token: token,
                birdfeed_date_time: new Date(),
            }
        }, {
            upsert: true, returnNewDocument: true
        }, function (err, user) {
            if (err || !user) {
                return reject("Couldn't update find/update user: " + discordUser.username + ". Error: " + err);
            } else {
                return resolve();
            }
        })
    });
}

module.exports.connect = connect;
module.exports.insertSoundEvent = insertSoundEvent;
module.exports.getSoundFromName = getSoundFromName;
module.exports.getRandomSound = getRandomSound;
module.exports.getAllSounds = getAllSounds;
module.exports.deleteSoundWithName = deleteSoundWithName;
module.exports.getUserFromDiscordId = getUserFromDiscordId;
module.exports.insertOrUpdateDiscordUserWithToken = insertOrUpdateDiscordUserWithToken;