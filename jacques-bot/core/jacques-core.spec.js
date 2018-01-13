require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const Discord = require("discord.js");
const sinon = require("sinon");
const assert = require("chai").assert;

const testUtils = require("../../jacques-common/util/test-utils");
const jacques = require("./jacques-core");
const soundboard = require("../audio/soundboard");
const streamer = require("../audio/streamer");
const messenger = require("../messaging/messenger");
const guildManager = require("../guilds/guild-leader");
const birdfeedManager = require("../birdfeed/bird-keeper");
const prefix = process.env.JACQUES_PREFIX;

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.message = testUtils.createTestDiscordTextChannelMessage();
    this.message.channel = Object.create(Discord.TextChannel.prototype);
    this.message.channel.name = "commands";
    this.bot = testUtils.createTestDiscordClient();
    jacques.setClientInstance(this.bot);
});

afterEach(function() {
    this.sandbox.restore();
    jacques.setClientInstance(undefined);
});

describe("logging in", function() {
    beforeEach(function() {
        this.bot.guilds = new Discord.Collection();
    });

    it("refreshes guilds when the discord client instance was properly set", function() {
        var guildManagerStub = this.sandbox.stub(guildManager, "refreshGuilds");
        jacques.onLoggedIn();
        jacques.onReady();
        sinon.assert.calledOnce(guildManagerStub);
    });

    it("does not refresh guilds when the discord client instance wasn't set", function() {
        jacques.setClientInstance(undefined);
        var guildManagerStub = this.sandbox.stub(guildManager, "refreshGuilds");
        jacques.onLoggedIn();
        sinon.assert.notCalled(guildManagerStub);
    });
});

describe("guild events", function() {
    beforeEach(function() {
        this.bot.guilds = new Discord.Collection();
    });

    it("refreshes guilds when one is created", function() {
        var guildManagerStub = this.sandbox.stub(guildManager, "refreshGuilds");
        jacques.onGuildCreate();
        sinon.assert.calledOnce(guildManagerStub);
    });

    it("refreshes guilds when one is removed", function() {
        var guildManagerStub = this.sandbox.stub(guildManager, "refreshGuilds");
        jacques.onGuildDelete();
        sinon.assert.calledOnce(guildManagerStub);
    });
});

