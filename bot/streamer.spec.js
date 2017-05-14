var Discord = require('discord.js');
var sinon = require('sinon');
var chai = require('chai');

var logger = require('./../common/util/logger.js');
var streamer = require('./streamer');
var Db = require('./../common/data/db.js');
var config = require('./../config.json');

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore()
});

describe("streamAudio", function() {
    beforeEach(function() {
        this.message = {};
        this.message.member = {};
        this.message.member.voiceChannel = {
            join: function() {
                return new Promise(function(resolve, reject) {
                    return reject("It's only a test.");
                });
            }
        };
    });

    it("does not join the voice channel when no stream link is passed", function() {
        var streamLink;

        var joinVoiceChannelSpy = this.sandbox.spy(this.message.member.voiceChannel, "join");
        streamer.streamAudio(this.message.member.voiceChannel, streamLink);

        chai.assert.isFalse(joinVoiceChannelSpy.called);
    });

    it("joins the voice channel when a stream link is passed", function() {
        var streamLink = "https://www.youtube.com/watch?v=vWiq-75tl7g";

        var joinVoiceChannelSpy = this.sandbox.spy(this.message.member.voiceChannel, "join");
        streamer.streamAudio(this.message.member.voiceChannel, streamLink);

        chai.assert.isTrue(joinVoiceChannelSpy.called);
    });
});
