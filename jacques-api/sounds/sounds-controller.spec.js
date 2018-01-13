require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const assert = require("chai").assert;
const sinon = require("sinon");
const soundsController = require("./sounds-controller");
const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");
const testUtils = require("../../jacques-common/util/test-utils");
const fileSystemManager = require("../../jacques-common/util/file-system-manager");
const birdfeedValidator = require("../birdfeed-validator");

before(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("sounds-controller", function() {
    let self;
    beforeEach(function() {
        this.req = {
            query: {}
        };
        this.res = {
            json: function() {},
            status: function() {
                return {send: function() {}};
            }
        };
        let testSound = testUtils.createTestSound();
        testSound.toObject = function() {return this; };
        this.testSounds = [testSound];
        this.testJacquesUser = testUtils.createTestJacquesUser();
        this.sandbox.stub(fileSystemManager);
        self = this;
    });

    describe("getting all sounds", function() {
        it("returns the sounds in JSON after getting them from the sounds repository", function(done) {
            self.sandbox.stub(soundsRepository, "getAllSounds").callsFake(function() {
                return Promise.resolve(self.testSounds);
            });

            soundsController.getSounds(this.req, this.res);

            this.sandbox.stub(this.res, "json").callsFake(function(actualSounds) {
                testUtils.expectApiResponseJson(self.testSounds, actualSounds, done);
            });
        });

        it("returns the sounds in JSON without sound events if queried as such", function(done) {
            self.sandbox.stub(soundsRepository, "getAllSounds").callsFake(function() {
                return Promise.resolve(self.testSounds);
            });

            this.req.query.includeSoundEvents = "false";
            soundsController.getSounds(this.req, this.res);

            this.sandbox.stub(this.res, "json").callsFake(function(actualSounds) {
                actualSounds.forEach(function(sound) {
                    assert.isUndefined(sound.sound_events);
                });
                testUtils.expectApiResponseJson(self.testSounds, actualSounds, done);
            });
        });

        it("returns an error after failing to get them from the sounds repository", function(done) {
            self.sandbox.stub(soundsRepository, "getAllSounds").callsFake(function() {
                return Promise.reject("Test database error.");
            });

            soundsController.getSounds(this.req, this.res);

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });
        });
    });

    describe("getting sounds for a guild", function() {
        beforeEach(function() {
            this.req.params = {guild: "100"};
        });

        it("returns the sounds in JSON after getting them from the sounds repository", function(done) {
            self.sandbox.stub(soundsRepository, "getSoundsByDiscordGuildId").callsFake(function() {
                return Promise.resolve(self.testSounds);
            });

            soundsController.getSoundsByGuild(this.req, this.res);

            this.sandbox.stub(this.res, "json").callsFake(function(actualSounds) {
                testUtils.expectApiResponseJson(self.testSounds, actualSounds, done);
            });
        });

        it("returns the sounds in JSON without sound events if queried as such", function(done) {
            self.sandbox.stub(soundsRepository, "getSoundsByDiscordGuildId").callsFake(function() {
                return Promise.resolve(self.testSounds);
            });

            this.req.query.includeSoundEvents = "false";
            soundsController.getSoundsByGuild(this.req, this.res);

            this.sandbox.stub(this.res, "json").callsFake(function(actualSounds) {
                actualSounds.forEach(function(sound) {
                    assert.isUndefined(sound.sound_events);
                });
                testUtils.expectApiResponseJson(self.testSounds, actualSounds, done);
            });
        });

        it("returns an error after failing to get them from the sounds repository", function(done) {
            self.sandbox.stub(soundsRepository, "getSoundsByDiscordGuildId").callsFake(function() {
                return Promise.reject("Test database error.");
            });

            soundsController.getSoundsByGuild(this.req, this.res);

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });
        });
    });

    describe("getting a particular sound by guild ID and sound name", function() {
        beforeEach(function() {
            this.req.params = {guild: "100", sound: "myTestSound"};
        });

        it("returns the sound in JSON when it exists in the repository", function(done) {
            self.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
                return Promise.resolve(self.testSounds[0]);
            });

            soundsController.getSoundByGuildAndName(this.req, this.res);

            this.sandbox.stub(this.res, "json").callsFake(function(actualSound) {
                return testUtils.expectApiResponseJson(self.testSounds[0], actualSound, done);
            });
        });

        it("returns a 404 when the sound does not exist in the repository", function(done) {
            self.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
                return Promise.resolve(undefined);
            });

            soundsController.getSoundByGuildAndName(this.req, this.res);

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(404, status, done);
            });
        });

        it("returns a 500 when an error occurs fetching the sound from the repository", function(done) {
            self.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
                return Promise.reject("Test error");
            });

            soundsController.getSoundByGuildAndName(this.req, this.res);

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });
        });
    });

    describe("deleting a sound by guild ID and name", function() {
        beforeEach(function() {
            this.req.params = {guild: self.testJacquesUser.discord_last_guild_id, soundName: "myTestSound", birdfeed: testUtils.createTestBirdfeed()};
        });

        it("returns a 403 when the user's guild doesn't match the guild they're trying to delete from", function(done) {
            this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                return Promise.resolve(self.testJacquesUser);
            });
            this.req.params.guild = "192034";
            soundsController.deleteSound(this.req, this.res);

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(403, status, done);
            });
        });

        it("uses the sound repository to delete the sound", function(done) {
            this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                return Promise.resolve(self.testJacquesUser);
            });
            this.sandbox.stub(soundsRepository, "deleteSoundByDiscordGuildIdAndName").callsFake(function() {
                done();
                return Promise.reject("Don't actually do anything.");
            });

            soundsController.deleteSound(this.req, this.res);
        });

        it("deletes the sound from the file system and responds with a 200", function(done) {
            fileSystemManager.deleteSoundFromFileSystem.restore();
            self.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                return Promise.resolve(self.testJacquesUser);
            });
            self.sandbox.stub(soundsRepository, "deleteSoundByDiscordGuildIdAndName").callsFake(function() {
                return Promise.resolve();
            });
            self.sandbox.stub(fileSystemManager, "deleteSoundFromFileSystem").callsFake(function() {
                return Promise.resolve();
            });
            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(200, status, done);
            });

            soundsController.deleteSound(this.req, this.res);
        });

        it("responds with a 500 when deleting the sound from the file system fails", function(done) {
            fileSystemManager.deleteSoundFromFileSystem.restore();
            self.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                return Promise.resolve(self.testJacquesUser);
            });
            self.sandbox.stub(soundsRepository, "deleteSoundByDiscordGuildIdAndName").callsFake(function() {
                return Promise.resolve();
            });
            self.sandbox.stub(fileSystemManager, "deleteSoundFromFileSystem").callsFake(function() {
                return Promise.reject("Test failure of deleting sound in file system.");
            });
            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });

            soundsController.deleteSound(this.req, this.res);
        });

        it("responds with a 500 when deleting the sound from the database fails", function(done) {
            self.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                return Promise.resolve(self.testJacquesUser);
            });
            self.sandbox.stub(soundsRepository, "deleteSoundByDiscordGuildIdAndName").callsFake(function() {
                return Promise.reject("Test failure of deleting sound in database.");
            });
            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });

            soundsController.deleteSound(this.req, this.res);
        });
    });

    describe("submitting sounds", function() {
        beforeEach(function() {
            //By default, include all required data. Remove a piece of data for each test.
            this.req = {
                params: {
                    guild: self.testJacquesUser.discord_last_guild_id,
                    soundName: "myTestSound"
                },
                body: {
                    birdfeed: testUtils.createTestBirdfeed(),
                    soundData: "data:audio/mp3;base64,a9jkdFAHIS426IAHWe1IAWE325"
                }
            };
        });

        describe("while missing required data", function() {
            it("responds with a 403 when no birdfeed is included in the request", function(done) {
                this.req.body.birdfeed = undefined;
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(403, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });

            it("responds with a 400 when no guild id is included in the request", function(done) {
                this.req.params.guild = undefined;
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(400, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });

            it("responds with a 400 when no sound name is included in the request", function(done) {
                this.req.params.soundName = undefined;
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(400, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });

            it("responds with a 400 when no sound data in request body", function(done) {
                this.req.body.soundData = undefined;
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(400, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });

            it("responds with a 400 when the sound data doesn't start with the right metadata", function(done) {
                this.req.body.soundData = "mp3gibberish";
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(400, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });
        });

        describe("while having required data", function() {
            it("sends a 403 if the user belongs to a different guild than requested", function(done) {
                this.req.params.guild = "1234904005";
                this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                    return Promise.resolve(self.testJacquesUser);
                });
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(403, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });

            it("sends a 400 if the sound name is reserved", function(done) {
                this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                    return Promise.resolve(self.testJacquesUser);
                });
                this.sandbox.stub(self.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(400, status, done);
                });
                this.req.params.soundName = soundsController.RESERVED_KEYWORDS[0];
                soundsController.postSound(this.req, this.res);
            });

            it("inserts the sound into the database when all data is valid", function(done) {
                this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                    return Promise.resolve(self.testJacquesUser);
                });
                this.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
                    return Promise.resolve(undefined);
                });
                this.sandbox.stub(soundsRepository, "insertSoundForGuildByUser").callsFake(function() {
                    done();
                    return Promise.reject("Fake rejection to prevent executing unnecessary code.");
                });
                soundsController.postSound(this.req, this.res);
            });

            it("writes the sound to the the file system once it's in the database, sending back a 200", function(done) {
                fileSystemManager.writeSoundToFileSystem.restore();
                this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                    return Promise.resolve(self.testJacquesUser);
                });
                this.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
                    return Promise.resolve(undefined);
                });
                this.sandbox.stub(soundsRepository, "insertSoundForGuildByUser").callsFake(function() {
                    return Promise.resolve();
                });
                this.sandbox.stub(fileSystemManager, "writeSoundToFileSystem").callsFake(function() {
                    return Promise.resolve();
                });
                this.sandbox.stub(self.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(200, status, done);
                });
                soundsController.postSound(this.req, this.res);
            });

            it("deletes it from the database after insertion if writing the sound  to the the file system fails", function(done) {
                fileSystemManager.writeSoundToFileSystem.restore();
                this.sandbox.stub(birdfeedValidator, "validateBirdfeedInRequest").callsFake(function() {
                    return Promise.resolve(self.testJacquesUser);
                });
                this.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
                    return Promise.resolve(undefined);
                });
                this.sandbox.stub(soundsRepository, "insertSoundForGuildByUser").callsFake(function() {
                    return Promise.resolve();
                });
                this.sandbox.stub(fileSystemManager, "writeSoundToFileSystem").callsFake(function() {
                    return Promise.reject("You just saved it to the database but writing it to the file system failed!");
                });
                this.sandbox.stub(soundsRepository, "deleteSoundByDiscordGuildIdAndName").callsFake(function() {
                    done();
                    return Promise.resolve();
                });
                this.sandbox.stub(self.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(500, status);
                });
                soundsController.postSound(this.req, this.res);
            });
        });
    });
});


