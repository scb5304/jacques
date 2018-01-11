const logger = require("../jacques-common/util/logger");
const usersRepository = require("../jacques-common/data/users/users-repository");
const guildsRepository = require("../jacques-common/data/guilds/guilds-repository");
const moment = require("moment");

function getUser(req, res) {
    const birdfeed = req.params.birdfeed;

    usersRepository.getUserFromBirdfeed(birdfeed).then(function(user) {
        if (!user) {
            onUserIsNotInDatabase(res, birdfeed);
        } else if (moment(user.birdfeed_date_time).isAfter(moment().subtract(2, "hours"))) {
            onUserIsInDatabaseWithValidBirdfeed(res, user);
        } else {
            onUserIsInDatabaseWithInvalidBirdfeed(res, user);
        }
    }).catch(function(err) {
        onGetUserFailure(res, err);
    });
}

function onUserIsNotInDatabase(res, birdfeed) {
    res.status(404).send({error: "There's no user with this birdfeed."});
    logger.warn("Couldn't find user with birdfeed: " + birdfeed);
}

function onUserIsInDatabaseWithValidBirdfeed(res, user) {
    //Get the most current guild name for this guy's discord guild ID before we send it back.
    guildsRepository.getGuildById(user.discord_last_guild_id).then(function(guild) {
        if (guild) {
            const userObj = user.toObject();
            const guildObj = guild.toObject();
            userObj.discord_last_guild_name = guildObj.discord_name;
            res.json(userObj);
        } else {
            onGetUserFailure(res, "Guild doesn't exist: " + user.discord_last_guild_id);
        }
    }).catch(function(err) {
        onGetUserFailure(res, err);
    });
}

function onUserIsInDatabaseWithInvalidBirdfeed(res, user) {
    res.status(403).send({error: "Sorry, this birdfeed is stale. Please request some new birdfeed."});
    logger.error("Token expired: " + user.birdfeed_token + " for user " + user.discord_username);
}

function onGetUserFailure(res, err) {
    if (!res.headerSent) {
        res.status(500).send({error: "I choked on your birdfeed. Sorry, try again soon. " + err});
    }
}

module.exports.getUser = getUser;