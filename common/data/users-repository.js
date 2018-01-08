const User = require("./../model/user").User;
const logger = require("./../util/logger");

function getUserFromDiscordId(discordId) {
    return new Promise((resolve, reject) => {
        User.findOne({discord_id: discordId}, function (err, user) {
            if (err || !user) {
                return reject("Couldn't query for this user: " + discordId + ". Error: " + err);
            } else {
                return user;
            }
        });
    });
}

function getUserFromBirdfeed(birdfeed) {
    return new Promise((resolve, reject) => {
        User.findOne({birdfeed_token: birdfeed}, function (err, user) {
            if (err) {
                return reject("Couldn't find user with birdfeed: " + birdfeed + ". Error: " + err);
            } else {
                return resolve(user);
            }
        });
    });
}

function upsertUserWithDiscordDataAndToken(guildMember, token) {
    return new Promise((resolve, reject) => {
        User.findOneAndUpdate({discord_id: guildMember.id}, {
            $set: {
                discord_username: guildMember.user.username,
                discord_last_guild_id: guildMember.guild.id,
                birdfeed_token: token,
                birdfeed_date_time: new Date(),
            }
        }, {
            upsert: true, new: true
        }, function (err, user) {
            if (err || !user) {
                return reject("Couldn't update find/update user: " + guildMember.user.username + ". Error: " + err);
            } else {
                return resolve();
            }
        });
    });
}

module.exports.getUserFromDiscordId = getUserFromDiscordId;
module.exports.getUserFromBirdfeed = getUserFromBirdfeed;
module.exports.upsertUserWithDiscordDataAndToken = upsertUserWithDiscordDataAndToken;