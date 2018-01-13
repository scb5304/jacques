require("dotenv").config({path: require("app-root-path") + "/.config/.env"});

const sinon = require("sinon");
const userController = require("./users-controller");
const testUtils = require("../../jacques-common/util/test-utils");

const usersRepository = require("../../jacques-common/data/users/users-repository");
const guildsRepository = require("../../jacques-common/data/guilds/guilds-repository");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("user-controller", function() {
    let self;
    beforeEach(function() {
        this.res = {
            json: function() {},
            status: function() {}
        };
        this.testJacquesUser = testUtils.createTestJacquesUser();
        this.testJacquesGuild = testUtils.createTestJacquesGuild();
        self = this;
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
                    return testUtils.expectApiResponseStatus(404, status, done)
                });
                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });
        });

        describe("user is in database", function() {
            beforeEach(function() {
                this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
                    return Promise.resolve(self.testJacquesUser);
                });
            });

            it("returns user if the guild also exists", function(done) {
                this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                    return Promise.resolve(self.testJacquesGuild);
                });
                this.sandbox.stub(this.res, "json").callsFake(function(actualUser) {
                    testUtils.expectApiResponseJson(self.testJacquesUser, actualUser, done);
                });

                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });

            it("returns 500 error if the guild doesn't exist", function(done) {
                this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                    return Promise.resolve(undefined);
                });
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(500, status, done)
                });

                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });

            it("returns 500 error if there was a problem getting the guild for this user", function(done) {
                this.sandbox.stub(guildsRepository, "getGuildById").callsFake(function() {
                    return Promise.reject("Database is spaghetti.");
                });
                this.sandbox.stub(this.res, "status").callsFake(function(status) {
                    return testUtils.expectApiResponseStatus(500, status, done)
                });

                userController.getUser({params: {birdfeed: "testBirdfeed"}}, this.res);
            });
        });
    });
});


