const logger = require("../common/util/logger");
const Db = require("../common/data/db");
const soundPostController = require("./sound-post-controller");

function getSound(req, res) {
    var soundName = req.params.sound_name;
    Db.getSoundFromName(soundName)
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
    Db.getAllSounds()
        .then(function (sounds) {
            res.json(sounds);
        })
        .catch(function (error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds due to a database error."});
        });
}

function postSound(req, res) {
    soundPostController.postSound(req, res);
}

module.exports.getSound = getSound;
module.exports.getSounds = getSounds;
module.exports.postSound = postSound;