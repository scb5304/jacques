require("dotenv").config({ path: require("app-root-path") + "/.env" });

var sinon = require("sinon");
var soundboard = require("./../soundboard");
var fileSystemReader = require("./../../common/util/fileSystemReader.js");
var Db = require("./../../common/data/db.js");

var self = this;

beforeEach(function() {
    self.sandbox = sinon.sandbox.create();
    self.message = {};
    self.message.member = {};
    self.message.member.guild = {id: "1005"};
    self.message.voiceChannel = {};
});

function stubFileSystemReader() {
    //Stub the fileSystemReader to return a sound path
    self.sandbox.stub(fileSystemReader, "getSoundPathFromSound").callsFake(function() {
        return "";
    });

    //Stub the fileSystemReader to say it exists in the file system
    self.sandbox.stub(fileSystemReader, "soundExistsInFileSystem").callsFake(function() {
        return true;
    });
}

afterEach(function() {
    self.sandbox.restore();
});

//Adds a fake voice channel to a message that returns a fake promise when join() is called.
//If a test needs to complete upon this occurring, a "done" object can be passed that will be invoked.
function mockVoiceChannelJoin(message, done) {
    message.member.voiceChannel = {
        join: function() {
            return new Promise(function(resolve, reject) {
                if (done) {
                    done();
                }
                return reject("It's only a test, don't try to join a voice channel for real.");
            });
        }
    };
}

describe("playRandomSound", function() {

    it("should query for a random sound in the member's guild", function() {
        var dbStub = self.sandbox.stub(Db, "getRandomSoundInDiscordGuild").callsFake(function() {
            return new Promise((resolve) => {
                return resolve();
            });
        });

        soundboard.playRandomSound(self.message);
        sinon.assert.calledWith(dbStub, "1005");
    });

    it("should query for a random sound name, then join a voice channel", function(done) {
        //if voiceChannel#join is called, then the test is a success.
        mockVoiceChannelJoin(self.message, done);
        stubFileSystemReader();

        var sound = { name: "1910.mp3", category: "default" };
        //Stub the database to return a random sound name
        self.sandbox.stub(Db, "getRandomSoundInDiscordGuild").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve(sound);
            });
        });

        //Play a random sound, which should query the database then join a voice channel, ending the test.
        soundboard.playRandomSound(self.message);
    });

    it("should insert a sound event", function(done) {
        //We need to mock this part so we can even get to inserting a sound event.
        mockVoiceChannelJoin(self.message, null);
        stubFileSystemReader();

        //Stub the database to return a random sound name
        self.sandbox.stub(Db, "getRandomSoundInDiscordGuild").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve({ name: "1910.mp3" });
            });
        });

        //Test succeeds if the spy sees the insert method is called
        self.sandbox.stub(Db, "insertSoundEvent").callsFake(function() {
            done();
        });

        //Play a random sound, which should afterwards insert a sound event.
        soundboard.playRandomSound(self.message);
    });
});

describe("playTargetedSound", function() {
    it("should query for a specific sound", function() {
        //Stub the database to say the sound exists
        var dbStub = self.sandbox.stub(Db, "getSoundByDiscordGuildIdAndName").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve();
            });
        });

        //Play a targeted sound, which should query the database then join a voice channel, ending the test.
        soundboard.playTargetedSound(self.message, "mySound");
        sinon.assert.calledWith(dbStub, "1005", "mySound");
    });

    it("should join a voice channel to play the sound", function(done) {
        //Stub the database to say the sound exists
        self.sandbox.stub(Db, "getSoundByDiscordGuildIdAndName").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve({});
            });
        });

        stubFileSystemReader();
        mockVoiceChannelJoin(self.message, done);

        //Play a targeted sound, which should query the database then join a voice channel, ending the test.
        soundboard.playTargetedSound(self.message, "mySound");
    });
});