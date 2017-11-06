require("dotenv").config({path: require("app-root-path") + "/.env"});

var sinon = require("sinon");
var chai = require("chai");
var jacques = require("./../jacques");
var soundboard = require("./../soundboard");
var messenger = require("./../messenger");
var Db = require("./../../common/data/db.js");
var prefix = process.env.JACQUES_PREFIX;

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("onTextChannelMessage", function() {

    beforeEach(function() {
        this.message = {};
        this.message.guild = {};
        this.message.channel = {};
        this.message.member = {};
        this.message.member.voiceChannel = {};
        this.message.member.voiceChannel.connection = {disconnect: function() {}};

        this.message.member.displayName = "Steubenville";
        this.message.member.voiceChannel.name = "Weenie Hut General";
        this.message.channel.name = "commands";
        this.message.guild.name = "The Jelly Spotters";
    });

    describe("not valid jacques messages", function() {
        it("does not route a message if does not start with prefix", function() {
            this.message.content = "Hey what's up?";
            var routed = jacques.onTextChannelMessage(this.message);
            chai.assert.isFalse(routed);
        });

        it("does not route a message if it does not have a guild member", function() {
            this.message.member = null;
            this.message.content = prefix + "questionforye";
            var routed = jacques.onTextChannelMessage(this.message);
            chai.assert.isFalse(routed);
        });
    });

    describe("playing random sounds", function() {
        it("does not route prefix if user not in a voice channel", function() {
            this.message.member.voiceChannel = null;
            this.message.content = prefix;

            var routed = jacques.onTextChannelMessage(this.message);
            chai.assert.isFalse(routed);
        });

        it("routes prefix to play a random sound", function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.content = prefix;

            jacques.onTextChannelMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message);
        });

        it("routes prefix with whitespaces to play a random sound", function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.content = " " + prefix + "  ";

            jacques.onTextChannelMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message);
        });
    });

    describe("playing targeted sounds", function() {
        it("routes prefix mySound to play targeted sound mySound", function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playTargetedSound");
            var soundName = "mySound";
            this.message.content = prefix + soundName;

            jacques.onTextChannelMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message, soundName);
        });

        it("routes prefix mySound with whitespaces to play targeted sound mySound", function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playTargetedSound");
            var soundName = "mySound";
            this.message.content = "   " + prefix + soundName + " ";

            jacques.onTextChannelMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message, soundName);
        });
    });

    describe("sending help messages", function() {
        it("routes prefix help to send a help message", function() {
            var messengerStub = this.sandbox.stub(messenger, "sendHelp");
            this.message.content = prefix + "help";

            jacques.onTextChannelMessage(this.message);
            sinon.assert.calledWith(messengerStub, this.message);
        });

        it("routes prefix sounds to send a help message", function() {
            var messengerStub = this.sandbox.stub(messenger, "sendHelp");
            this.message.content = prefix + "sounds";

            jacques.onTextChannelMessage(this.message);
            sinon.assert.calledWith(messengerStub, this.message);
        });

        it("routes prefix helptext to send a list of sounds", function(done) {
            var self = this;
            var stubbedSounds = ["dunkeroni", "spaghetti", "fif", "nicememe"];

            this.sandbox.stub(messenger, "sendSounds").callsFake(function(message, sounds) {
                chai.expect(message).to.equal(self.message);
                chai.expect(sounds).to.equal(stubbedSounds);
                done();
            });

            this.sandbox.stub(Db, "getAllSounds").callsFake(function() {
                return new Promise(function(resolve) {
                    return resolve(stubbedSounds);
                });
            });
            this.message.content = prefix + "helptext";
            jacques.onTextChannelMessage(this.message);
        });
    });

    describe("canceling jacques", function() {
        it("routes prefix cancel to cancel current voice connection", function() {
            this.message.content = prefix + "cancel";
            var disconnectSpy = this.sandbox.spy(this.message.member.voiceChannel.connection, "disconnect");

            jacques.onTextChannelMessage(this.message);
            chai.assert.isTrue(disconnectSpy.called);
        });
        it("routes prefix byejacques to cancel current voice connection", function() {
            this.message.content = prefix + "byejacques";
            var disconnectSpy = this.sandbox.spy(this.message.member.voiceChannel.connection, "disconnect");

            jacques.onTextChannelMessage(this.message);
            chai.assert.isTrue(disconnectSpy.called);
        });
    });
});
