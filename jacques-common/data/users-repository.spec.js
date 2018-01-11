require("dotenv").config({path: require("app-root-path") + "/.env"});
const sinon = require("sinon");
const chai = require("chai");
const User = require("./../model/user").User;
const usersRepository = require("./users-repository");
const logger = require("..//util/logger");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("users repository", function() {
    const testDiscordId = "91638832488";
    const testBirdfeed = "a8sHd7r6wB";
    const testDate = new Date("2018-01-09");
    const testUser = {
        discord_id: testDiscordId,
        discord_username: "Steubenville",
        discord_last_guild_id: "10239409324934443241",
        birdfeed_token: testBirdfeed,
        birdfeed_date_time: testDate
    };
    const noError = undefined;
    const expectedError = "The database is constructed out of Jell-O!";

    describe("get user from discord ID", function() {
        it("queries with the passed ID", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query) {
                chai.assert.equal(query.discord_id, testDiscordId);
                done();
            });
            usersRepository.getUserFromDiscordId(testDiscordId);
        });

        it("resolves a user when no database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(noError, testUser);
            });

            usersRepository.getUserFromDiscordId(testDiscordId).then(function(user) {
                chai.assert.deepEqual(testUser, user);
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(expectedError);
            });

            usersRepository.getUserFromDiscordId(testDiscordId).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(expectedError));
                done();
            });
        });
    });

    describe("get user from birdfeed", function() {
        it("queries with the passed birdfeed", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query) {
                chai.assert.equal(query.birdfeed_token, testBirdfeed);
                done();
            });
            usersRepository.getUserFromBirdfeed(testBirdfeed);
        });

        it("resolves a user when no database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(noError, testUser);
            });

            usersRepository.getUserFromBirdfeed(testBirdfeed).then(function(user) {
                chai.assert.deepEqual(testUser, user);
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(expectedError);
            });

            usersRepository.getUserFromBirdfeed(testBirdfeed).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(expectedError));
                done();
            });
        });
    });

    describe("upsert user with latest discord data and birdfeed token", function() {
        const testGuildMember = {
            id: testDiscordId,
            guild: {id: "12049102340"},
            user: {username: "Steuben"}
        };

        it("queries with the passed guild member's discord id", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query) {
                chai.assert.equal(query.discord_id, testGuildMember.id);
                done();
            });
            usersRepository.upsertUserWithDiscordDataAndToken(testGuildMember, testBirdfeed);
        });

        it("uses the passed guild member to appropriately set the mongoose document", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc) {
                const set = doc.$set;
                chai.assert.equal(set.discord_username, testGuildMember.user.username);
                chai.assert.equal(set.discord_last_guild_id, testGuildMember.guild.id);
                chai.assert.equal(set.birdfeed_token, testBirdfeed);
                chai.assert.isTrue(set.birdfeed_date_time instanceof Date);
                done();
            });
            usersRepository.upsertUserWithDiscordDataAndToken(testGuildMember, testBirdfeed);
        });

        it("resolves when no database error occurs", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc, options, callback) {
                callback(noError, testUser);
            });
            usersRepository.upsertUserWithDiscordDataAndToken(testGuildMember, testBirdfeed).then(function() {
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc, options, callback) {
                callback(expectedError);
            });
            usersRepository.upsertUserWithDiscordDataAndToken(testGuildMember, testBirdfeed).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(expectedError));
                done();
            });
        });

        it("rejects when upsert returns no updated user", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc, options, callback) {
                callback(undefined, noError);
            });
            usersRepository.upsertUserWithDiscordDataAndToken(testGuildMember, testBirdfeed).then(function() {
                throw "Resolve should not have been called when a upsert didnt return a user";
            }).catch(function(err) {
                chai.assert.isFalse(err.includes(expectedError));
                done();
            });
        });
    });
});