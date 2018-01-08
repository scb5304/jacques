require("dotenv").config({path: require("app-root-path") + "/.env"});
const Discord = require("discord.js");
const sinon = require("sinon");
const chai = require("chai");
const jacques = require("../core/jacques-core");
const soundboard = require("../modules/soundboard");
const messenger = require("../modules/messenger");
const prefix = process.env.JACQUES_PREFIX;

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("onMessage", function() {

    beforeEach(function() {
        this.message = {};
        this.message.guild = {};
        this.message.channel = Object.create(Discord.TextChannel.prototype);
        this.message.member = {};
        this.message.author = {};
        this.message.member.voiceChannel = {leave: function() {}};
        // noinspection JSAnnotator
        this.message.member.voiceChannel.connection = {disconnect: function() {}};

        this.message.member.displayName = "Steubenville";
        this.message.member.voiceChannel.name = "Weenie Hut General";
        this.message.channel.name = "commands";
        this.message.guild.name = "The Jelly Spotters";
    });

    describe("not valid jacques messages", function() {
        it("routes a direct channel message to send help message", function() {
            const messengerStub = this.sandbox.stub(messenger, "sendHelp");
            jacques.setClientInstance({user: {username: "Jacques"}});

            this.message.author.username = "Steve";
            this.message.content = "Hey what's up?";
            this.message.channel = new Discord.DMChannel(undefined, undefined);

            const routed = jacques.onMessage(this.message);
            chai.assert.isTrue(routed); //Was successfully routed
            sinon.assert.calledWith(messengerStub, this.message); //Called the messenger to send help
            jacques.setClientInstance(null);
        });

        it("does not route a message if does not start with prefix", function() {
            this.message.content = "Hey what's up?";
            const routed = jacques.onMessage(this.message);
            chai.assert.isFalse(routed); //Was not successfully routed
        });

        it("does not route a message if it does not have a guild member", function() {
            this.message.member = null;
            this.message.content = prefix + "questionforye";
            const routed = jacques.onMessage(this.message);
            chai.assert.isFalse(routed); //Was not successfully routed
        });
    });

    describe("playing random sounds", function() {
        beforeEach(function() {
            this.sandbox.stub(messenger);
        });

        it("does not route prefix to play random sound if user not in a voice channel", function() {
            const soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.member.voiceChannel = null;
            this.message.content = prefix;

            jacques.onMessage(this.message);
            sinon.assert.notCalled(soundboardStub);
        });

        it("routes prefix to play a random sound", function() {
            const soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.content = prefix;

            jacques.onMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message);
        });

        it("routes prefix with whitespaces to play a random sound", function() {
            const soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.content = " " + prefix + "  ";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message);
        });
    });

    describe("playing targeted sounds", function() {
        it("routes prefix mySound to play targeted sound mySound", function() {
            const soundboardStub = this.sandbox.stub(soundboard, "playTargetedSound");
            const soundName = "mySound";
            this.message.content = prefix + soundName;

            jacques.onMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message, soundName);
        });

        it("routes prefix mySound with whitespaces to play targeted sound mySound", function() {
            const soundboardStub = this.sandbox.stub(soundboard, "playTargetedSound");
            const soundName = "mySound";
            this.message.content = "   " + prefix + soundName + " ";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(soundboardStub, this.message, soundName);
        });
    });

    describe("sending help messages", function() {
        it("routes prefix help to send a help message", function() {
            const messengerStub = this.sandbox.stub(messenger, "sendHelp");
            this.message.content = prefix + "help";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(messengerStub, this.message);
        });

        it("routes prefix sounds to send a help message", function() {
            const messengerStub = this.sandbox.stub(messenger, "sendHelp");
            this.message.content = prefix + "sounds";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(messengerStub, this.message);
        });
    });

    describe("canceling jacques", function() {
        it("routes prefix cancel to cancel current voice connection", function() {
            this.message.content = prefix + "cancel";
            const disconnectSpy = this.sandbox.spy(this.message.member.voiceChannel.connection, "disconnect");

            jacques.onMessage(this.message);
            chai.assert.isTrue(disconnectSpy.called);
        });
        it("routes prefix byejacques to cancel current voice connection", function() {
            this.message.content = prefix + "byejacques";
            const disconnectSpy = this.sandbox.spy(this.message.member.voiceChannel.connection, "disconnect");

            jacques.onMessage(this.message);
            chai.assert.isTrue(disconnectSpy.called);
        });
    });
});
