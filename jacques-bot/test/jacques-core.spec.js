require("dotenv").config({path: require("app-root-path") + "/.env"});
const Discord = require("discord.js");
const sinon = require("sinon");
const chai = require("chai");
const jacques = require("../core/jacques-core");
const soundboard = require("../modules/soundboard");
const streamer = require("../modules/streamer");
const messenger = require("../modules/messenger");
const guildManager = require("../modules/guild-manager");
const birdfeedManager = require("../modules/birdfeed-manager");

const prefix = process.env.JACQUES_PREFIX;

beforeEach(function() {
    const testGuild = {id: "420", name: "The Jelly Spotters"};
    this.sandbox = sinon.sandbox.create();
    this.message = {
        channel: Object.create(Discord.TextChannel.prototype),
        author: {},
        guild: testGuild,
        member: {
            displayName: "Steubenville",
            voiceChannel: {
                name: "Weenie Hut General",
                leave: function() {},
                connection: {
                    disconnect: function() {}
                }
            },
            guild: testGuild
        },
    };
    this.message.channel.name = "commands";
    this.bot = {
        guilds: new Discord.Collection(),
        user: {
            username: "Jacques",
            setGame: function () {
                return Promise.resolve(this);
            }
        }
    };
    jacques.setClientInstance(this.bot);
});

afterEach(function() {
    this.sandbox.restore();
    jacques.setClientInstance(undefined);
});

describe("logging in", function() {
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
        it("routes a direct channel message to send help message", function() {
            const messengerStub = this.sandbox.stub(messenger, "sendHelp");

            this.message.author.username = "Steve";
            this.message.content = "Hey what's up?";
            this.message.channel = new Discord.DMChannel(undefined, undefined);

            const routed = jacques.onMessage(this.message);
            chai.assert.isTrue(routed); //Was successfully routed
            sinon.assert.calledWith(messengerStub, this.message); //Called the messenger to send help
        });

        it ("ignores direct channel messages from Jacques himself", function() {
            this.message.content = "Hey what's up?";
            this.message.channel = new Discord.DMChannel(undefined, undefined);
            this.message.author.username = "Jacques";

            const routed = jacques.onMessage(this.message);
            chai.assert.isFalse(routed); //Was not successfully routed
        });
    });

    describe("not valid jacques text channel messages", function() {
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
            this.bot.voiceConnections = {
                get: function () {
                    return {
                        channel: {
                            name: "testChannelName"
                        }
                    }
                }
            };

            const sendReplyStub = this.sandbox.stub(messenger, "replyToMessage");
            const streamAudioSpy = this.sandbox.spy(streamer, "streamAudio");

            jacques.onMessage(this.message);
            sinon.assert.called(sendReplyStub);
            sinon.assert.notCalled(streamAudioSpy);
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

    describe("volume control", function() {
        beforeEach(function() {
            this.bot.voiceConnections = {
                get: function() {}
            };
        });

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
                chai.assert.isTrue(message.indexOf("1234567890") !== -1);
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
                chai.assert.isTrue(message.indexOf("1234567890") === -1);
                done();
            });

            this.sandbox.stub(birdfeedManager, "createBirdfeedForGuildMember").callsFake(function() {
                return Promise.reject("Fake birdfeed creation error.");
            });

            jacques.onMessage(this.message);
        });
    });
});
