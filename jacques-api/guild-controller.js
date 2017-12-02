const logger = require("../common/util/logger");
const Db = require("../common/data/db");

function getGuilds(req, res) {
    Db.getAllGuilds().then(function(guilds) {
        res.json(guilds);
    }).catch(function (err) {
        logger.error(err);
        res.status(500).send();
    });
}

module.exports.getGuilds = getGuilds;