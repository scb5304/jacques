require("dotenv").config({path: require("app-root-path") + "/.env"});
const sinon = require("sinon");
const chai = require("chai");
const Sound = require("../../model/sound").Sound;
const soundsRepository = require("./sounds-repository");
const logger = require("../../util/logger");
const utility = require("../../util/utility");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("sounds repository", function() {
    const testDiscordId = "91638832488";
    const testSoundName = "wah";
    const testDate = new Date("2018-01-09");
    const testBirdfeed = "a8sHd7r6wB";
    const testPerformedBy = "Adam Egret";
    const testSoundEventCategory = "Targeted";
    const testUser = {
        discord_id: testDiscordId,
        discord_username: "Steubenville",
        discord_last_guild_id: "10239409324934443241",
        birdfeed_token: testBirdfeed,
        birdfeed_date_time: testDate
    };
    const testReturnedSound = {
        name: "steuben",
        sound_events: [],
        save: function() {}
    };
    const noError = undefined;
    const testError = "Oops! It's all broken.";

    describe("insert sound created by user", function() {
        it("inserts with passed sound name and user data", function(done) {
            this.sandbox.stub(Sound, "create").callsFake(function(doc, callback) {
                chai.assert.equal(doc.name, testSoundName);
                chai.assert.isTrue(doc.add_date instanceof Date);
                chai.assert.equal(doc.added_by, testUser.discord_username);
                chai.assert.equal(doc.discord_guild, testUser.discord_last_guild_id);
                done();
            });
            soundsRepository.insertSoundForGuildByUser(testSoundName, testUser);
        });

        it("returns the inserted sound when the insertion is successful", function(done) {
            const testSound = {name: "steve"};
            this.sandbox.stub(Sound, "create").callsFake(function(doc, callback) {
                callback(noError, testSound);
            });
            soundsRepository.insertSoundForGuildByUser(testSoundName, testUser).then(function(sound) {
                chai.assert.deepEqual(testSound, sound);
                done();
            }).catch(logger.error);
        });

        it("returns a rejection when the insertion is not successful", function(done) {
            this.sandbox.stub(Sound, "create").callsFake(function(doc, callback) {
                callback(testError);
            });

            soundsRepository.insertSoundForGuildByUser(testSoundName, testUser).then(function(sound) {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("insert sound event", function() {
        it("queries for the sound with the passed sound name", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc) {
                chai.assert.equal(testReturnedSound.name, doc.name);
                chai.assert.equal(testReturnedSound.discord_guild, doc.testDiscordId);
                done();
            });

            soundsRepository.insertSoundEvent(testReturnedSound.name, testDiscordId);
        });

        it("rejects when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                callback(testError);
            });

            soundsRepository.insertSoundEvent(testReturnedSound.name, testDiscordId).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        });

        it("rejects when the event's corresponding sound can't be found occurs", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                callback(testError, undefined);
            });

            soundsRepository.insertSoundEvent(testReturnedSound.name, testDiscordId).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        });

        it("pushes a sound event into the queried sound's events and saves", function(done) {
            this.sandbox.stub(Sound, "findOne").callsFake(function(doc, callback) {
                callback(undefined, testReturnedSound);
            });

            this.sandbox.stub(testReturnedSound, "save").callsFake(function(callback) {
                callback(undefined, testReturnedSound);
            });

            soundsRepository.insertSoundEvent(testReturnedSound.name, testDiscordId, testPerformedBy, testSoundEventCategory).then(function(sound) {
                const soundEvent = sound.sound_events[0];
                chai.assert.equal(soundEvent.category, testSoundEventCategory);
                chai.assert.equal(soundEvent.performed_by, testPerformedBy);
                chai.assert.isTrue(soundEvent.date instanceof Date);
                done();
            }).catch(logger.error);
        });
    });

    describe("delete sound", function() {
        it("removes sound with the appropriate discord guild ID and sound name", function(done) {
            this.sandbox.stub(Sound, "findOneAndRemove").callsFake(function(doc, callback) {
                chai.assert.equal(doc.name, testSoundName);
                chai.assert.equal(doc.discord_guild, testUser.discord_last_guild_id);
                callback(undefined, testReturnedSound);
            });
            soundsRepository.deleteSoundByDiscordGuildIdAndName(testUser.discord_last_guild_id, testSoundName).then(function() {
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "findOneAndRemove").callsFake(function(doc, callback) {
                callback(testError);
            });
            soundsRepository.deleteSoundByDiscordGuildIdAndName(testUser.discord_last_guild_id, testSoundName).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get sounds by guild", function() {
        it("returns sounds with the appropriate discord guild ID", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                chai.assert.equal(doc.discord_guild, testUser.discord_last_guild_id);
                callback(undefined, [testReturnedSound]);
            });
            soundsRepository.getSoundsByDiscordGuildId(testUser.discord_last_guild_id).then(function(sounds) {
                chai.assert.deepEqual(sounds[0], testReturnedSound);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            soundsRepository.getSoundsByDiscordGuildId(testUser.discord_last_guild_id).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        });
    });

    describe("get random sound in discord guild", function() {
        const secondSound = {name :"secondSoundChosenRandomly"};
        const multipleSounds = [testReturnedSound, secondSound];

        it("returns sounds with the appropriate discord guild ID", function(done) {
            this.sandbox.stub(utility, "getRandomInt").callsFake(function() {
                return 1;
            });

            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                chai.assert.equal(doc.discord_guild, testUser.discord_last_guild_id);
                callback(undefined, multipleSounds);
            });

            soundsRepository.getRandomSoundInDiscordGuild(testUser.discord_last_guild_id).then(function(sound) {
                chai.assert.deepEqual(sound, secondSound);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "find").callsFake(function(doc, projection, callback) {
                callback(testError);
            });
            soundsRepository.getRandomSoundInDiscordGuild(testUser.discord_last_guild_id).then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
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
                chai.assert.equal(100, count);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "count").callsFake(function(callback) {
                callback(testError);
            });
            soundsRepository.getSoundsCount().then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        })
    });

    describe("get sound events count", function() {
        it("returns the count of sound events", function(done) {
            this.sandbox.stub(Sound, "aggregate").callsFake(function(pipeline, callback) {
                callback(noError, [{count: 1000}]);
            });
            soundsRepository.getSoundEventsCount().then(function(count) {
                chai.assert.equal(1000, count);
                done();
            }).catch(logger.error);
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(Sound, "aggregate").callsFake(function(pipeline, callback) {
                callback(testError);
            });
            soundsRepository.getSoundEventsCount().then(function() {
                throw "Resolve should not have been called when a database error occurs";
            }).catch(function(err) {
                chai.assert.isTrue(err.includes(testError));
                done();
            });
        })
    });
});


