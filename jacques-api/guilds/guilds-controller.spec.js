require("dotenv").config({path: require("app-root-path") + "/.env"});
const sinon = require("sinon");
const testUtils = require("../../jacques-common/util/test-utils");
const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");
const guildController = require("./guilds-controller");

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
        this.testJacquesGuild = testUtils.createTestJacquesGuild();
    });

    describe("getGuild", function() {
        it("returns 404 when guild doesn't exist.", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.resolve();
            });
            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(404, status, done);
            });
            guildController.getGuild({params: {guild: this.testJacquesGuild.discord_id}}, this.res);
        });

        it("returns 500 when database error getting guild.", function(done) {
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.reject("Mock database error.");
            });

            this.sandbox.stub(this.res, "status").callsFake(function(status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });
            guildController.getGuild({params: {guild: this.testJacquesGuild.discord_id}}, this.res);
        });

        it("returns json representation of guild when exists", function(done) {
            var self = this;
            this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                return Promise.resolve(self.testJacquesGuild);
            });

            this.sandbox.stub(this.res, "json").callsFake(function(actualGuild) {
                testUtils.expectApiResponseJson(self.testJacquesGuild, actualGuild, done);
            });
            guildController.getGuild({params: this.testJacquesGuild.discord_id}, this.res);
        });
    });

    describe("getGuilds", function() {
        it("returns 500 when database error getting guilds.", function (done) {
            this.sandbox.stub(guildsRepository, "getAllGuilds").callsFake(function () {
                return Promise.reject("Mock database error.");
            });

            this.sandbox.stub(this.res, "status").callsFake(function (status) {
                return testUtils.expectApiResponseStatus(500, status, done);
            });
            guildController.getGuilds({}, this.res);
        });


        it("returns json representation of guilds when exist", function(done) {
            var expectedGuilds = [this.testJacquesGuild];
            this.sandbox.stub(guildsRepository, "getAllGuilds").callsFake(function() {
                return Promise.resolve(expectedGuilds);
            });

            this.sandbox.stub(this.res, "json").callsFake(function(actualGuilds) {
                testUtils.expectApiResponseJson(expectedGuilds, actualGuilds, done);
            });
            guildController.getGuilds({}, this.res);
        });
    });
});


