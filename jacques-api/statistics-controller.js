const logger = require("../common/util/logger");
const soundsRepository = require("../common/data/sounds-repository");
const guildsRepository = require("../common/data/guilds-repository");

function getStatistics(req, res) {
    const promises = [];
    promises.push(guildsRepository.getGuildsCount());
    promises.push(soundsRepository.getSoundsCount());
    promises.push(soundsRepository.getSoundEventsCount());

    Promise.all(promises)
        .then(function(counts) {
            const statisticsObject = {
                guildsCount: counts[0],
                soundsCount: counts[1],
                soundEventsCount: counts[2],
            };
            res.json(statisticsObject);
        }).catch(function(err) {
            logger.error(err);
            res.status(500).send({error: "Failed to get statistics: " + err});
    });
}

module.exports.getStatistics = getStatistics;