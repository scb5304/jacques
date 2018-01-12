require("dotenv").config({path: require("app-root-path") + "/.env"});

const sinon = require("sinon");
const chai = require("chai");
const messenger = require("./messenger");
const testUtils = require("../../jacques-common/util/test-utils");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("messenger", function() {
    beforeEach(function() {
        this.message = testUtils.createTestDiscordTextChannelMessage();
    });

    describe("sendHelp", function() {
        it("replies to the message", function() {
            const messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendHelp(this.message);
            chai.assert.isTrue(messageSpy.calledOnce);
        });
    });

    describe("printVolume", function() {
        it("replies to the message", function() {
            const messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendHelp(this.message);
            chai.assert.isTrue(messageSpy.calledOnce);
        });
    });
});
