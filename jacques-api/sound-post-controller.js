const Sound = require("../common/model/sound").Sound;
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const logger = require("../common/util/logger");
const Db = require("../common/data/db");
const mkdirp = require('mkdirp');

const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const MP3_META_DATA = "data:audio/mp3;base64,";

function postSound(req, res) {
    if (!validateSoundPostRequestHasRequiredData(req, res)) {
        return;
    }

    validateBirdfeedInSoundPostRequest(req.body.birdfeed, res).then(function(user) {
        validateSoundDataInSoundPostRequest(req.params.sound_name, res).then(function() {
            processNewSoundPostRequest(user, req, res);
        }).catch(logger.error);
    }).catch(logger.error);
}

function validateSoundPostRequestHasRequiredData(req, res) {
    var soundName = req.params.sound_name;
    var soundData = req.body.sound;
    var birdfeed = req.body.birdfeed;

    if (!birdfeed) {
        res.status(403).send({error: "Missing birdfeed!"});
        return false;
    }

    //Must have sound name in request parameter to process a POST request for this resource.
    if (!soundName) {
        res.status(400).send({error: "Missing sound name!"});
        return false;
    }

    //Remove MP3 meta data, or handle the file not being the appropriate type.
    if (!soundData.includes(MP3_META_DATA)) {
        res.status(400).send({error: "Unsupported file type. Jacques only supports MP3 files."});
        return false;
    }

    //Must have sound data to process a POST request for this resource.
    if (!soundData) {
        res.status(400).send({error: "Missing sound data!"});
        return false;
    }

    return true;
}

function validateBirdfeedInSoundPostRequest(birdfeed, res) {
    return new Promise((resolve, reject) => {
        Db.getUserFromBirdfeed(birdfeed).then(function(user) {
            if (!user) {
                res.status(400).send({error: "I don't recognize this birdfeed. If I did give it out, I don't want it anymore."});
                return reject("Couldn't find user with birdfeed: " + birdfeed);
            }
            if (moment(user.birdfeed_date_time).isAfter(moment().subtract(2, "hours"))) {
                return resolve(user);
            } else {
                res.status(403).send({error: "Sorry, this birdfeed is stale. Please request some new birdfeed."});
                return reject("Token expired.");
            }
        }).catch(function(err) {
            res.status(500).send({error: "I choked on your birdfeed. Sorry, try again soon."});
            return reject(err);
        })
    });
}

function validateSoundDataInSoundPostRequest(soundName, res) {
    return new Promise((resolve, reject) => {
        Db.getSoundFromName(soundName)
            .then(function (sound) {
                if (sound) {
                    var soundExistsError = "Sound with this name already exists: " + soundName;
                    res.status(400).send({error: soundExistsError});
                    return reject(soundExistsError);
                } else {
                    return resolve(sound);
                }
            })
            .catch(function (err) {
                res.status(500).send({error: "There was an error processing your sound request."});
                return reject(err);
            });
    });
}

function processNewSoundPostRequest(user, req, res) {
    var soundName = req.params.sound_name;
    var soundData = req.body.sound;

    Db.insertSound(soundName, user).then(function() {
        //Create the file name from the sound name parameter and the mp3 extension.
        soundData = soundData.replace(MP3_META_DATA, "");

        //Attempt to save the sound to file system.
        saveSoundToFileSystem(soundName, soundData, user).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.status(500).send({error: "There was an error storing the sound in the file system."});

            //We couldn't save the sound to the file system. But it's already in the database.
            Db.deleteSoundWithName(soundName)
                .then(function() {
                    logger.info("Deleted database sound due to file system error: " + soundName);
                })
                .catch(function(err) {
                    logger.error("Couldn't delete the sound from the database after file system error: " + soundName);
                    logger.error(err);
                });
        });
    }).catch(function(err) {
        logger.error(err);
        res.status(500).send({error: "There was an error storing the sound in the database."});
    });
}

function saveSoundToFileSystem(soundName, soundFileData, user) {
    return new Promise((resolve, reject) => {
        var soundDirectoryToSaveIn;
        if (user.discord_last_guild_id) {
            soundDirectoryToSaveIn = path.join(SOUNDS_DIRECTORY, user.discord_last_guild_id);
        } else {
            soundDirectoryToSaveIn = path.join(SOUNDS_DIRECTORY);
        }

        mkdirp(soundDirectoryToSaveIn, function(err) {
            if (err) {
                return reject(err);
            } else {
                var fileName = path.join(soundDirectoryToSaveIn, soundName + ".mp3");
                fs.writeFile(fileName, soundFileData, "base64", function(err) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve();
                    }
                });
            }
        });
    });
}

module.exports.postSound = postSound;