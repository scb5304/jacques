const mongoose = require("mongoose");
const fs = require("fs");
const Sound = require("./../model/sound").Sound;
const SoundEvent = require("./../model/sound").SoundEvent;
const Category = require("./../model/category").Category;
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

function getSoundFromNameAndCategory(soundName, soundCategory) {
    var regex = "^" + soundName + "\\..+$";
    var args = {name: new RegExp(regex, "i"), category: soundCategory};

    if (!soundCategory) {
        args = {name: new RegExp(regex, "i")};
    }

    return new Promise((resolve, reject) => {
        //Query for one sound that starts with this soundName, is followed by a period, and any file extension
        Sound.find(args, function (err, sounds) {
            if (err || !sounds || sounds.length <= 0) {
                return reject("Couldn't get sound from db: " + soundName + ". Error: " + err);
            } else {
                 //Why random? This result will be used to play the requested sound. If there's more than one of this name, just pick one.
                var random = util.getRandomInt(0, sounds.length - 1);
                var randomSound = sounds[random];
                return resolve(randomSound);
            }
        });
    });
}

function getCategoryFromName(categoryName) {
    return new Promise((resolve, reject) => {
        //The aliases should contain this category name, if not, then they should exactly match
        var queryArgs = {"$or": [{aliases: categoryName}, {name: categoryName}]};
        Category.findOne(queryArgs, function (err, category) {
            if (err || !category) {
                return reject("Couldn't find this category. Error: " + err);
            } else {
                return resolve(category);
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
            if (err || !sounds) {
                return reject("Couldn't query for all sounds. Error: " + err);
            } else {
                return resolve(sounds);
            }
        }).sort({name: "asc"});
    });
}

function getAllCategories() {
    return new Promise((resolve, reject) => {
        var categoryProjection = {
            __v: false,
            _id: false,
        };

        Category.find({}, categoryProjection, function (err, categories) {
            if (err || !categories) {
                return reject("Couldn't get all categories. Error: " + err);
            } else {
                return resolve(categories);
            } 
        }).sort({name: "asc"});
    });
}

function getRandomSound(soundCategory) {
    var args = soundCategory ? {category: soundCategory} : {};
    return new Promise((resolve, reject) => {
        Sound.find(args, function (err, sounds) {
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

module.exports.connect = connect;
module.exports.insertSoundEvent = insertSoundEvent;
module.exports.getSoundFromNameAndCategory = getSoundFromNameAndCategory;
module.exports.getCategoryFromName = getCategoryFromName;
module.exports.getRandomSound = getRandomSound;
module.exports.getAllSounds = getAllSounds;
module.exports.getAllCategories = getAllCategories;
