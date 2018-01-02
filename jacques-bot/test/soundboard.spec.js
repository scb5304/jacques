require("dotenv").config({ path: require("app-root-path") + "/.env" });

var sinon = require("sinon");
var soundboard = require("./../soundboard");
var fileSystemReader = require("./../../common/util/fileSystemReader.js");
var Db = require("./../../common/data/db.js");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    //Stub the fileSystemReader to return a sound path
    this.sandbox.stub(fileSystemReader, "getSoundPathFromSound").callsFake(function() {
        return "C:/sounds/default/fif.mp3";
    });

    //Stub the fileSystemReader to say it exists in the file system
    this.sandbox.stub(fileSystemReader, "soundExistsInFileSystem").callsFake(function() {
        return true;
    });
    this.message = {};
    this.message.member = {};
    this.message.member.guild = {id: "1005"};
    this.message.voiceChannel = {};
});

afterEach(function() {
    this.sandbox.restore();
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
        var dbStub = this.sandbox.stub(Db, "getRandomSoundInDiscordGuild").callsFake(function() {
            return new Promise((resolve) => {
                return resolve();
            });
        });

        soundboard.playRandomSound(this.message);
        sinon.assert.calledWith(dbStub, "1005");
    });

    it("should query for a random sound name, then join a voice channel", function(done) {
        //if voiceChannel#join is called, then the test is a success.
        mockVoiceChannelJoin(this.message, done);

        var sound = { name: "1910.mp3", category: "default" };
        //Stub the database to return a random sound name
        this.sandbox.stub(Db, "getRandomSoundInDiscordGuild").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve(sound);
            });
        });

        //Play a random sound, which should query the database then join a voice channel, ending the test.
        soundboard.playRandomSound(this.message);
    });

    it("should insert a sound event", function(done) {
        //We need to mock this part so we can even get to inserting a sound event.
        mockVoiceChannelJoin(this.message, null);

        //Stub the database to return a random sound name
        this.sandbox.stub(Db, "getRandomSoundInDiscordGuild").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve({ name: "1910.mp3" });
            });
        });

        //Test succeeds if the spy sees the insert method is called
        this.sandbox.stub(Db, "insertSoundEvent").callsFake(function() {
            done();
        });

        //Play a random sound, which should afterwards insert a sound event.
        soundboard.playRandomSound(this.message);
    });
});

describe("playTargetedSound", function() {
    it("should query for a specific sound", function(done) {
        //Stub the database to say the sound exists
        var dbStub = this.sandbox.stub(Db, "getSoundByDiscordGuildIdAndName").callsFake(function() {
            return new Promise(function(resolve) {
                done();
                return resolve();
            });
        });

        //Play a targeted sound, which should query the database then join a voice channel, ending the test.
        soundboard.playTargetedSound(this.message, "mySound");
        sinon.assert.calledWith(dbStub, "1005", "mySound");
    });

    it("should join a voice channel to play the sound", function(done) {
        //Stub the database to say the sound exists
        this.sandbox.stub(Db, "getSoundByDiscordGuildIdAndName").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve({});
            });
        });

        mockVoiceChannelJoin(this.message, done);

        //Play a targeted sound, which should query the database then join a voice channel, ending the test.
        soundboard.playTargetedSound(this.message, "mySound");
    });
});