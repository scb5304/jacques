require("dotenv").config({path: require("app-root-path") + "/.env"});

const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");
const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");
const sinon = require("sinon");
const statisticsController = require("./statistics-controller");
const jacquesTestUtils = require("../../jacques-common/util/test-utils");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("statistics-controller", function() {
    const GUILDS_COUNT = 5;
    const SOUNDS_COUNT = 50;
    const SOUND_EVENTS_COUNT = 500;
    const STATISTICS_DATABASE_ERROR = "Mock database error.";

    beforeEach(function() {
        this.res = {
            json: function() {},
            status: function() {}
        };
    });

    describe("getStatistics", function() {
        describe("when successful", function() {
            beforeEach(function() {
                this.sandbox.stub(guildsRepository, "getGuildsCount").callsFake(function() {
                    return Promise.resolve(GUILDS_COUNT);
                });
                this.sandbox.stub(soundsRepository, "getSoundsCount").callsFake(function() {
                    return Promise.resolve(SOUNDS_COUNT);
                });
                this.sandbox.stub(soundsRepository, "getSoundEventsCount").callsFake(function() {
                    return Promise.resolve(SOUND_EVENTS_COUNT);
                });
            });

            it("returns json representation of statistics when exist", function(done) {
                const expectedStatistics = {
                    guildsCount: GUILDS_COUNT,
                    soundsCount: SOUNDS_COUNT,
                    soundEventsCount: SOUND_EVENTS_COUNT,
                };
                this.sandbox.stub(this.res, "json").callsFake(function(actualStatistics) {
                    jacquesTestUtils.expectResponseJson(expectedStatistics, actualStatistics, done);
                });
                statisticsController.getStatistics({}, this.res);
            });
        });

        describe("when failure", function() {
            beforeEach(function() {
                this.sandbox.stub(guildsRepository, "getGuildsCount").callsFake(function() {
                    return Promise.resolve(GUILDS_COUNT);
                });
                this.sandbox.stub(soundsRepository, "getSoundsCount").callsFake(function() {
                    return Promise.resolve(SOUNDS_COUNT);
                });
                this.sandbox.stub(soundsRepository, "getSoundEventsCount").callsFake(function() {
                    return Promise.reject(STATISTICS_DATABASE_ERROR);
                });
            });

            it("returns 500 when at least one error retrieving statistics", function(done) {
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return jacquesTestUtils.expectResponseStatus(500, status, done);
                });
                statisticsController.getStatistics({}, this.res);
            });
        });
    });
});


