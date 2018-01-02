require("dotenv").config({path: require("app-root-path") + "/.env"});

var sinon = require("sinon");
var chai = require("chai");
var messenger = require("./../messenger");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("messenger", function() {
    beforeEach(function() {
        this.message = {
            reply: function() {
                return new Promise(function(resolve) {
                    return resolve();
                });
            }
        };
    });

    describe("sendHelp", function() {
        it("replies to the message", function() {
            var messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendHelp(this.message);
            chai.assert.isTrue(messageSpy.calledOnce);
        });
    });

    describe("printVolume", function() {
        it("replies to the message", function() {
            var messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendHelp(this.message);
            chai.assert.isTrue(messageSpy.calledOnce);
        });
    });
});
