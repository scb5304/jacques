require("dotenv").config({path: require("app-root-path") + "/.env"});

const sinon = require("sinon");
const userController = require("./users-controller");
const jacquesTestUtils = require("../../jacques-common/util/test-utils");
const moment = require("moment");

const usersRepository = require("../../jacques-common/data/users/users-repository");
const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("user-controller", function() {

    beforeEach(function() {
        this.res = {
            json: function() {},
            status: function() {}
        };
    });

    describe("getUser", function() {
        describe("user is not in database", function() {
            beforeEach(function() {
                this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
                    return Promise.resolve(undefined);
                });
            });

            it("returns with a status of 404", function(done) {
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return jacquesTestUtils.expectResponseStatus(404, status, done)
                });
                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });
        });

        describe("user is in database", function() {
            const expectedUser = {
                discord_last_guild_id: "1000",
                discord_last_guild_name: "Jelly Spotters",
                birdfeed_date_time: moment().add(24, "hours"),
                toObject: function() {
                    return this;
                }
            };

            const expectedGuild = {
                toObject: function() {
                    return this;
                }
            };

            beforeEach(function() {
                this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
                    return Promise.resolve(expectedUser);
                });
            });

            it("returns user if the guild also exists", function(done) {
                this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                    return Promise.resolve(expectedGuild);
                });
                this.sandbox.stub(this.res, "json").callsFake(function(actualUser) {
                    jacquesTestUtils.expectResponseJson(expectedUser, actualUser, done)
                });

                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });

            it("returns 500 error if the guild doesn't exist", function(done) {
                this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                    return Promise.resolve(undefined);
                });
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return jacquesTestUtils.expectResponseStatus(500, status, done)
                });

                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });

            it("returns 500 error if there was a problem getting the guild for this user", function(done) {
                this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                    return Promise.reject("Database is spaghetti.");
                });
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return jacquesTestUtils.expectResponseStatus(500, status, done)
                });

                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });
        });
    });
});


