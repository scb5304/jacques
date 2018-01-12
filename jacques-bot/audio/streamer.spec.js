require("dotenv").config({path: require("app-root-path") + "/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const ytdl = require("ytdl-core");
const streamer = require("./streamer");
const testUtils = require("../../jacques-common/util/test-utils");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("streamer", function() {
    beforeEach(function() {
        this.sandbox.stub(ytdl, "getInfo").callsFake(function(stream, callback) {
            callback(undefined, {});
        });
        this.message = testUtils.createTestDiscordTextChannelMessage();
    });

    describe("streamAudio", function() {
        function assertStreamStartsAt(guildMember, seconds, done) {
            const mockConnection = {
                playStream: function (ytdlStream, options) {
                    assert.equal(options.seek, seconds);
                    done();
                    return {
                        once: function () {
                        }
                    };
                }
            };
            guildMember.voiceChannel = {
                join: function() {
                    return new Promise(function(resolve) {
                        return resolve(mockConnection);
                    });
                }
            };
        }

        it("does not join the voice channel when no stream link is passed", function() {
            const streamLink = null;
            const joinVoiceChannelSpy = this.sandbox.spy(this.message.member.voiceChannel, "join");
            streamer.streamAudio(this.message.member.voiceChannel, 50, streamLink);
            assert.isFalse(joinVoiceChannelSpy.called);
        });

        it("joins the voice channel when a stream link is passed", function() {
            const streamLink = "https://www.youtube.com/watch?v=Pp7-iPOZMog";
            const joinVoiceChannelSpy = this.sandbox.spy(this.message.member.voiceChannel, "join");
            streamer.streamAudio(this.message.member.voiceChannel, 50, streamLink);

            assert.isTrue(joinVoiceChannelSpy.called);
        });

        it("joins at the passed time with seconds argument", function(done) {
            const streamLink = "https://www.youtube.com/watch?v=Pp7-iPOZMog&t=10s";
            assertStreamStartsAt(this.message.member, 10, done);
            streamer.streamAudio(this.message.member.voiceChannel, 50, streamLink);
        });

        it("joins at the passed time with minutes seconds argument", function(done) {
            const streamLink = "https://youtu.be/Pp7-iPOZMog?t=30m43s";
            assertStreamStartsAt(this.message.member, 1843, done);
            streamer.streamAudio(this.message.member.voiceChannel, 50, streamLink);
        });

        it("joins at the passed time with hours minutes seconds argument", function(done) {
            const streamLink = "https://youtu.be/hcJsYFdke1o?t=1h11m22s";
            assertStreamStartsAt(this.message.member, 4282, done);
            streamer.streamAudio(this.message.member.voiceChannel, 50, streamLink);
        });
    });
});
