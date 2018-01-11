const logger = require("../jacques-common/util/logger");
const guildsRepository = require("../jacques-common/data/guilds/guilds-repository");

function getGuild(req, res) {
    const guild = req.params.guild;
    guildsRepository.getGuildById(guild).then(function(guild) {
        if (!guild) {
            res.status(404).send({error: "No guild found with id " + guild + "."});
        } else {
            res.json(guild);
        }
    }).catch(function(err) {
        logger.error(err);
        res.status(500).send();
    });
}

function getGuilds(req, res) {
    guildsRepository.getAllGuilds().then(function(guilds) {
        res.json(guilds);
    }).catch(function (err) {
        logger.error(err);
        res.status(500).send();
    });
}

module.exports.getGuild = getGuild;
module.exports.getGuilds = getGuilds;