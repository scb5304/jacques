const chai = require("chai");
const logger = require("./logger");
const utility = require("../../jacques-common/util/utility");

const testDiscordVoiceChannel = {
    name: "Weenie Hut General",
    leave: function() {}
};

const testDiscordVoiceConnection = {
    disconnect: function() {},
    get: function () {
        return {
            channel: {
                name: "testChannelName"
            }
        }
    },
    channel: testDiscordVoiceChannel
};

const testDiscordUser = {
    id: "180814637975994368",
    username: "JonTronBot"
};

const testDiscordGuild = {
    id: "113425666951190094",
    name: "The Jelly Spotters"
};

const testDiscordGuildMember = {
    displayName: testDiscordUser.name,
    voiceChannel: testDiscordVoiceChannel,
    guild: testDiscordGuild
};

const testDiscordTextChannel = {
    name: "commands"
};

const testDiscordTextChannelMessage = {
    channel: testDiscordTextChannel,
    author: testDiscordUser,
    guild: testDiscordGuild,
    member: testDiscordGuildMember,
    content: "Hello, world!"
};

const testBot = {
    guilds: [testDiscordGuild],
    user: {
        username: "Jacques",
        setGame: function () {
            return Promise.resolve(this);
        }
    },
    voiceConnections: {get: function() {}}
};

//====================================================================================================================//

/**
 * Creates a new VoiceChannel with no VoiceConnection.
 */
module.exports.createTestDiscordVoiceChannel = function() {
    return utility.cloneObject(testDiscordVoiceChannel);
};

module.exports.createTestDiscordVoiceConnection = function() {
    return utility.cloneObject(testDiscordVoiceConnection);
};

module.exports.createTestDiscordTextChannelMessage = function() {
    return utility.cloneObject(testDiscordTextChannelMessage);
};

module.exports.createTestBot = function() {
    return utility.cloneObject(testBot);
};

module.exports.expectApiResponseStatus = function(expected, actual, done) {
    logger.info("Expecting status of " + expected + ", got " + actual);
    chai.assert.equal(expected, actual);
    return {
        send: function () {
            done();
        }
    }
};

module.exports.expectApiResponseJson = function(expected, actual, done) {
    logger.info("Expecting json of " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
    chai.assert.deepEqual(expected, actual);
    done();
};