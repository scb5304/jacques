const usersRepository = require("../jacques-common/data/users/users-repository");
const moment = require("moment");

function validateBirdfeedInRequest(birdfeed, res) {
    return new Promise((resolve, reject) => {
        usersRepository.getUserFromBirdfeed(birdfeed).then(function(user) {
            if (!user) {
                res.status(400).send({error: "I don't recognize this birdfeed. If I did give it out, I don't want it anymore."});
                return reject("Couldn't find user with birdfeed: " + birdfeed);
            }
            if (moment(user.birdfeed_date_time).isAfter(moment().subtract(2, "hours"))) {
                return resolve(user);
            } else {
                res.status(403).send({error: "Sorry, this birdfeed is stale. Please request some new birdfeed."});
                return reject("Token expired.");
            }
        }).catch(function(err) {
            res.status(500).send({error: "I choked on your birdfeed. Sorry, try again soon."});
            return reject(err);
        });
    });
}

module.exports.validateBirdfeedInRequest = validateBirdfeedInRequest;