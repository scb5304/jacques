require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const Sound = require("../../model/sound").Sound;
const soundsRepository = require("./sounds-repository");
const logger = require("../../util/logger");
const utility = require("../../util/utility");
const testUtils = require("../../util/test-utils");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("sounds repository", function() {
    var self = this;

    beforeEach(function() {
        self.testSound = testUtils.createTestSound();
        self.testSoundEvent = testUtils.createTestSoundEvent();
        self.testJacquesUser = testUtils.createTestJacquesUser();
        self.testGuildId = testUtils.createTestJacquesGuild().discord_id;
    });

    const noError = undefined;
    const testError = "Oops! It's all broken.";

    describe("insert sound created by user", function() {
        it("inserts with passed sound name and user data", function(done) {
            this.sandbox.stub(Sound, "create").callsFake(function(doc) {
                assert.equal(doc.name, self.testSound.name);
                assert.isTrue(doc.add_date instanceof Date);
                assert.equal(doc.added_by, self.testJacquesUser.discord_username);
                assert.equal(doc.discord_guild, self.testJacquesUser.discord_last_guild_id);
                done();
            });
            soundsRepository.insertSoundForGuildByUser(self.testSound.name, self.testJacquesUser);
        });

        it("returns the inserted sound when the insertion is successful", function(done) {
            this.sandbox.stub(Sound, "create").callsFake(function(doc, callback) {
                callback(noError, self.testSound);
            });
            soundsRepository.insertSoundForGuildByUser(self.testSound.name, self.testJacquesUser).then(function(sound) {
                assert.deepEqual(self.testSound, sound);
                done();
            }).catch(logger.error);
        });

        it("returns a rejection when the insertion is not successful", function(done) {
            this.sandbox.stub(Sound, "create").callsFake(function(doc, callback) {
                callback(testError);
            });

            soundsRepository.insertSoundForGuildByUser(self.testSound.name, self.testJacquesUser).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("insert sound event", function() {
        it("queries for the sound with the passed sound name", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                assert.equal(self.testSound.name, doc.name);
                assert.equal(self.testSound.discord_guild, doc.discord_guild);
                done();
            });

            soundsRepository.insertSoundEvent(self.testSound.name, self.testSound.discord_guild);
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                callback(testError);
            });

            soundsRepository.insertSoundEvent(self.testSound.name, self.testJacquesUser.discord_last_guild_id).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });

        it("rejects when the event's corresponding sound can't be found occurs", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                callback(testError, undefined);
            });

            soundsRepository.insertSoundEvent(self.testSound.name, self.testJacquesUser.discord_last_guild_id).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });

        it("pushes a sound event into the queried sound's events and saves", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                callback(undefined, self.testSound);
            });

            this.sandbox.stub(self.testSound, "save").callsFake(function(callback) {
                callback(undefined, self.testSound);
            });

            self.testSound.sound_events.push = function() {};
            soundsRepository.insertSoundEvent(self.testSound.name, self.testSound.discord_guild, self.testSoundEvent.performed_by, self.testSoundEvent.category)
                .then(function (sound) {
                    const soundEvent = sound.sound_events[0];
                    assert.equal(soundEvent.category, self.testSoundEvent.category);
                    assert.equal(soundEvent.performed_by, self.testSoundEvent.performed_by);
                    done();
                }).catch(logger.error);
        });
    });

    describe("getting all sounds", function() {
        it("gets sounds with an empty query", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                assert.deepEqual(doc, {});
                done();
                callback(undefined, [self.testSound]);
            });
            soundsRepository.getAllSounds();
        });

        it("resolves a list of sounds when there's no database error", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                callback(undefined, [self.testSound]);
            });
            soundsRepository.getAllSounds().then(function(sounds) {
                assert.isDefined(sounds);
                done();
            }).catch(logger.error);
        });

        it("resolves a list of sounds when there's no database error", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            soundsRepository.getAllSounds().then(function(sounds) {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe.only("getting a sound by guild ID and sound name", function() {
        it("queries for a sound with the passed guild ID and sound name", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, projection, callback) {
                assert.equal(doc.discord_guild, self.testSound.discord_guild);
                assert.equal(doc.name, self.testSound.name);
                done();
                callback(undefined, self.testSound);
            });
            soundsRepository.getSoundByDiscordGuildIdAndName(self.testSound.discord_guild, self.testSound.name);
        });

        it("resolves a sound when there's no database error", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, projection, callback) {
                callback(undefined, [self.testSound]);
            });
            soundsRepository.getSoundByDiscordGuildIdAndName(self.testSound.discord_guild, self.testSound.name)
                .then(function (sound) {
                    assert.isDefined(sound);
                    done();
                }).catch(logger.error);
        });

        it("rejects with an error when there's no database error", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            soundsRepository.getSoundByDiscordGuildIdAndName(self.testSound.discord_guild, self.testSound.name).then(function () {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("delete sound", function() {
        it("removes sound with the appropriate discord guild ID and sound name", function(done) {
            this.sandbox.stub(Sound, "findOneAndRemove").callsFake(function(doc, callback) {
                assert.equal(doc.name, self.testSound.name);
                assert.equal(doc.discord_guild, self.testSound.discord_guild);
                callback(undefined, self.testSound);
            });
            soundsRepository.deleteSoundByDiscordGuildIdAndName(self.testSound.discord_guild, self.testSound.name).then(function() {
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "findOneAndRemove").callsFake(function(doc, callback) {
                callback(testError);
            });
            soundsRepository.deleteSoundByDiscordGuildIdAndName(self.testJacquesUser.discord_last_guild_id, self.testSound.discord_guild).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get sounds by guild", function() {
        it("returns sounds with the appropriate discord guild ID", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                assert.equal(doc.discord_guild, self.testJacquesUser.discord_last_guild_id);
                callback(undefined, [self.testSound]);
            });
            soundsRepository.getSoundsByDiscordGuildId(self.testJacquesUser.discord_last_guild_id).then(function(sounds) {
                assert.deepEqual(sounds[0], self.testSound);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            soundsRepository.getSoundsByDiscordGuildId(self.testJacquesUser.discord_last_guild_id).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get random sound in discord guild", function() {
        const secondSound = {name :"secondSoundChosenRandomly"};
        const multipleSounds = [self.testSound, secondSound];

        it("returns sounds with the appropriate discord guild ID", function(done) {
            this.sandbox.stub(utility, "getRandomInt").callsFake(function() {
                return 1;
            });

            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                assert.equal(doc.discord_guild, self.testSound.discord_guild);
                callback(undefined, multipleSounds);
            });

            soundsRepository.getRandomSoundInDiscordGuild(self.testSound.discord_guild).then(function(sound) {
                assert.deepEqual(sound, secondSound);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            soundsRepository.getRandomSoundInDiscordGuild(self.testSound.discord_guild).then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get sounds count", function() {
        it("returns the count of sounds", function(done) {
            this.sandbox.stub(Sound, "count").callsFake(function(callback) {
                callback(noError, 100);
            });
            soundsRepository.getSoundsCount().then(function(count) {
                assert.equal(100, count);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "count").callsFake(function(callback) {
                callback(testError);
            });
            soundsRepository.getSoundsCount().then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get sound events count", function() {
        it("returns the count of sound events", function(done) {
            this.sandbox.stub(Sound, "aggregate").callsFake(function(pipeline, callback) {
                callback(noError, [{count: 1000}]);
            });
            soundsRepository.getSoundEventsCount().then(function(count) {
                assert.equal(1000, count);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "aggregate").callsFake(function(pipeline, callback) {
                callback(testError);
            });
            soundsRepository.getSoundEventsCount().then(function() {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function(err) {
                assert.isTrue(err.includes(testError));
                done();
            });
        })
    });
});


