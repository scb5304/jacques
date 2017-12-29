const fs = require("fs");
const path = require("path");
const logger = require("../common/util/logger");
const Db = require("../common/data/db");
const soundPostController = require("./sound-post-controller");
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;

function getSounds(req, res) {
    //By default, include sound events.
    var includeSoundEvents = true;

    //If they specify they do not want to include sound events, set this flag to false.
    var includeEventsQuery = req.query["includeSoundEvents"];
    if (includeEventsQuery && includeEventsQuery === "false") {
        includeSoundEvents = false;
    }

    Db.getAllSounds(includeSoundEvents)
        .then(function(sounds) {
            res.json(sounds);
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds due to a database error."});
        });
}

function getSoundsByGuild(req, res) {
    //By default, include sound events.
    var includeSoundEvents = true;

    //If they specify they do not want to include sound events, set this flag to false.
    var includeEventsQuery = req.query["includeSoundEvents"];
    if (includeEventsQuery && includeEventsQuery === "false") {
        includeSoundEvents = false;
    }

    var guild = req.params.guild;
    Db.getSoundsByDiscordGuildId(guild, includeSoundEvents)
        .then(function(sounds) {
            res.json(sounds);
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds for guild " + guild + " due to a database error."});
        });
}

function getSoundByGuildAndName(req, res) {
    var guild = req.params.guild;
    var name = req.params.soundName;

    Db.getSoundByDiscordGuildIdAndName(guild, name)
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

function postSound(req, res) {
    soundPostController.postSound(req, res);
}

function deleteSound(req, res) {
    var guild = req.params.guild;
    var name = req.params.soundName;
    Db.deleteSoundByDiscordGuildIdAndName(guild, name)
        .then(function() {
            var soundPath = path.join(SOUNDS_DIRECTORY, guild, name + ".mp3");
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

module.exports.getSounds = getSounds;
module.exports.getSoundsByGuild = getSoundsByGuild;

module.exports.getSoundByGuildAndName = getSoundByGuildAndName;
module.exports.postSound = postSound;
module.exports.deleteSound = deleteSound;