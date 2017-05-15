require('dotenv').config({path: './../.env'});
var Discord = require('discord.js');
var sinon = require('sinon');
var chai = require('chai');

var logger = require('./../common/util/logger.js');
var messenger = require('./messenger');
var Db = require('./../common/data/db.js');

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore()
});

describe("messenger", function() {
    beforeEach(function() {
        this.message = {
            reply: function() {
                return new Promise(function(resolve, reject) {
                    return resolve();
                });
            }
        };
    });

    describe("sendSounds", function() {
        it("replies to the message once for 1500 characters", function() {
            var sounds = [];
            //Add 1500 characters
            while (sounds.length < 150) {
                //10 characters each
                sounds.push({ name: "steven.mp3" });
            }
            var messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendSounds(this.message, sounds);
            chai.assert.isTrue(messageSpy.calledOnce);
        });

        it("replies to the message twice for 3000 characters", function() {
            var sounds = [];
            //Add 3000 characters
            while (sounds.length < 300) {
                //10 characters each
                sounds.push({ name: "steven.mp3" });
            }
            var messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendSounds(this.message, sounds);
            chai.assert.isTrue(messageSpy.calledTwice);
        });

        it("replies to the message thrice for 4500 characters", function() {
            var sounds = [];
            //Add 4500 characters
            while (sounds.length < 450) {
                //10 characters each
                sounds.push({ name: "steven.mp3" });
            }
            var messageSpy = this.sandbox.spy(this.message, "reply");
            messenger.sendSounds(this.message, sounds);
            chai.assert.isTrue(messageSpy.calledThrice);
        });
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
