const logger = require("../common/util/logger");
const Db = require("../common/data/db");

function getStatistics(req, res) {
    const promises = [];
    promises.push(Db.getGuildsCount());
    promises.push(Db.getSoundsCount());
    promises.push(Db.getSoundEventsCount());

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