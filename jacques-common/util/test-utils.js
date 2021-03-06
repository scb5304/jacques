const assert = require("chai").assert;
const utility = require("../../jacques-common/util/utility");

const testDiscordVoiceChannel = {
    name: "Weenie Hut General",
    leave: function() {},
    join: function() {
        return Promise.resolve(testDiscordVoiceConnection);
    }
};

const testStreamDispatcher = {
    once: function () {},
    on: function() {},
    setVolumeLogarithmic: function() {}
};

const testDiscordVoiceConnection = {
    disconnect: function() {},
    get: function () {
        return {
            channel: {
                name: "testChannelName"
            }
        };
    },
    channel: testDiscordVoiceChannel,
    play: function() {
        return testStreamDispatcher;
    },
    playFile: function() {
        return testStreamDispatcher;
    },
    playStream: function() {
        return testStreamDispatcher;
    },
    player: {
        dispatcher: testStreamDispatcher
    }
};

const testDiscordUser = {
    id: "180814637975994368",
    username: "JonTronBot",
    createDM: function() {
        return Promise.resolve(testDiscordDMChannel);
    }
};

const testDiscordGuild = {
    id: "113425666951190094",
    name: "The Jelly Spotters"
};

const testDiscordGuildMember = {
    id: testDiscordUser.id,
    displayName: testDiscordUser.name,
    voice: {
        channel: testDiscordVoiceChannel
    },
    guild: testDiscordGuild,
    user: testDiscordUser
};

const testJacquesGuild = {
    discord_id: "113425666951190094",
    discord_name: "The Jelly Spotters",
    volume: 0.65,
    toObject: function() {
        return this;
    }
};

const testDiscordTextChannel = {
    name: "commands"
};

const testDiscordDMChannel = {
    send: function() {
        return Promise.resolve();
    }
};

const testDiscordTextChannelMessage = {
    channel: testDiscordTextChannel,
    author: testDiscordUser,
    guild: testDiscordGuild,
    member: testDiscordGuildMember,
    content: "Hello, world!",
    reply: function() {
        //Actually returns a CREATED message, but this should suffice.
        return Promise.resolve(testDiscordTextChannelMessage);
    },
    delete: function() {
        return Promise.resolve();
    }
};

const testDiscordClient = {
    guilds: {
        cache: [testDiscordGuild]
    },
    user: {
        username: "Jacques",
        setActivity: function () {
            return Promise.resolve(this);
        }
    },
    voice: {
        connections: {get: function() {}}
    }
};

const testSoundEvent = {
    name: "steuben",
    sound_events: [],
    performed_by: "Adam Egret",
    category: "playTargeted",
    date: new Date(),
    save: function() {}
};

const testSound = {
    name: "bowser",
    add_date: "2017-02-26T23:08:12.629Z",
    added_by: "Captain Dogbeard",
    discord_guild: testDiscordGuild.id,
    sound_events: [testSoundEvent],
    save: function() {},
    tags: []
};

const testJacquesUser = {
    discord_last_guild_id: testJacquesGuild.discord_id,
    discord_username: "Steuben",
    birdfeed_date_time: new Date(),
    toObject: function() {
        return this;
    }
};

const testBirdfeed = "A38df89lds";

//====================================================================================================================//

module.exports.createTestDiscordVoiceChannel = function() {
    return utility.cloneObject(testDiscordVoiceChannel);
};

module.exports.createTestDiscordVoiceConnection = function() {
    return utility.cloneObject(testDiscordVoiceConnection);
};

module.exports.createTestDiscordTextChannelMessage = function() {
    return utility.cloneObject(testDiscordTextChannelMessage);
};

module.exports.createTestDiscordDMChannel = function() {
    return utility.cloneObject(testDiscordDMChannel);
};

module.exports.createTestDiscordClient = function() {
    return utility.cloneObject(testDiscordClient);
};

module.exports.createTestDiscordGuildMember = function() {
    return utility.cloneObject(testDiscordGuildMember);
};

module.exports.createTestDiscordUser = function() {
    return utility.cloneObject(testDiscordUser);
};

module.exports.createTestDiscordGuild = function() {
    return utility.cloneObject(testDiscordGuild);
};

module.exports.createTestSound = function() {
    return utility.cloneObject(testSound);
};

module.exports.createTestSoundEvent = function() {
    return utility.cloneObject(testSoundEvent);
};

module.exports.createTestJacquesGuild = function() {
    return utility.cloneObject(testJacquesGuild);
};

module.exports.createTestJacquesUser = function() {
    return utility.cloneObject(testJacquesUser);
};

module.exports.createTestBirdfeed = function() {
    return JSON.parse(JSON.stringify(testBirdfeed));
};

module.exports.expectApiResponseStatus = function(expected, actual, done) {
    assert.equal(expected, actual, "Expected status of " + expected + ", got " + actual);
    return {
        send: function () {
            if (done) {
                done();
            }
        }
    }
};

module.exports.expectApiResponseJson = function(expected, actual, done) {
    assert.deepEqual(expected, actual, "Expected json of " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
    done();
};

module.exports.throwUnexpectedResolveWhen = function(reason) {
    throw "Did not expect 'resolve' block to be invoked when " + reason + ".";
};