describe("onMessage", function() {
    describe("direct messages", function() {
        beforeEach(function() {
            this.message.channel = Object.create(Discord.DMChannel.prototype);
        });

        it("routes a direct channel message to send help message", function() {
            const messengerStub = this.sandbox.stub(messenger, "sendHelp");
            const routed = jacques.onMessage(this.message);
            assert.isTrue(routed); //Was successfully routed
            sinon.assert.calledWith(messengerStub, this.message); //Called the messenger to send help
        });

        it ("ignores direct channel messages from Jacques himself", function() {
            this.message.author.username = "Jacques";
            const routed = jacques.onMessage(this.message);
            assert.isFalse(routed); //Was not successfully routed
        });
    });

    describe("not valid jacques text channel messages", function() {
        it("does not route a message if does not start with prefix", function() {
            const routed = jacques.onMessage(this.message);
            assert.isFalse(routed); //Was not successfully routed
        });

        it("does not route a message if it does not have a guild member", function() {
            this.message.member = null;
            this.message.content = prefix + "questionforye";
            const routed = jacques.onMessage(this.message);
            assert.isFalse(routed); //Was not successfully routed
        });
    });

    describe("playing random sounds", function() {
        beforeEach(function() {
            this.sandbox.stub(messenger);
            this.soundboardStub = this.sandbox.stub(soundboard, "playRandomSound");
        });

        it("does not route prefix to play random sound if user not in a voice channel", function() {
            this.message.member.voiceChannel = null;
            this.message.content = prefix;

            jacques.onMessage(this.message);
            sinon.assert.notCalled(this.soundboardStub);
        });

        it("routes prefix to play a random sound", function() {
            this.message.content = prefix;

            jacques.onMessage(this.message);
            sinon.assert.calledWith(this.soundboardStub, this.message);
        });

        it("routes prefix with whitespaces to play a random sound", function() {
            this.message.content = " " + prefix + "  ";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(this.soundboardStub, this.message);
        });
    });

    describe("playing targeted sounds", function() {
        beforeEach(function() {
            this.soundboardStub = this.sandbox.stub(soundboard, "playTargetedSound");
        });

        it("routes prefix mySound to play targeted sound mySound", function() {
            const soundName = "mySound";
            this.message.content = prefix + soundName;

            jacques.onMessage(this.message);
            sinon.assert.calledWith(this.soundboardStub, this.message, soundName);
        });

        it("routes prefix mySound with whitespaces to play targeted sound mySound", function() {
            const soundName = "mySound";
            this.message.content = "   " + prefix + soundName + " ";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(this.soundboardStub, this.message, soundName);
        });
    });

    describe("sending help messages", function() {
        beforeEach(function() {
            this.messengerStub = this.sandbox.stub(messenger, "sendHelp");
        });

        it("routes prefix help to send a help message", function() {
            this.message.content = prefix + "help";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(this.messengerStub, this.message);
        });

        it("routes prefix sounds to send a help message", function() {
            this.message.content = prefix + "sounds";

            jacques.onMessage(this.message);
            sinon.assert.calledWith(this.messengerStub, this.message);
        });
    });

    describe("streaming youtube videos", function() {
        it("routes prefix stream to stream the passed youtube video", function(done) {
            this.sandbox.stub(streamer, "streamAudio").callsFake(function() {
                done();
            });
            this.sandbox.stub(guildManager, "getGuildVolume").callsFake(function() {
                return Promise.resolve(0.05);
            });
            this.message.content = prefix + "stream";
            jacques.onMessage(this.message);
        });

        it("doesn't stream a video if jacques is already speaking, and instead sends a reply", function() {
            this.message.content = prefix + "stream";
            this.sandbox.stub(this.bot.voiceConnections, "get").callsFake(function() {
                return testUtils.createTestDiscordVoiceConnection();
            });

            const sendReplyStub = this.sandbox.stub(messenger, "replyToMessage");
            const streamAudioSpy = this.sandbox.spy(streamer, "streamAudio");

            jacques.onMessage(this.message);
            sinon.assert.called(sendReplyStub);
            sinon.assert.notCalled(streamAudioSpy);
        });
    });

    describe("canceling jacques", function() {
        beforeEach(function() {
            // noinspection JSAnnotator
            this.message.member.voiceChannel.connection = testUtils.createTestDiscordVoiceConnection();
            this.disconnectSpy = this.sandbox.spy(this.message.member.voiceChannel.connection, "disconnect");
        });

        it("routes prefix cancel to cancel current voice connection", function() {
            this.message.content = prefix + "cancel";
            jacques.onMessage(this.message);
            assert.isTrue(this.disconnectSpy.called);
        });
        it("routes prefix byejacques to cancel current voice connection", function() {
            this.message.content = prefix + "byejacques";
            jacques.onMessage(this.message);
            assert.isTrue(this.disconnectSpy.called);
        });
    });

    describe("volume control", function() {
        it("doesn't change the volume if the user isn't in a voice channel", function() {
            this.message.member.voiceChannel = undefined;
            this.message.content = prefix + "volume 70";
            const updateGuildVolumeSpy = this.sandbox.spy(guildManager, "updateGuildVolume");

            jacques.onMessage(this.message);
            sinon.assert.notCalled(updateGuildVolumeSpy);
        });

        it("prints the volume when no actual volume argument is supplied", function(done) {
            this.message.content = prefix + "volume";
            this.sandbox.stub(guildManager, "getGuildVolume").callsFake(function() {
                return Promise.resolve(0.05);
            });
            this.sandbox.stub(messenger, "printVolume").callsFake(function() {
                done();
            });
            jacques.onMessage(this.message);
        });

        it("changes the volume when a volume argument is supplied", function(done) {
            this.message.content = prefix + "volume 70";
            this.sandbox.stub(messenger, "replyToMessage");
            this.sandbox.stub(guildManager, "updateGuildVolume").callsFake(function() {
                done();
            });
            jacques.onMessage(this.message);
        });
    });

    describe("birdfeed", function() {
        it("doesn't send birdfeed if the message has no author", function() {
            this.message.author = undefined;
            this.message.content = prefix + "birdfeed";
            const hasUploadPermissionsSpy = this.sandbox.spy(birdfeedManager, "userHasUploadPermissions");

            jacques.onMessage(this.message);
            sinon.assert.notCalled(hasUploadPermissionsSpy);
        });

        it("doesn't send birdfeed if the message has no guild member", function() {
            this.message.member = undefined;
            this.message.content = prefix + "birdfeed";
            const hasUploadPermissionsSpy = this.sandbox.spy(birdfeedManager, "userHasUploadPermissions");

            jacques.onMessage(this.message);
            sinon.assert.notCalled(hasUploadPermissionsSpy);
        });

        it("doesn't send birdfeed when the user lacks the upload permission", function() {
            this.message.content = prefix + "birdfeed";
            this.sandbox.stub(birdfeedManager, "userHasUploadPermissions").callsFake(function() {
                return false;
            });
            this.sandbox.stub(messenger, "sendDirectMessage");
            const createBirdfeedSpy = this.sandbox.spy(birdfeedManager, "createBirdfeedForGuildMember");

            jacques.onMessage(this.message);
            sinon.assert.notCalled(createBirdfeedSpy);
        });

        it("sends birdfeed when the user has the upload permission", function(done) {
            this.message.content = prefix + "birdfeed";
            this.sandbox.stub(birdfeedManager, "userHasUploadPermissions").callsFake(function() {
                return true;
            });
            this.sandbox.stub(messenger, "sendDirectMessage").callsFake(function(user, message) {
                assert.isTrue(message.indexOf("1234567890") !== -1);
                done();
            });

            this.sandbox.stub(birdfeedManager, "createBirdfeedForGuildMember").callsFake(function() {
                return Promise.resolve("1234567890");
            });

            jacques.onMessage(this.message);
        });

        it("sends an error when creating birdfeed fails", function(done) {
            this.message.content = prefix + "birdfeed";
            this.sandbox.stub(birdfeedManager, "userHasUploadPermissions").callsFake(function() {
                return true;
            });

            this.sandbox.stub(messenger, "sendDirectMessage").callsFake(function(user, message) {
                assert.isTrue(message.indexOf("1234567890") === -1);
                done();
            });

            this.sandbox.stub(birdfeedManager, "createBirdfeedForGuildMember").callsFake(function() {
                return Promise.reject("Fake birdfeed creation error.");
            });

            jacques.onMessage(this.message);
        });
    });
});
