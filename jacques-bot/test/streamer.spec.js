require("dotenv").config({path: require("app-root-path") + "/.env"});

const sinon = require("sinon");
const chai = require("chai");
const streamer = require("../modules/streamer");
const ytdl = require("ytdl-core");

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
        function assertStreamStartsAt (guildMember, seconds, done) {
            const mockConnection = {
                playStream: function (ytdlStream, options) {
                    chai.assert.equal(options.seek, seconds);
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

            chai.assert.isFalse(joinVoiceChannelSpy.called);
        });

        it("joins the voice channel when a stream link is passed", function() {
            const streamLink = "https://www.youtube.com/watch?v=Pp7-iPOZMog";
            this.sandbox.stub(ytdl, "getInfo").callsFake(function(link, callback) {
                callback(null, {});
            });

            const joinVoiceChannelSpy = this.sandbox.spy(this.message.member.voiceChannel, "join");
            streamer.streamAudio(this.message.member.voiceChannel, 50, streamLink);

            chai.assert.isTrue(joinVoiceChannelSpy.called);
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
