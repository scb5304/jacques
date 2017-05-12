var Discord = require('discord.js');
var sinon = require('sinon');
var chai = require('chai');
var assert = sinon.assert;

var logger = require('./../common/util/logger.js');
var jacques = require('./jacques');
var soundboard = require('./soundboard');
var streamer = require('./streamer');
var messenger = require('./messenger');
var config = require('./../config.json');

//https://blog.risingstack.com/node-hero-node-js-unit-testing-tutorial/
//http://sinonjs.org/releases/v1.17.7/mocks/

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    console.info("\r\n");
})

afterEach(function() {
    this.sandbox.restore()
})

describe('onTextChannelMessage', function() {
    beforeEach(function() {
        this.message = sinon.mock(Discord.Message);
        this.message.channel = sinon.mock(Discord.TextChannel);
        this.message.member = sinon.mock(Discord.Member);
        this.message.member.voiceChannel = sinon.mock(Discord.VoiceChannel);
        this.sandbox.stub(messenger, "deleteMessage");
    })

    describe('playing random sounds', function() {
        it('routes ! to nothing if user not in a voice channel', function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.member.voiceChannel = null;
            this.message.content = config.prefix;

            jacques.onTextChannelMessage(this.message);
            assert.notCalled(soundboardStub);
        });

        it('routes ! to play a random sound', function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.content = config.prefix;

            jacques.onTextChannelMessage(this.message);
            assert.calledWith(soundboardStub, this.message);
        });

        it('routes ! with whitespaces to play a random sound', function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
            this.message.content = " " + config.prefix + "  ";

            jacques.onTextChannelMessage(this.message);
            assert.calledWith(soundboardStub, this.message);
        });
    });

    describe('playing targeted sounds', function() {
        it('routes !mySound to play a targeted sound', function() {
            var soundboardStub = this.sandbox.stub(soundboard, "playTargetedSound");
            var soundName = "mySound";
            this.message.content = config.prefix + soundName;

            jacques.onTextChannelMessage(this.message);
            assert.calledWith(soundboardStub, this.message, soundName);
        });
    });
})
