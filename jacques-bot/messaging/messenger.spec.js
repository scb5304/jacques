require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const messenger = require("./messenger");
const testUtils = require("../../jacques-common/util/test-utils");
const logger = require("../../jacques-common/util/logger");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("messenger", function() {
    let self;
    beforeEach(function() {
        this.message = testUtils.createTestDiscordTextChannelMessage();
        this.user = testUtils.createTestDiscordUser();
        self = this;
    });

    describe("sending help", function() {
        it("replies to the message", function() {
            const replySpy = this.sandbox.spy(this.message, "reply");
            messenger.sendHelp(this.message);
            assert.isTrue(replySpy.calledOnce);
        });
    });

    describe("sending the current volume", function() {
        it("replies to the message with the current volume * 100", function(done) {
            this.sandbox.stub(this.message, "reply").callsFake(function(messageContents) {
                assert.isDefined(messageContents);
                assert.isTrue(messageContents.includes(String(0.50 * 100)));
                done();
                return Promise.resolve(self.message);
            });
            messenger.printVolume(this.message, 0.50);
        });
    });

    describe("sending a DM", function() {
        it("does nothing but log an error if the passed user doesn't exist", function() {
            //I don't know how I feel about verifying interactions with the logger, but I'm not sure how else
            //to test this negative scenario...
            let errorLogSpy = this.sandbox.spy(logger, "error");
            messenger.sendDirectMessage(undefined, this.message);
            assert.isTrue(errorLogSpy.calledOnce);
        });

        it("uses an existing DM channel if one already exists, then sends the message", function() {
            this.user.dmChannel = testUtils.createTestDiscordDMChannel();
            let dmSendSpy = this.sandbox.spy(this.user.dmChannel, "send");
            messenger.sendDirectMessage(this.user, this.message);
            assert.isTrue(dmSendSpy.calledOnce);
        });

        it("creates a new DM channel if one does not yet exist, then sends the message", function(done) {
            let testDMChannel = {
                send: function(message) {
                    assert.isDefined(message);
                    done();
                }
            };
            this.user.dmChannel = undefined;
            this.sandbox.stub(this.user, "createDM").callsFake(function() {
                return Promise.resolve(testDMChannel);
            });
            messenger.sendDirectMessage(this.user, this.message);
        });
    });

    describe("replying to a message", function() {
        it("replies with the passed contents", function() {
            const replySpy = this.sandbox.spy(this.message, "reply");
            messenger.replyToMessage(this.message, "No thank you.");
            assert.isTrue(replySpy.calledWith("No thank you."));
        });

        it("deletes the reply after a delay", function(done) {
            //Create a dummy message that Jacques creates during his reply.
            let testCreatedMessage = {delete: function() {}};

            //When we try to reply, return this message.
            this.sandbox.stub(this.message, "reply").callsFake(function() {
                return Promise.resolve(testCreatedMessage)
            });

            //Listen in on calls to the 'delete' function, ensuring it is called.
            this.sandbox.stub(testCreatedMessage, "delete").callsFake(function(duration) {
                assert.isDefined(duration);
                done();
                return Promise.resolve();
            });
            messenger.replyToMessage(this.message, "");
        });
    });

    describe("deleting a message", function() {
        it("does not delete the message if it belongs to a 'commands' channel", function() {
            this.message.channel.name = "commands";
            let deleteSpy = this.sandbox.spy(this.message, "delete");
            messenger.deleteMessage(this.message);
            assert.isFalse(deleteSpy.called);
        });

        it("does not delete the message if it belongs to a channel that contains the word 'commands' in mixed case", function() {
            this.message.channel.name = "BOT ComMaNds";
            let deleteSpy = this.sandbox.spy(this.message, "delete");
            messenger.deleteMessage(this.message);
            assert.isFalse(deleteSpy.called);
        });

        it("deletes the message if it does not belong to a 'commands'-like channel", function() {
            this.message.channel.name = "General";
            let deleteSpy = this.sandbox.spy(this.message, "delete");
            messenger.deleteMessage(this.message);
            assert.isTrue(deleteSpy.calledOnce);
        });
    });
});
