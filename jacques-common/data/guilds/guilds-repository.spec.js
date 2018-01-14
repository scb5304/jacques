require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const Guild = require("../../model/guild").Guild;
const guildsRepository = require("./guilds-repository");
const logger = require("../../util/logger");
const testUtils = require("../../util/test-utils");
const noError = undefined;
const testError = "Test error!";

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("guilds repository", function() {
    var self = this;

    beforeEach(function() {
        self.testGuilds = [testUtils.createTestJacquesGuild(), testUtils.createTestJacquesGuild()];
    });

    describe("getting all guilds", function() {
        it("returns the list of guilds", function(done) {
            this.sandbox.stub(Guild, "find").callsFake(function(doc, projection, callback) {
                callback(noError, self.testGuilds);
            });
            guildsRepository.getAllGuilds().then(function(guilds) {
                assert.deepEqual(guilds, self.testGuilds);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when there's a problem getting them from the database", function(done) {
            this.sandbox.stub(Guild, "find").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            guildsRepository.getAllGuilds().then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("getting a guild by ID", function() {
        it("queried for the guild with the passed ID", function(done) {
            this.sandbox.stub(Guild, "findOne").callsFake(function(query) {
                assert.equal(query.discord_id, self.testGuilds[0].discord_id);
                done();
            });
            guildsRepository.getGuildById(self.testGuilds[0].discord_id);
        });

        it("resolves a guild when no database error occurs", function(done) {
            this.sandbox.stub(Guild, "findOne").callsFake(function(query, projection, callback) {
                callback(noError, self.testGuilds[0]);
            });

            guildsRepository.getGuildById(self.testGuilds[0].discord_id).then(function(guild) {
                assert.deepEqual(guild, self.testGuilds[0]);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Guild, "findOne").callsFake(function(query, projection, callback) {
                callback(testError);
            });

            guildsRepository.getGuildById(self.testGuilds[0].discord_id).then(function(guild) {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("deleting guilds", function() {
        it("calls to remove guilds that we aren't a member of anymore", function(done) {
            const discordGuildIds = [self.testGuilds[0].discord_id, self.testGuilds[1].discord_id];
            this.sandbox.stub(Guild, "remove").callsFake(function(query) {
                assert.equal(query.discord_id.$nin, discordGuildIds);
                done();
            });
            guildsRepository.deleteGuildsNotInListOfIds(discordGuildIds);
        });

        it("returns the result when deletion is successful", function(done) {
            const testRemovalResult = {result: {n: 5}};
            this.sandbox.stub(Guild, "remove").callsFake(function(query, callback) {
                callback(noError, testRemovalResult);
            });
            guildsRepository.deleteGuildsNotInListOfIds([]).then(function(removalResult) {
                assert.deepEqual(removalResult, testRemovalResult);
                done();
            });
        });

        it("rejects with an error when deletion fails", function(done) {
            this.sandbox.stub(Guild, "remove").callsFake(function(query, callback) {
                callback(testError);
            });
            guildsRepository.deleteGuildsNotInListOfIds([]).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("updating volume", function() {
        it("calls to update the volume for the guild passed, with the correct value", function(done) {
            this.sandbox.stub(Guild, "update").callsFake(function(query, doc) {
                assert.equal(query.discord_id, self.testGuilds[0].discord_id);
                assert.equal(doc.$set.volume, 0.50);
                done();
            });
            guildsRepository.updateVolumeForGuild(0.50, self.testGuilds[0].discord_id);
        });

        it("resolves when the volume is updated successfully", function(done) {
            this.sandbox.stub(Guild, "update").callsFake(function(query, doc, callback) {
                callback(noError);
            });
            guildsRepository.updateVolumeForGuild(0.50, self.testGuilds[0].discord_id).then(function() {
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when the volume is not updated successfully", function(done) {
            this.sandbox.stub(Guild, "update").callsFake(function(query, doc, callback) {
                callback(testError);
            });
            guildsRepository.updateVolumeForGuild(0.50, self.testGuilds[0].discord_id).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("inserting a guild", function() {
        it("creates a guild from the passed Discord guild object", function(done) {
            const testDiscordGuild = testUtils.createTestDiscordGuild();

            this.sandbox.stub(Guild, "create").callsFake(function(doc) {
                assert.equal(doc.discord_id, testDiscordGuild.id);
                assert.equal(doc.discord_name, testDiscordGuild.name);
                done();
            });
            guildsRepository.insertGuild(testDiscordGuild);
        });

        it("resolves when the jacques guild is created successfully", function(done) {
            this.sandbox.stub(Guild, "create").callsFake(function(doc, callback) {
                callback(noError);
            });
            guildsRepository.insertGuild({}).then(function() {
                done();
            }).catch(logger.error);
        });

        it("rejects when the jacques guild is not created successfully", function(done) {
            this.sandbox.stub(Guild, "create").callsFake(function(doc, callback) {
                callback(testError);
            });
            guildsRepository.insertGuild({}).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get guilds count", function() {
        it("returns the count of guilds", function(done) {
            this.sandbox.stub(Guild, "count").callsFake(function(callback) {
                callback(noError, 100);
            });
            guildsRepository.getGuildsCount().then(function(count) {
                assert.equal(100, count);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Guild, "count").callsFake(function(callback) {
                callback(testError);
            });
            guildsRepository.getGuildsCount().then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        })
    });
});