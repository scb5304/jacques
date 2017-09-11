require("dotenv").config({path: require("app-root-path") + "/.env"});

var Discord = require("discord.js");
var sinon = require("sinon");
var chai = require("chai");

var logger = require("./../common/util/logger.js");
var streamer = require("./streamer");
var Db = require("./../common/data/db.js");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("streamer", function() {
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

    describe("streamAudio", function() {
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

    describe("calculateStreamSeekSeconds", function() {
        it("calculates the number of seconds when only seconds are provided", function() {
            var streamLink = "https://youtu.be/jwu2y9x5OlM?t=19s";

            var seconds = streamer.calculateStreamSeekSeconds(streamLink);
            chai.assert.equal(seconds, 19);
        });

        it("calculates the number of seconds when only minutes are provided", function() {
            var streamLink = "https://youtu.be/jwu2y9x5OlM?t=1m";

            var seconds = streamer.calculateStreamSeekSeconds(streamLink);
            chai.assert.equal(seconds, 60);
        });

        it("calculates the number of seconds when both seconds and minutes are provided", function() {
            var streamLink = "https://youtu.be/jwu2y9x5OlM?t=2m24s";

            var seconds = streamer.calculateStreamSeekSeconds(streamLink);
            chai.assert.equal(seconds, 144);
        });
    });
});
