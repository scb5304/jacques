const fs = require("fs");
const path = require("path");
const logger = require("../../jacques-common/util/logger");
const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");
const usersRepository = require("../../jacques-common/data/users/users-repository");
const moment = require("moment");
const mkdirp = require("mkdirp");

const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const MP3_META_DATA = "data:audio/mp3;base64,";

const RESERVED_KEYWORDS = [
    "cancel",
    "stop",
    "stream",
    "volume",
    "help",
    "sounds",
    "birdfeed",
    "jacques",
    "queue",
    "last"
];

function getSounds(req, res) {
    //By default, include sound events.
    let includeSoundEvents = true;

    //If they specify they do not want to include sound events, set this flag to false.
    const includeEventsQuery = req.query["includeSoundEvents"];
    if (includeEventsQuery && includeEventsQuery === "false") {
        includeSoundEvents = false;
    }

    soundsRepository.getAllSounds()
        .then(function(sounds) {
            if (sounds && !includeSoundEvents) {
                sounds.forEach(function(sound) {
                    delete sound._doc.sound_events;
                });
            }
            res.json(sounds);
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds due to a database error."});
        });
}

function getSoundsByGuild(req, res) {
    //By default, include sound events.
    let includeSoundEvents = true;

    //If they specify they do not want to include sound events, set this flag to false.
    const includeEventsQuery = req.query["includeSoundEvents"];
    if (includeEventsQuery && includeEventsQuery === "false") {
        includeSoundEvents = false;
    }

    const guild = req.params.guild;
    soundsRepository.getSoundsByDiscordGuildId(guild)
        .then(function(sounds) {
            if (sounds) {
                sounds.forEach(function(sound) {
                    sound._doc["soundEventCount"] = sound.sound_events.length;
                    if (!includeSoundEvents) {
                        delete sound._doc.sound_events;
                    }
                });
            }
            res.json(sounds);
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds for guild " + guild + " due to a database error."});
        });
}

function getSoundByGuildAndName(req, res) {
    const guild = req.params.guild;
    const name = req.params.soundName;

    soundsRepository.getSoundByDiscordGuildIdAndName(guild, name)
        .then(function(sound) {
            if (sound) {
                res.json(sound);
            } else {
                res.status(404).send({error: "Sound not found."});
            }
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sound for guild " + guild + " and name " + name + " due to a database error."});
        });
}

function deleteSound(req, res) {
    //Birdfeed is a request query for this one because client can't send up a DELETE body.
    validateBirdfeedInRequest(req.query.birdfeed, res).then(function(user) {
        const guild = req.params.guild;
        const name = req.params.soundName;

        if (guild !== user.discord_last_guild_id) {
            res.status(403).send({error: "Sorry, your current birdfeed doesn't work on this guild."});
        } else {
            soundsRepository.deleteSoundByDiscordGuildIdAndName(guild, name)
                .then(function() {
                    const soundPath = path.join(SOUNDS_DIRECTORY, guild, name + ".mp3");
                    fs.unlink(soundPath, function(err) {
                        if (err) {
                            logger.error(err);
                            res.status(500).send({error: "Failed to delete file system sound for guild " + guild + " and name " + name + "."});
                        } else {
                            res.status(200).send();
                        }
                    })
                })
                .catch(function(err) {
                    logger.error(err);
                    res.status(500).send({error: "Failed to delete sound for guild " + guild + " and name " + name + " due to a database error."});
                });
        }
    }).catch(logger.error);

}

function postSound(req, res) {
    if (!validateSoundPostRequestHasRequiredData(req, res)) {
        return;
    }

    validateBirdfeedInRequest(req.body.birdfeed, res).then(function(user) {
        if (req.params.guild !== user.discord_last_guild_id) {
            res.status(403).send({error: "Sorry, your current birdfeed doesn't work on this guild."});
        } else {
            validateSoundDataInSoundPostRequest(user.discord_last_guild_id, req.params.soundName, res).then(function() {
                processNewSoundPostRequest(user, req, res);
            }).catch(logger.error);
        }
    }).catch(logger.error);
}

function validateSoundPostRequestHasRequiredData(req, res) {
    //Must have birdfeed.
    let birdfeed = req.body.birdfeed;
    if (!birdfeed) {
        res.status(403).send({error: "Missing birdfeed!"});
        return false;
    }

    //Must have guild ID in request parameter.
    let guildId = req.params.guild;
    if (!guildId) {
        res.status(400).send({error: "Missing guild id!"});
        return false;
    }

    //Must have sound name in request parameter.
    let soundName = req.params.soundName;
    if (!soundName) {
        res.status(400).send({error: "Missing sound name!"});
        return false;
    }

    //Remove MP3 meta data, or handle the file not being the appropriate type.
    let soundData = req.body.soundData;
    if (!soundData || !soundData.includes(MP3_META_DATA)) {
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

function validateBirdfeedInRequest(birdfeed, res) {
    return new Promise((resolve, reject) => {
        usersRepository.getUserFromBirdfeed(birdfeed).then(function(user) {
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
        });
    });
}

function validateSoundDataInSoundPostRequest(guildId, soundName, res) {
    return new Promise((resolve, reject) => {
        if (RESERVED_KEYWORDS.indexOf(soundName.toLowerCase()) !== -1) {
            var err = "Sorry! This sound name is reserved for usage by Jacques.";
            res.status(400).send({error: err});
            return reject(err)
        }

        soundsRepository.getSoundByDiscordGuildIdAndName(guildId, soundName)
            .then(function (sound) {
                if (sound) {
                    const soundExistsError = "Sound with this name already exists on this guild: " + soundName + ".";
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
    const guildId = user.discord_last_guild_id;
    const soundName = req.params.soundName;
    let soundData = req.body.soundData;

    soundsRepository.insertSoundForGuildByUser(soundName, user).then(function() {
        //Create the file name from the sound name parameter and the mp3 extension.
        soundData = soundData.replace(MP3_META_DATA, "");

        //Attempt to save the sound to file system.
        saveSoundToFileSystem(soundName, soundData, user).then(function() {
            res.sendStatus(200);
        }).catch(function(err) {
            logger.error(err);
            res.status(500).send({error: "There was an error storing the sound in the file system."});

            //We couldn't save the sound to the file system. But it's already in the database.
            soundsRepository.deleteSoundWithGuildIdAndName(guildId, soundName)
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
        const soundDirectoryToSaveIn = path.join(SOUNDS_DIRECTORY, user.discord_last_guild_id);
        mkdirp(soundDirectoryToSaveIn, function(err) {
            if (err) {
                return reject(err);
            } else {
                const fileName = path.join(soundDirectoryToSaveIn, soundName + ".mp3");
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

module.exports.getSounds = getSounds;
module.exports.getSoundsByGuild = getSoundsByGuild;

module.exports.getSoundByGuildAndName = getSoundByGuildAndName;
module.exports.postSound = postSound;
module.exports.deleteSound = deleteSound;