const Db = require("../data/db");
const mongoose = require("mongoose");
const fs = require("fs");
var SOUNDS_DIRECTORY = "./../../sounds/";
const Sound = require("./../model/sound").Sound;
const SoundEvent = require("./../model/sound").SoundEvent;
const Category = require("./../model/category").Category;
const util = require("./../util/utility");
const logger = require("./../util/logger.js");

const readdirp = require("readdirp");
const path = require("path");

connect();

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect("mongodb://localhost/jacques", function() {
        logger.info("Db connected!");
        assignCategoriesFromDirectory();
    });
}

function assignCategoriesFromDirectory() {
    var soundsDirectoryCleansed = path.join(SOUNDS_DIRECTORY);
    var rootPath = path.resolve(soundsDirectoryCleansed);
    var fileSystemSounds = [];

    var stream = readdirp({ root: rootPath });
    /*var directories = fs.readdirSync(rootPath).filter(file => fs.lstatSync(path.join(rootPath, file)).isDirectory());
    for (var directory of directories) {
        logger.info("Found one: " + directory);
    }*/
    stream
        .on("warn", function(err) {
            logger.error("non-fatal error", err);
        })
        .on("error", function(err) {
            logger.error("fatal error", err);
        })
        .on("data", function(entry) {
            fileSystemSounds.push(entry);
        })
        .on("end", function() {
            for (var file of fileSystemSounds) {
                let soundName = file.name;
                let soundDirectory = file.parentDir;
                var matchedSounds = soundsWithName(fileSystemSounds, soundName);
                if (matchedSounds.length > 1) {
                    logger.info("More than one file named " + soundName + "! Arbitrary desired location; leaving it in " + soundDirectory);
                } else {
                    Sound.findOneAndUpdate({name: soundName}, { $set: {category: soundDirectory}}, function(err, updatedSound) {
                        if (updatedSound) {
                            logger.info("Updated sound " + updatedSound.name + " to have category " + updatedSound.category);
                        } else {
                            logger.info("Couldn't update sound " + soundName + " to have category " + soundDirectory);
                        }
                    });
                }
            }
        })
}

function soundsWithName(fileSystemSounds, name) {
    var matchedSounds = [];
    for (sound of fileSystemSounds) {
        if (sound.name === name) {
            matchedSounds.push(sound);
        }
    }
    return matchedSounds;
}