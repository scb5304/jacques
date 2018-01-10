require("dotenv").config({path: require("app-root-path") + "/.env"});
const sinon = require("sinon");
const chai = require("chai");
const User = require("./../model/user").User;
const usersRepository = require("./users-repository");
const logger = require("../../common/util/logger");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("users repository", function() {
    const testDiscordId = "91638832488";
    const testUser = {
        discord_id: testDiscordId,
        discord_username: "Steubenville",
        discord_last_guild_id: "10239409324934443241",
        birdfeed_token: "a8sHd7r6wB",
        birdfeed_date_time: new Date("2018-01-09")
    };

    describe("get user from discord ID", function() {
        it("is queried for with the passed ID", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query) {
                chai.assert.equal(query.discord_id, testDiscordId);
                done();
            });
            usersRepository.getUserFromDiscordId(testDiscordId);
        });

        it("is queried for with the passed ID and resolves a user when one exists", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(undefined, testUser);
            });

            usersRepository.getUserFromDiscordId(testDiscordId).then(function(user) {
                chai.assert.deepEqual(testUser, user);
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });
    });
});