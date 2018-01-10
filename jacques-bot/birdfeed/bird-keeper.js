const usersRepository = require("../../common/data/users-repository");
const UIDGenerator = require("uid-generator");
const logger = require("../../common/util/logger.js");

function userHasUploadPermissions(guildMember) {
    try {
        return guildMember.hasPermission("ATTACH_FILES");
    } catch(err) {
        logger.error(err);
        return false;
    }
}

function createBirdfeedForGuildMember(guildMember) {
    return new Promise((resolve, reject) => {
        const token = new UIDGenerator(UIDGenerator.BASE16, 10).generateSync();
        usersRepository.upsertUserWithDiscordDataAndToken(guildMember, token).then(function() {
            return resolve(token);
        }).catch(function(err) {
            return reject(err);
        });
    });
}

module.exports.userHasUploadPermissions = userHasUploadPermissions;
module.exports.createBirdfeedForGuildMember = createBirdfeedForGuildMember;
