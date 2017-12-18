const logger = require("../common/util/logger");
const Db = require("../common/data/db");
const moment = require("moment");

function getUser(req, res) {
    var birdfeed = req.params.birdfeed;

    Db.getUserFromBirdfeed(birdfeed).then(function(user) {
        if (!user) {
            res.status(404).send({error: "There's no user with this birdfeed."});
            logger.warning("Couldn't find user with birdfeed: " + birdfeed);
        } else if (moment(user.birdfeed_date_time).isAfter(moment().subtract(2, "hours"))) {
            //Get the most current guild name for this guy's discord guild ID before we send it back.
            Db.getGuildById(user.discord_last_guild_id).then(function(guild) {
                if (guild) {
                    var userObj = user.toObject();
                    var guildObj = guild.toObject();
                    userObj.discord_last_guild_name = guildObj.discord_name;
                    res.json(userObj);
                } else {
                    onGetUserFailure(res, "Guild doesn't exist: " + user.discord_last_guild_id);
                }
            }).catch(function(err) {
                onGetUserFailure(res, err);
            });
        } else {
            res.status(403).send({error: "Sorry, this birdfeed is stale. Please request some new birdfeed."});
            logger.error("Token expired: " + birdfeed + " for user " + user.discord_username);
        }
    }).catch(function(err) {
        onGetUserFailure(res, err);
    });
}

function onGetUserFailure(res, err) {
    res.status(500).send({error: "I choked on your birdfeed. Sorry, try again soon. " + err});
}

module.exports.getUser = getUser;