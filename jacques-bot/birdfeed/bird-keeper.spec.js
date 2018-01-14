require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const birdkeeper = require("./bird-keeper");
const testUtils = require("../../jacques-common/util/test-utils");
const usersRepository = require("../../jacques-common/data/users/users-repository");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("bird-keeper", function() {
    beforeEach(function() {
        this.guildMember = testUtils.createTestDiscordGuildMember();
    });

    describe("verifying upload permissions", function() {
        it("returns true if the guild member has all permissions checked", function() {
            this.guildMember.hasPermission = function() {
                return true;
            };
            let hasPermissions = birdkeeper.userHasUploadPermissions(this.guildMember);
            assert.isTrue(hasPermissions);
        });

        it("returns false if the guild member does not have all permissions checked", function() {
            this.guildMember.hasPermission = function() {
                return false;
            };
            let hasPermissions = birdkeeper.userHasUploadPermissions(this.guildMember);
            assert.isFalse(hasPermissions);
        });

        it("returns false if an exception is thrown verifying permissions", function() {
            this.guildMember.hasPermission = function() {
                throw "Gosh darnit!";
            };
            let hasPermissions = birdkeeper.userHasUploadPermissions(this.guildMember);
            assert.isFalse(hasPermissions);
        });
    });

    describe("generating birdfeed tokens", function() {
        it("upserts the user and returns a generated token", function(done) {
            this.sandbox.stub(usersRepository, "upsertUserWithDiscordDataAndToken").callsFake(function(guildMember, token) {
                assert.isDefined(token);
                return Promise.resolve(token);
            });
            birdkeeper.createBirdfeedForGuildMember(this.guildMember).then(function(tokenGenerated) {
                assert.isDefined(tokenGenerated);
                done();
            });
        });

        it("rejects with an error when a database error occurs", function(done) {
            this.sandbox.stub(usersRepository, "upsertUserWithDiscordDataAndToken").callsFake(function() {
                return Promise.reject();
            });
            birdkeeper.createBirdfeedForGuildMember(this.guildMember).then(function(tokenGenerated) {
                testUtils.throwUnexpectedResolveWhen("a database error occurs");
            }).catch(function() {
                done();
            });
        });
    });
});
