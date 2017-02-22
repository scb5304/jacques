const mongoose = require('mongoose');
const config = require('./config.json');
const fs = require('fs');
const SOUNDS_DIRECTORY = config.soundsDirectory;
const Sound = require('./model/sound').Sound;
const SoundEvent = require('./model/sound').SoundEvent;
const util = require('./utility');
const logger = require('./logger.js');

logger.info("Getting db ready...");
mongoose.connect('mongodb://localhost/jacques', function() {
    logger.info('Db connected!');
});

function syncSounds() {
    logger.info("Syncing...");
    //Get sounds from database
    Sound.find({}, function(err, sounds) {
        //Get sounds file file system
        fs.readdir(SOUNDS_DIRECTORY, function(err, files) {
            //Loop through sounds in database
            for (var sound of sounds) {

                if (files.indexOf(sound.name) == -1) {
                    logger.info("Removing " + sound.name + " from the database! It's no longer in the file system.");
                    Sound.remove({
                        name: sound.name
                    }, function(err) {
                        if (err) throw err;
                    });
                }
            }
            //Loop through sounds in file system
            for (var file of files) {
                var isDirectory = fs.lstatSync(SOUNDS_DIRECTORY + "/" + file).isDirectory();
                if (isDirectory) {
                    //logger.info("Not considering creating a sound for directory " + file);
                    continue;
                }

                if (!soundsArrayContainsName(sounds, file)) {
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
        });
    });
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
            if (err) logger.info(err);
            //logger.info("Added " + numRowsAffected + " rows: " + doc);
        });
    });

}

function soundExists(soundName) {
    return new Promise((resolve, reject) => {
        //Query for one sound that starts with this soundName, is followed by a period, and any file extension
        var regex = "^" + soundName + "\\..+$";
        Sound.findOne({name: new RegExp(regex, "i")}, function (err, doc) {
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
        Sound.find({}, function(err, sounds) {
            if (err) throw err;
            if (sounds) {
                return resolve(sounds); 
            } else {
                return reject("Couldn't get all sounds.");
            }
        }).sort({name: 'asc'});
    });
}

function getRandomSoundName() {
    return new Promise((resolve, reject) => {
        Sound.count(function(err, count) {
            var random = Math.floor(Math.random() * count);
            Sound.findOne(function (err, result) {
                if (result) {
                    return resolve(result.name);
                } else {
                    return reject("Couldn't get random sound.");
                }
                
            }).skip(random);
        });
    });
}

function getRandomSoundNameWithTags(tags) {
    logger.info("tags: " + tags);
    return new Promise((resolve, reject) => {

        Sound.find({tags: {$all: tags}}, function(err, sounds) {
            if (err) throw err;

            if (!sounds) {
                return reject("Couldn't find sound with those tags.");
            }
            logger.info(sounds);
            var randIndex = util.getRandomInt(0, sounds.length-1);
            logger.info(randIndex + " is the index.");
            var randomSound = sounds[randIndex];

            if (randomSound) {
                return resolve(randomSound.name);
            } else {
                return reject("Got sounds with tags: " + tags + " but failed to play a random one.");
            }
        });

    })
}

function soundsArrayContainsName(sounds, name) {
    for (var sound of sounds) {
        if (sound.name === name) {
            //logger.info("True!!");
            return true;
        }
    }
    return false;
}

module.exports.syncSounds = syncSounds;
module.exports.insertSoundEvent = insertSoundEvent;
module.exports.soundExists = soundExists;
module.exports.getRandomSoundName = getRandomSoundName;
module.exports.getRandomSoundNameWithTags = getRandomSoundNameWithTags;
module.exports.getAllSounds = getAllSounds;