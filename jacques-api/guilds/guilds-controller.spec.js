require("dotenv").config({path: require("app-root-path") + "/.env"});

const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");
const sinon = require("sinon");
const guildController = require("./guilds-controller");
const jacquesTestUtils = require("../../jacques-common/util/test-utils");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("guild-controller", function() {
    beforeEach(function() {
        this.res = {
            json: function() {},
            status: function() {}
        };
    });

    describe("getGuild", function() {
        it("returns 404 when guild doesn't exist.", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.resolve();
            });

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return jacquesTestUtils.expectApiResponseStatus(404, status, done);
            });
            guildController.getGuild({params: {guild: "1001"}}, this.res);
        });

        it("returns 500 when database error getting guild.", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.reject("Mock database error.");
            });

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return jacquesTestUtils.expectApiResponseStatus(500, status, done);
            });
            guildController.getGuild({params: {guild: "1001"}}, this.res);
        });

        it("returns json representation of guild when exists", function(done) {
            var expectedGuild = {discord_id: "1001"};
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return new Promise((resolve) => {
                    return resolve(expectedGuild);
                });
            });

            this.sandbox.stub(this.res, "json").callsFake(function(actualGuild) {
                jacquesTestUtils.expectApiResponseJson(expectedGuild, actualGuild, done);
            });
            guildController.getGuild({params: expectedGuild.discord_id}, this.res);
        });
    });

    describe("getGuilds", function() {
        it("returns 500 when database error getting guilds.", function (done) {
            this.sandbox.stub(guildsRepository, "getAllGuilds").callsFake(function () {
                return Promise.reject("Mock database error.");
            });

            this.sandbox.stub(this.res, "status").callsFake(function (status) {
                return jacquesTestUtils.expectApiResponseStatus(500, status, done);
            });
            guildController.getGuilds({}, this.res);
        });


        it("returns json representation of guilds when exist", function(done) {
            var expectedGuilds = [{discord_id: "1001"}];
            this.sandbox.stub(guildsRepository, "getAllGuilds").callsFake(function() {
                return Promise.resolve(expectedGuilds);
            });

            this.sandbox.stub(this.res, "json").callsFake(function(actualGuilds) {
                jacquesTestUtils.expectApiResponseJson(expectedGuilds, actualGuilds, done);
            });
            guildController.getGuilds({}, this.res);
        });
    });
});


