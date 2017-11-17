const Sound = require("../common/model/sound").Sound;
const fs = require("fs");
const path = require("path");
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const logger = require("../common/util/logger.js");
const db = require("../common/data/db.js");

const MP3_META_DATA = "data:audio/mp3;base64,";

function getSound(req, res) {
    var soundName = req.params.sound_name;
    db.getSoundFromName(soundName)
        .then(function (sound) {
            if (sound) {
                res.json(sound);
            } else {
                res.status(400).send({error: "Sound doesn't exist in database."});
                logger.error("Sound doesn't exist in database: " + soundName);
            }
        })
        .catch(function (err) {
            res.status(500).send({error: "There was an error retrieving this sound."});
            logger.error(err);
        });
}

function getSounds(req, res) {
    db.getAllSounds()
        .then(function (sounds) {
            res.json(sounds);
        })
        .catch(function (error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds due to a database error."});
        });
}

function postSound(req, res) {
    if (!validateSoundPostRequest(req, res)) {
        return;
    }

    var soundName = req.params.sound_name;
    var soundData = req.body.sound;

    //Does the sound exist in the database already?
    db.getSoundFromName(soundName)
        .then(function (sound) {
            if (sound) {
                //It does.
                res.status(400).send({error: "Sound with this name already exists."});
            } else {
                //It doesn't.
                processNewSoundPostRequest(soundName, soundData, res);
            }
        })
        .catch(function (err) {
            res.status(500).send({error: "There was an error processing your sound request."});
            logger.error(err);
        });
}

function processNewSoundPostRequest(soundName, soundData, res) {
    saveSoundToDatabase(soundName, function (err) {
        if (err) {
            logger.error(err);
            res.status(500).send({error: "There was an error storing the sound in the database."});
        } else {
            //Create the file name from the sound name parameter and the mp3 extension.
            soundData = soundData.replace(MP3_META_DATA, "");
            var soundFileName = path.join(SOUNDS_DIRECTORY, soundName + ".mp3");

            //Attempt to save the sound to file system.
            saveSoundToFileSystem(soundFileName, soundData, function (err) {
                if (err) {
                    logger.error(err);
                    res.status(500).send({error: "There was an error storing the sound in the file system."});

                    //We couldn't save the sound to the file system. But it's already in the database.
                    db.deleteSoundWithName(soundName)
                        .then(function() {
                            logger.info("Deleted database sound due to file system error: " + soundName);
                        })
                        .catch(function(err) {
                            logger.info("Couldn't delete the sound from the database after file system error: " + soundName);
                        });
                } else {
                    res.sendStatus(200);
                }
            });
        }
    });
}

function validateSoundPostRequest(req, res) {
    var soundName = req.params.sound_name;
    var soundData = req.body.sound;

    //Must have sound name in request parameter to process a POST request for this resource.
    if (!soundName) {
        res.status(400).send({error: "Sound name missing from parameters."});
        return false;
    }

    //Must have sound data to process a POST request for this resource.
    if (!soundData) {
        res.status(400).send({error: "Missing sound data!"});
        return false;
    }

    //Remove MP3 meta data, or handle the file not being the appropriate type.
    if (!soundData.includes(MP3_META_DATA)) {
        res.status(400).send({error: "Unsupported file type. Jacques only supports MP3 files."});
        return false;
    }
    return true;
}

function saveSoundToDatabase(soundName, soundSavedCallback) {
    var newSound = Sound({
        name: soundName,
        add_date: new Date(),
        added_by: "Server",
    });
    newSound.save(soundSavedCallback);
}

function saveSoundToFileSystem(soundFileName, soundFileData, soundSavedCallback) {
    fs.writeFile(soundFileName, soundFileData, "base64", soundSavedCallback);
}

module.exports.getSound = getSound;
module.exports.getSounds = getSounds;
module.exports.postSound = postSound;