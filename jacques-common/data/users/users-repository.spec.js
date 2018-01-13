require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const User = require("../../model/user").User;
const usersRepository = require("./users-repository");
const logger = require("../../util/logger");
const testUtils = require("../../util/test-utils");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("users repository", function() {
    var self = this;

    beforeEach(function() {
        self.testSound = testUtils.createTestSound();
        self.testSoundEvent = testUtils.createTestSoundEvent();
        self.testJacquesUser = testUtils.createTestJacquesUser();
        self.testGuildId = testUtils.createTestJacquesGuild().discord_id;
        self.testBirdfeed = testUtils.createTestBirdfeed();
        self.testGuildMember = testUtils.createTestDiscordGuildMember();
    });

    const noError = undefined;
    const expectedError = "The database is constructed out of Jell-O!";

    describe("get user from discord ID", function() {
        it("queries with the passed ID", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query) {
                assert.equal(query.discord_id, self.testJacquesUser.discord_id);
                done();
            });
            usersRepository.getUserFromDiscordId(self.testJacquesUser.discord_id);
        });

        it("resolves a user when no database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(noError, self.testJacquesUser);
            });

            usersRepository.getUserFromDiscordId(self.testJacquesUser.discord_id).then(function(user) {
                assert.deepEqual(self.testJacquesUser, user);
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(expectedError);
            });

            usersRepository.getUserFromDiscordId(self.testJacquesUser.discord_id).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                assert.isTrue(err.includes(expectedError));
                done();
            });
        });
    });

    describe("get user from birdfeed", function() {
        it("queries with the passed birdfeed", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query) {
                assert.equal(query.birdfeed_token, self.testBirdfeed);
                done();
            });
            usersRepository.getUserFromBirdfeed(self.testBirdfeed);
        });

        it("resolves a user when no database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(noError, self.testJacquesUser);
            });

            usersRepository.getUserFromBirdfeed(self.testBirdfeed).then(function(user) {
                assert.deepEqual(self.testJacquesUser, user);
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(User, "findOne").callsFake(function(query, callback) {
                callback(expectedError);
            });

            usersRepository.getUserFromBirdfeed(self.testBirdfeed).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                assert.isTrue(err.includes(expectedError));
                done();
            });
        });
    });

    describe("upsert user with latest discord data and birdfeed token", function() {
        it("queries with the passed guild member's discord id", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query) {
                assert.equal(query.discord_id, self.testGuildMember.id);
                done();
            });
            usersRepository.upsertUserWithDiscordDataAndToken(self.testGuildMember, self.testBirdfeed);
        });

        it("uses the passed guild member to appropriately set the mongoose document", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc) {
                const set = doc.$set;
                assert.equal(set.discord_username, self.testGuildMember.user.username);
                assert.equal(set.discord_last_guild_id, self.testGuildMember.guild.id);
                assert.equal(set.birdfeed_token, self.testBirdfeed);
                assert.isTrue(set.birdfeed_date_time instanceof Date);
                done();
            });
            usersRepository.upsertUserWithDiscordDataAndToken(self.testGuildMember, self.testBirdfeed);
        });

        it("resolves when no database error occurs", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc, options, callback) {
                callback(noError, self.testJacquesUser);
            });
            usersRepository.upsertUserWithDiscordDataAndToken(self.testGuildMember, self.testBirdfeed).then(function() {
                done();
            }).catch(function(err) {
                logger.error(err);
            });
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc, options, callback) {
                callback(expectedError);
            });
            usersRepository.upsertUserWithDiscordDataAndToken(self.testGuildMember, self.testBirdfeed).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                assert.isTrue(err.includes(expectedError));
                done();
            });
        });

        it("rejects when upsert returns no updated user", function(done) {
            this.sandbox.stub(User, "findOneAndUpdate").callsFake(function(query, doc, options, callback) {
                callback(undefined, noError);
            });
            usersRepository.upsertUserWithDiscordDataAndToken(self.testGuildMember, self.testBirdfeed).then(function() {
                throw "Resolve should not have been called when a upsert didnt return a user";
            }).catch(function(err) {
                assert.isFalse(err.includes(expectedError));
                done();
            });
        });
    });
});