const logger = require("../common/util/logger");
const Db = require("../common/data/db");

function getGuild(req, res) {
    const guild = req.params.guild;
    Db.getGuildById(guild).then(function(guild) {
        res.json(guild);
    }).catch(function(err) {
        logger.error(err);
        res.status(500).send();
    });
}

function getGuilds(req, res) {
    Db.getAllGuilds().then(function(guilds) {
        res.json(guilds);
    }).catch(function (err) {
        logger.error(err);
        res.status(500).send();
    });
}

module.exports.getGuild = getGuild;
module.exports.getGuilds = getGuilds;