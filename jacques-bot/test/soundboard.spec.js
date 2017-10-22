require("dotenv").config({ path: require("app-root-path") + "/.env" });

var sinon = require("sinon");
var soundboard = require("./../soundboard");
var fileSystemReader = require("./../fileSystemReader.js");
var Db = require("./../../common/data/db.js");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
    this.message = {};
    this.message.member = {};
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
                return reject("It's only a test.");
            });
        }
    };
}

describe("playRandomSound", function() {
    it("should query for a random sound name, then join a voice channel", function(done) {
        //if voiceChannel#join is called, then the test is a success.
        mockVoiceChannelJoin(this.message, done);

        var sound = { name: "1910.mp3", category: "default" };
        //Stub the database to return a random sound name
        this.sandbox.stub(Db, "getRandomSound").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve(sound);
            });
        });
        //Stub the fileSystemReader to return a sound path
        this.sandbox.stub(fileSystemReader, "getSoundPathFromSound").callsFake(function() {
            return "C:/sounds/default/1910.mp3";
        });
        //Stub the fileSystemReader to say it exists in the file system
        this.sandbox.stub(fileSystemReader, "soundExistsInFileSystem").callsFake(function() {
            return true;
        });

        //Play a random sound, which should query the database then join a voice channel, ending the test.
        soundboard.playRandomSound(this.message);
    });

    it("should insert a sound event", function(done) {
        //We need to mock this part so we can even get to inserting a sound event.
        mockVoiceChannelJoin(this.message, null);

        //Stub the database to return a random sound name
        this.sandbox.stub(Db, "getRandomSound").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve({ name: "1910.mp3" });
            });
        });

        //Stub the fileSystemReader to return a sound path
        this.sandbox.stub(fileSystemReader, "getSoundPathFromSound").callsFake(function() {
            return "C:/sounds/default/1910.mp3";
        });
        //Stub the fileSystemReader to say it exists in the file system
        this.sandbox.stub(fileSystemReader, "soundExistsInFileSystem").callsFake(function() {
            return true;
        });

        //Test succeeds if the spy sees the insert method is called
        this.sandbox.stub(Db, "insertSoundEvent").callsFake(function() {
            done();
        });

        //Play a random sound, which should afterwards insert a sound event.
        soundboard.playRandomSound(this.message);
    });
});

describe("playParameterizedSound", function() {
    it("should query for a specific sound, then join a voice channel", function(done) {
        var soundName = "fif.mp3";
        var sound = { name: soundName, category: "default" };

        //if voiceChannel#join is called, then the test is a success.
        mockVoiceChannelJoin(this.message, done);

        //Stub the database to say no category exists since it's being passed null (no secondCommandArg)
        this.sandbox.stub(Db, "getCategoryFromName").callsFake(function() {
            return new Promise(function(resolve, reject) {
                return reject("Category doesn't exist.");
            });
        });

        //Stub the database to say the sound exists
        this.sandbox.stub(Db, "getSoundFromNameAndCategory").callsFake(function() {
            return new Promise(function(resolve) {
                return resolve(sound);
            });
        });

        //Stub the fileSystemReader to return a sound path
        this.sandbox.stub(fileSystemReader, "getSoundPathFromSound").callsFake(function() {
            return "C:/sounds/default/fif.mp3";
        });

        //Stub the fileSystemReader to say it exists in the file system
        this.sandbox.stub(fileSystemReader, "soundExistsInFileSystem").callsFake(function() {
            return true;
        });

        //Play a targeted sound, which should query the database then join a voice channel, ending the test.
        soundboard.playParameterizedSound(this.message, soundName);
    });
});