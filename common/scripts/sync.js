const Db = require("../data/db");
const mongoose = require("mongoose");
const fs = require("fs");
var SOUNDS_DIRECTORY = "./../../sounds/";
const Sound = require("./../model/sound").Sound;
const logger = require("./../util/logger.js");

const readdirp = require("readdirp");
const path = require("path");

const ROOT_PATH = path.resolve(path.join(SOUNDS_DIRECTORY));

function beginSync() {
    Db.getAllSounds().then(function(dbSounds) {
        performSync(dbSounds);
    });
}

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect("mongodb://localhost/jacques", function() {
        logger.info("Db connected!");
        beginSync();
    });
}

function onSoundInFileSystemNotInDatabase(soundName) {
    logger.info("Adding " + soundName + " to the database! It's in the file system but not the database.");
    var newSound = Sound({
        name: soundName,
        add_date: new Date(),
        added_by: "Server",
    });
    newSound.save(function(err) {
        if (err) {
            logger.error(err);
        }
    });
}

function onSoundWithNameInFileSystemAlreadyInDatabase(fileEntry, sound) {
    var oldSoundPath = path.join(fileEntry.fullPath);
    var newSoundPath = path.join(ROOT_PATH, sound.name + ".mp3");

    if (oldSoundPath !== newSoundPath) {
        logger.info("Expected: " + oldSoundPath + ", found " + newSoundPath);
        fs.rename(oldSoundPath, newSoundPath, function(err) {
            if (err) {
                logger.error(err);
            } else {
                logger.info("Wrong location! Moved " + oldSoundPath + " to " + newSoundPath);
            }
        });
    }
}

function performSync(dbSounds) {
    logger.info("Beginning read directory stream...");
    var stream = readdirp({ root: ROOT_PATH });
    var fileSystemSoundNames = [];

    stream
        .on("warn", function(err) {
            logger.error("non-fatal error", err);
        })
        .on("error", function(err) {
            logger.error("fatal error", err);
        })
        .on("data", function(entry) {
            fileSystemSoundNames.push(entry.name);
            var soundName = path.parse(entry.name).name;
            var soundsWithName = soundsInDatabaseWithName(dbSounds, soundName);

            if (soundsWithName.length === 0) {
                onSoundInFileSystemNotInDatabase(soundName);
            } else if (soundsWithName.length === 1) {
                var soundWithName = soundsWithName[0];
                onSoundWithNameInFileSystemAlreadyInDatabase(entry, soundWithName);
            } else {
                logger.error("More than one sound named " + soundName + "!");
            }
        })
        .on("end", function() {
            //We've added them sounds to the database if they aren't there.
            //Now we need to see if there are sounds no longer in the file system but still in the database.
            //We can't do that mid-stream; the stream is for reading files. This is a situation where the file we care about is NOT in the file system.
            for (var sound of dbSounds) {
                var notInFileSystem = fileSystemSoundNames.indexOf(sound.name + ".mp3") === -1;
                if (notInFileSystem) {
                    logger.info("Removing " + sound.name + " from the database! It's no longer in the file system.");
                    Sound.remove({
                        name: sound.name
                    }, function(err) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                }
            }
        });
}

function soundsInDatabaseWithName(sounds, name) {
    var matchedSounds = [];
    for (var sound of sounds) {
        if (sound.name === name) {
            matchedSounds.push(sound);
        }
    }
    return matchedSounds;
}

connect();