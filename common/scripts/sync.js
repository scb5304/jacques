const Db = require('../data/db');
const mongoose = require('mongoose');
const fs = require('fs');
var SOUNDS_DIRECTORY = "./../../sounds/";
const Sound = require('./../model/sound').Sound;
const SoundEvent = require('./../model/sound').SoundEvent;
const Category = require('./../model/category').Category;
const util = require('./../util/utility');
const logger = require('./../util/logger.js');

const readdirp = require('readdirp');
const path = require('path');

connect();

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect('mongodb://localhost/jacques', function() {
        logger.info('Db connected!');
        beginSync();
    });
}

function beginSync() {
    Db.getAllCategories().then(function(categories) {
        createDirectoriesForCategories(categories);

        Db.getAllSounds().then(function(sounds) {
            performSync(sounds, categories);
        });
    });
}

function performSync(sounds, categories) {
    var soundsDirectoryCleansed = path.join(SOUNDS_DIRECTORY);
    var rootPath = path.resolve(soundsDirectoryCleansed);

    logger.info("Beginning read directory stream...");
    var stream = readdirp({ root: rootPath });
    var fileSystemSoundNames = [];

    stream
        .on('warn', function(err) {
            logger.error('non-fatal error', err);
        })
        .on('error', function(err) {
            logger.error('fatal error', err);
        })
        .on('data', function(entry) {
            fileSystemSoundNames.push(entry.name);
            var soundName = entry.name;
            var soundCategoryInFileSystem = entry.parentDir;
            var soundsWithName = soundsInDatabaseWithName(sounds, soundName);

            if (soundsWithName.length == 0) {
                logger.info("Adding " + soundName + " to the database! It's in the file system but not the database.");
                var newSound = Sound({
                    name: soundName,
                    add_date: new Date(),
                    added_by: "Server",
                    category: soundCategoryInFileSystem
                });
                newSound.save(function(err) {
                    if (err) throw err;
                });
            } else if (soundsWithName.length == 1) {
                var soundWithName = soundsWithName[0];
                var soundCategory = soundWithName.category;
                var oldSoundPath = path.join(entry.fullPath);
                //By default, it will be in the 'default' category directory
                var newSoundPath = path.join(rootPath, "default", soundName);
                for (category of categories) {
                    if (soundCategory === category.name) {
                        newSoundPath = path.join(rootPath, category.name, soundName);
                        break;
                    }
                }
                if (oldSoundPath !== newSoundPath) {
		    logger.info("Expected: " + oldSoundPath + ", found " + newSoundPath);
                    fs.rename(oldSoundPath, newSoundPath, function(err) {
                        logger.info("Wrong category! Moved " + oldSoundPath + " to " + newSoundPath);
                    });
                }
            } else {
                logger.info("More than one sound named " + soundName + "! Arbitrary desired location; leaving it in " + soundCategoryInFileSystem);
            }
        })
        .on('end', function() {
        	//TODO THIS MIGHT NOT BELONG HERE

            //We've moved sounds to the correct categories and added them to the database if they aren't there
            //Now we need to see if there are sounds no longer in the file system but still in the database
            //We can't do that mid-stream; the stream is for reading files. This is a situation where the file we care about is NOT in the file system.
            for (var sound of sounds) {
                var notInFileSystem = fileSystemSoundNames.indexOf(sound.name) == -1;
                if (notInFileSystem) {
                    logger.info("Removing " + sound.name + " from the database! It's no longer in the file system.");
                    Sound.remove({
                        name: sound.name
                    }, function(err) {
                        if (err) throw err;
                    });
                }
            }
        })
}

function createDirectoriesForCategories(categories) {
    for (category of categories) {
        var dirPath = SOUNDS_DIRECTORY + category.name;
        if (!fs.existsSync(dirPath)) {
            console.log("making directory at " + dirPath)
            fs.mkdirSync(dirPath);
        }
    }
}

function soundsInDatabaseWithName(sounds, name) {
    var matchedSounds = [];
    for (sound of sounds) {
        if (sound.name === name) {
            matchedSounds.push(sound);
        }
    }
    return matchedSounds;
}

function soundsWithCategory(sounds, category) {
    var matchedSounds = [];
    for (sound of sounds) {
        if (sound.category === category) {
            matchedSounds.push(sound);
        }
    }
    return matchedSounds;
}
