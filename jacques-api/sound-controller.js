const logger = require("../common/util/logger");
const Db = require("../common/data/db");
const soundPostController = require("./sound-post-controller");

function getSounds(req, res) {
    Db.getAllSounds()
        .then(function(sounds) {
            res.json(sounds);
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sounds due to a database error."});
        });
}

function getSoundsByGuild(req, res) {
    var guild = req.params.guild;
    Db.getSoundsByDiscordGuildId(guild)
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
    var name = req.params.name;

    Db.getSoundByDiscordGuildIdAndName(guild, name)
        .then(function(sound) {
            res.json(sound);
        })
        .catch(function(error) {
            logger.error(error);
            res.status(500).send({error: "Failed to get sound for guild " + guild + " and name " + name + " due to a database error."});
        });
}

function postSound(req, res) {
    soundPostController.postSound(req, res);
}

module.exports.getSounds = getSounds;
module.exports.getSoundsByGuild = getSoundsByGuild;

module.exports.getSoundByGuildAndName = getSoundByGuildAndName;
module.exports.postSound = postSound;