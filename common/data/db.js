const mongoose = require('mongoose');
const fs = require('fs');
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const Sound = require('./../model/sound').Sound;
const SoundEvent = require('./../model/sound').SoundEvent;
const util = require('./../util/utility');
const logger = require('./../util/logger.js');

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect('mongodb://localhost/jacques', function() {
        logger.info('Db connected!');
    });
}

function syncSounds() {
    logger.info("Syncing...");
    //Get sounds from database
    Sound.find({}, function(err, sounds) {
        //Get sounds from file system
        fs.readdir(SOUNDS_DIRECTORY, function(err, files) {
            //If there are any sounds who have data stored in the database but do not exist in the file system, remove them
            removeSoundsInDatabaseNotInFileSystem(files, sounds);

            //If there are any sounds who do not have data stored in the database but do exist in the file system, add them
            addSoundsToDatabaseInFileSystem(files, sounds);
        });
    });
}

function removeSoundsInDatabaseNotInFileSystem(files, sounds) {
    for (var sound of sounds) {
        var notInFileSystem = files.indexOf(sound.name) == -1;
        if (notInFileSystem) {
            logger.info("Removing " + sound.name + " from the database! It's no longer in the file system.");
            Sound.remove({
                name: sound.name
            }, function(err) {
                if (err) throw err;
            });
        }
    }
}

function addSoundsToDatabaseInFileSystem(files, sounds) {
    for (var file of files) {
        var isDirectory = fs.lstatSync(SOUNDS_DIRECTORY + "/" + file).isDirectory();
        if (isDirectory) {
            continue;
        }

        var inFileSystemNotDatabase = !soundsArrayContainsName(sounds, file);
        if (inFileSystemNotDatabase) {
            logger.info("Adding " + file + " to the database! It's in the file system but not the database.");

            var newSound = Sound({
                name: file,
                add_date: new Date(),
                added_by: "Server"
            });
            newSound.save(function(err) {
                if (err) throw err;
            });

        }
    }
}

function insertSoundEvent(soundName, performedBy, soundCategory) {
    Sound.findOne({
        name: soundName
    }, function(err, sound) {
        if (err) throw err;
        if (sound == null) {
            logger.info("Sound was null for " + soundName + ", " + performedBy + ", " + soundCategory);
            return;
        }
        var soundEvent = SoundEvent({
            category: soundCategory,
            date: new Date(),
            performed_by: performedBy
        });
        sound.sound_events.push(soundEvent);
        sound.save(function(err, doc, numRowsAffected) {
            if (err) throw err;
        });
    });

}

function soundExists(soundName) {
    return new Promise((resolve, reject) => {
        //Query for one sound that starts with this soundName, is followed by a period, and any file extension
        var regex = "^" + soundName + "\\..+$";
        Sound.findOne({ name: new RegExp(regex, "i") }, function(err, doc) {
            if (err) throw err;
            if (doc) {
                return resolve(doc.name);
            } else {
                return reject("Sound not found in db: " + soundName);
            }
        })
    })
}

function getAllSounds() {
    return new Promise((resolve, reject) => {
    	var soundsProjection = { 
		    __v: false,
		    _id: false,
		    "sound_events._id": false
		};

        Sound.find({}, soundsProjection, function(err, sounds) {
            if (err) throw err;
            if (sounds) {
                return resolve(sounds);
            } else {
                return reject("Couldn't get all sounds.");
            }
        })
        .sort({ name: 'asc' });
    });
}

function getRandomSoundName() {
    return new Promise((resolve, reject) => {
        Sound.count(function(err, count) {
            var random = Math.floor(Math.random() * count);
            Sound.findOne(function(err, result) {
                if (result) {
                    return resolve(result.name);
                } else {
                    return reject("Couldn't get random sound.");
                }

            }).skip(random);
        });
    });
}

function soundsArrayContainsName(sounds, name) {
    for (var sound of sounds) {
        if (sound.name === name) {
            return true;
        }
    }
    return false;
}

module.exports.connect = connect;
module.exports.syncSounds = syncSounds;
module.exports.insertSoundEvent = insertSoundEvent;
module.exports.soundExists = soundExists;
module.exports.getRandomSoundName = getRandomSoundName;
module.exports.getAllSounds = getAllSounds;
