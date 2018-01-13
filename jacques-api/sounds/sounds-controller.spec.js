require("dotenv").config({path: require("app-root-path") + "/.config/.env"});

const fs = require("fs");
const assert = require("chai").assert;
const sinon = require("sinon");
const soundsController = require("./sounds-controller");
const testUtils = require("../../jacques-common/util/test-utils");
const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");

before(function() {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.stub(fs, "writeFile");
    this.sandbox.stub(fs, "unlink");
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
            status: function() {}
        };
        let testSound = testUtils.createTestSound();
        testSound.toObject = function() {return this; };
        this.testSounds = [testSound];
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
});


