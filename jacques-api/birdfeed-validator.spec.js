require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const moment = require("moment");
const testUtils = require("../jacques-common/util/test-utils");
const logger = require("../jacques-common/util/logger");
const usersRepository = require("../jacques-common/data/users/users-repository");
const birdfeedValidator = require("../jacques-api/birdfeed-validator");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("birdfeed-validator", function() {
    let testError = "Test error!";
    let self;
    beforeEach(function() {
        this.res = {
            json: function() {},
            status: function() {}
        };
        this.testBirdfeed = testUtils.createTestBirdfeed();
        this.testUser = testUtils.createTestJacquesUser();
        self = this;
    });

    it("returns a 400 if a user with this birdfeed doesn't exist in the database", function(done) {
        this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
            return Promise.resolve(undefined);
        });
        this.sandbox.stub(this.res, "status").callsFake(function(status) {
            return testUtils.expectApiResponseStatus(400, status, done);
        });

        birdfeedValidator.validateBirdfeedInRequest(this.testBirdfeed, this.res).then(function() {
            throw "Resolve should not have been called when no user existed";
        }).catch(logger.error);
    });

    it("returns a 500 if there was an error querying for a user from the database", function(done) {
        this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
            return Promise.reject(testError);
        });
        this.sandbox.stub(this.res, "status").callsFake(function(status) {
            return testUtils.expectApiResponseStatus(500, status, done);
        });

        birdfeedValidator.validateBirdfeedInRequest(this.testBirdfeed, this.res).catch(logger.error);
    });

    it("returns a user if the user exists and birdfeed is fresh", function(done) {
        this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
            //5 minutes in the future will ensure it's not considered sale
            self.testUser.birdfeed_date_time = moment().add(5, "minutes");
            return Promise.resolve(self.testUser);
        });

        birdfeedValidator.validateBirdfeedInRequest(this.testBirdfeed, this.res).then(function(user) {
            assert.deepEqual(user, self.testUser);
            done();
        }).catch(logger.error);
    });

    it("does not return a user if the user exists but birdfeed is stale", function(done) {
        this.sandbox.stub(usersRepository, "getUserFromBirdfeed").callsFake(function() {
            //3 hours in the past will ensure it's considered sale
            self.testUser.birdfeed_date_time = moment().subtract(3, "hours");
            return Promise.resolve(self.testUser);
        });
        this.sandbox.stub(this.res, "status").callsFake(function(status) {
            return testUtils.expectApiResponseStatus(403, status, done);
        });

        birdfeedValidator.validateBirdfeedInRequest(this.testBirdfeed, this.res).catch(logger.error);
    });
});
