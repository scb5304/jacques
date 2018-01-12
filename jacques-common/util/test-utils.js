const chai = require("chai");
const logger = require("./logger");
const utility = require("../../jacques-common/util/utility");

const testDiscordVoiceChannel = {
    name: "Weenie Hut General",
    leave: function() {},
    join: function() {
        return Promise.resolve(testDiscordVoiceConnection);
    }
};

const testStreamDispatcher = {
    once: function () {}
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
    channel: testDiscordVoiceChannel,
    playFile: function() {
        return testStreamDispatcher;
    },
    playStream: function() {
        return testStreamDispatcher;
    }
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
    content: "Hello, world!",
    reply: function() {
        return Promise.resolve();
    }
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

const testSound = {
    "name": "bowser",
    "add_date": "2017-02-26T23:08:12.629Z",
    "added_by": "Captain Dogbeard",
    "discord_guild": testDiscordGuild.id,
    "sound_events": [{
        "performed_by": "Eldre Hund",
        "date": "2017-02-27T03:14:30.142Z",
        "category": "playRandom"
    }, {
        "performed_by": "Eldre Hund",
        "date": "2017-03-17T02:45:14.174Z",
        "category": "playRandom"
    }, {
        "performed_by": "Eldre Hund",
        "date": "2017-03-19T22:04:36.036Z",
        "category": "playRandom"
    }, {
        "performed_by": "Valle",
        "date": "2017-05-04T13:42:43.097Z",
        "category": "playTargeted"
    }],
    "tags": []
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

module.exports.createTestSound = function() {
    return utility.cloneObject(testSound);
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