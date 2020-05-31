require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const guildLeader = require("./guild-leader");
const testUtils = require("../../jacques-common/util/test-utils");
const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("guild-leader", function() {
    let self;
    beforeEach(function() {
        this.testJacquesGuild = testUtils.createTestJacquesGuild();
        this.bot = testUtils.createTestDiscordClient();
        self = this;
    });

    describe("updating guild volume", function() {
        it("uses the guild repo to update the volume", function(done) {
            this.sandbox.stub(guildsRepository, "updateVolumeForGuild").callsFake(function(volume, guildId) {
                assert.equal(0.50, volume);
                assert.equal(self.testJacquesGuild.discord_id, guildId);
                done();
            });
            guildLeader.updateGuildVolume(this.testJacquesGuild.discord_id, 0.50);
        });
    });

    describe("getting guild volume", function() {
        it("resolves the volume when the guild has a volume set", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function(guildId) {
                assert.equal(self.testJacquesGuild.discord_id, guildId);
                return Promise.resolve(self.testJacquesGuild);
            });
            guildLeader.getGuildVolume(this.testJacquesGuild.discord_id).then(function(volume) {
                assert.equal(volume, self.testJacquesGuild.volume);
                done();
            });
        });

        it("resolves a default volume when the guild has no volume set", function(done) {
            self.testJacquesGuild.volume = 0.0;

            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function(guildId) {
                assert.equal(self.testJacquesGuild.discord_id, guildId);
                return Promise.resolve(self.testJacquesGuild);
            });
            guildLeader.getGuildVolume(this.testJacquesGuild.discord_id).then(function(volume) {
                assert.isTrue(volume > 0);
                done();
            });
        });

        it("rejects with an error when the guild doesn't exist", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function(guildId) {
                return Promise.resolve(undefined);
            });
            guildLeader.getGuildVolume(this.testJacquesGuild.discord_id).then(function() {
                testUtils.throwUnexpectedResolveWhen("the guild is undefined");
            }).catch(function() {
                done();
            });
        });

        it("resolves with default value when a database error occurs", function(done) {
            var testError = "ahhh";

            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.reject(testError);
            });
            guildLeader.getGuildVolume(this.testJacquesGuild.discord_id).then(function() {
                done();
            });
        });
    });

    describe("refreshing guilds", function() {
        const anotherDiscordGuild = {
            id: "6436257669556873494",
            name: "Test Server"
        };
        beforeEach(function() {
            self.bot.guilds = [testUtils.createTestDiscordGuild(), anotherDiscordGuild];
        });

        it("adds multiple guilds when they are not yet in the database", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.resolve(undefined);
            });
            let insertGuildStub = this.sandbox.stub(guildsRepository, "insertGuild").callsFake(function(discordGuild) {
                if (insertGuildStub.callCount === self.bot.guilds.length) {
                    done();
                }
                return Promise.resolve();
            });
            guildLeader.refreshGuilds(self.bot.guilds);
        });

        it("does not add any guild when they are already in the database", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function(guildId) {
                return Promise.resolve({id: guildId});
            });
            let insertGuildSpy = this.sandbox.spy(guildsRepository, "insertGuild");
            guildLeader.refreshGuilds(self.bot.guilds);

            setTimeout(function() {
                sinon.assert.notCalled(insertGuildSpy);
                done();
            }, 0);
        });

        it("deletes the guilds that Jacques is no longer on", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.resolve(undefined);
            });
            this.sandbox.stub(guildsRepository, "deleteGuildsNotInListOfIds").callsFake(function() {
                done();
                return Promise.resolve({result:{n: self.bot.guilds.length}});
            });
            guildLeader.refreshGuilds(self.bot.guilds);
        });
    });
});
