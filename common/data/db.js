const mongoose = require('mongoose');
const fs = require('fs');
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const Sound = require('./../model/sound').Sound;
const SoundEvent = require('./../model/sound').SoundEvent;
const Category = require('./../model/category').Category;
const util = require('./../util/utility');
const logger = require('./../util/logger.js');

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect('mongodb://localhost/jacques', function () {
        logger.info('Db connected!');
    });
}

function syncSounds() {
    logger.error("Syncing from Jacques was removed...");
}

function insertSoundEvent(soundName, performedBy, eventCategory) {
    Sound.findOne({
        name: soundName
    }, function (err, sound) {
        if (err) throw err;
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
            if (err) throw err;
        });
    });

}

function soundExists(soundName, soundCategory) {
    var regex = "^" + soundName + "\\..+$";
    var args = {name: new RegExp(regex, "i"), category: soundCategory};

    if (!soundCategory) {
        args = {name: new RegExp(regex, "i")};
    }

    return new Promise((resolve, reject) => {
        //Query for one sound that starts with this soundName, is followed by a period, and any file extension

        Sound.find(args, function (err, sounds) {
            if (err) throw err;
            if (sounds && sounds.length > 0) {
                //Why random? This result will be used to play the requested sound. If there's more than one of this name, just pick one.
                var random = util.getRandomInt(0, sounds.length - 1);
                var randomSound = sounds[random];
                return resolve(randomSound);
            } else {
                return reject("Sound not found in db: " + soundName);
            }
        })
    });
}

function categoryExists(categoryName) {
    return new Promise((resolve, reject) => {
        //The aliases should contain this category name, if not, then they should exactly match
        var queryArgs = {"$or": [{aliases: categoryName}, {name: categoryName}]};
        Category.findOne(queryArgs, function (err, doc) {
            if (err) throw err;
            if (doc) {
                return resolve(doc);
            } else {
                return resolve(null);
            }
        });
    })
}

function getAllSounds() {
    return new Promise((resolve, reject) => {
        var soundsProjection = {
            __v: false,
            _id: false,
            "sound_events._id": false
        };

        Sound.find({}, soundsProjection, function (err, sounds) {
            if (err) throw err;
            if (sounds) {
                return resolve(sounds);
            } else {
                return reject("Couldn't get all sounds.");
            }
        })
            .sort({name: 'asc'});
    });
}

function getAllCategories() {
    return new Promise((resolve, reject) => {
        var categoryProjection = {
            __v: false,
            _id: false,
        };

        Category.find({}, categoryProjection, function (err, categories) {
            if (err) throw err;
            if (categories) {
                return resolve(categories);
            } else {
                return reject("Couldn't get all categories.");
            }
        })
            .sort({name: 'asc'});
    });
}

function getRandomSound(soundCategory) {
    var args = soundCategory ? {category: soundCategory} : {};
    return new Promise((resolve, reject) => {
        Sound.find(args, function (err, sounds) {
            var random = util.getRandomInt(0, (sounds.length - 1));
            if (err) logger.error(err);
            if (sounds) {
                var randomSound = sounds[random];
                logger.info("Got a random sound at index " + random + " out of " + (sounds.length-1) + ", " + randomSound.name);
                return resolve(randomSound);
            } else {
                return reject("Couldn't get random sound.");
            }
        })
    });
}

module.exports.connect = connect;
module.exports.syncSounds = syncSounds;
module.exports.insertSoundEvent = insertSoundEvent;
module.exports.soundExists = soundExists;
module.exports.categoryExists = categoryExists;
module.exports.getRandomSound = getRandomSound;
module.exports.getAllSounds = getAllSounds;
module.exports.getAllCategories = getAllCategories;
