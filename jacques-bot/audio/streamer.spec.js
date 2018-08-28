require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
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
        this.sandbox.stub(ytdl, "getBasicInfo").callsFake(function(stream, callback) {
            callback(undefined, {});
        });
        this.message = testUtils.createTestDiscordTextChannelMessage();
        this.voiceConnection = testUtils.createTestDiscordVoiceConnection();
    });

    describe("streaming audio", function() {
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

        it("leaves after the 'end' event is emitted", function(done) {
            let testDispatcher = {
                once: function(event, callback) {
                    if (event === "end") {
                        callback();
                    }
                }
            };

            //Returned when we join a voice channel. Used to play streams, supplying the test dispatcher.
            //The test is successful if we disconnect, which should occur upon the 'end' event being emitted.
            let testConnection = {
                playStream: function() {return testDispatcher;},
                disconnect: function() {done();}
            };
            this.message.member.voiceChannel.join = function() {
                return Promise.resolve(testConnection);
            };
            streamer.streamAudio(this.message.member.voiceChannel, 50, "https://youtu.be/hcJsYFdke1o")
        });

        it("leaves after the 'error' event is emitted", function(done) {
            let testDispatcher = {
                once: function(event, callback) {
                    if (event === "error") {
                        callback();
                    }
                }
            };

            //Returned when we join a voice channel. Used to play streams, supplying the test dispatcher.
            //The test is successful if we disconnect, which should occur upon the 'error' event being emitted.
            let testConnection = {
                playStream: function() {return testDispatcher;},
                disconnect: function() {done();}
            };
            this.message.member.voiceChannel.join = function() {
                return Promise.resolve(testConnection);
            };
            streamer.streamAudio(this.message.member.voiceChannel, 50, "https://youtu.be/hcJsYFdke1o")
        });
    });

    describe("changing the volume", function() {
        it("doesn't actually change when the requested volume isn't a number", function() {
            const setVolumeSpy = this.sandbox.spy(this.voiceConnection.player.dispatcher, "setVolumeLogarithmic");
            streamer.changeVolume(this.message, "hello", this.voiceConnection);
            assert.isFalse(setVolumeSpy.called);
        });

        it("changes the volume to the requested value / 100", function() {
            const setVolumeSpy = this.sandbox.spy(this.voiceConnection.player.dispatcher, "setVolumeLogarithmic");
            streamer.changeVolume(this.message, 67, this.voiceConnection);
            sinon.assert.calledWith(setVolumeSpy, 0.67);
        });

        it("changes the volume to 1 when the requested value would be over 1", function() {
            const setVolumeSpy = this.sandbox.spy(this.voiceConnection.player.dispatcher, "setVolumeLogarithmic");
            streamer.changeVolume(this.message, 200, this.voiceConnection);
            sinon.assert.calledWith(setVolumeSpy, 1);
        });

        it("sets the volume immediately after the 'speaking' event is emitted", function(done) {
            let testDispatcher = {
                once: function(event, callback) {
                    if (event === "speaking") {
                        callback();
                    }
                },
                setVolumeLogarithmic: function(volume) {
                    assert.equal(volume, 50);
                    done();
                }
            };

            //Returned when we join a voice channel. Used to play streams, supplying the test dispatcher.
            //The test is successful if we set the volume, which should occur upon the 'speaking' event being emitted.
            let testConnection = {
                playStream: function() {return testDispatcher;},
            };
            this.message.member.voiceChannel.join = function() {
                return Promise.resolve(testConnection);
            };
            streamer.streamAudio(this.message.member.voiceChannel, 50, "https://youtu.be/hcJsYFdke1o")
        });
    });
});
