require("dotenv").config({ path: require("app-root-path") + "/.config/.env" });
const assert = require("chai").assert;
const sinon = require("sinon");
const soundboard = require("./soundboard");
const fileSystemReader = require("../../jacques-common/util/file-system-reader");
const soundsRepository = require("../../jacques-common/data/sounds/sounds-repository");
const testUtils = require("../../jacques-common/util/test-utils");

before(function() {
    this.sandbox = sinon.sandbox.create();
    this.sandbox.stub(fileSystemReader, "getSoundPathFromSound").callsFake(function() {
        return "";
    });
    //Stub the fileSystemReader to say it exists in the file system
    this.sandbox.stub(fileSystemReader, "soundExistsInFileSystem").callsFake(function() {
        return true;
    });
});

beforeEach(function() {
    this.message = testUtils.createTestDiscordTextChannelMessage();
    this.sound = testUtils.createTestSound();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("playRandomSound", function() {
    it("queries for a random sound in the member's guild", function(done) {
        let self = this;
        this.sandbox.stub(soundsRepository, "getRandomSoundInDiscordGuild").callsFake(function (guildId) {
            assert.equal(guildId, self.sound.discord_guild);
            done();
        });

        soundboard.playRandomSound(this.message);
    });

    it("should query for a random sound name, then join a voice channel", function(done) {
        let self = this;
        this.sandbox.stub(self.message.member.voiceChannel, "join").callsFake(function() {
            done();
            return Promise.resolve(testUtils.createTestDiscordVoiceConnection());
        });
        this.sandbox.stub(soundsRepository, "getRandomSoundInDiscordGuild").callsFake(function() {
            return Promise.resolve(self.sound);
        });
        soundboard.playRandomSound(this.message);
    });

    it("should insert a sound event", function(done) {
        let self = this;
        this.sandbox.stub(soundsRepository, "getRandomSoundInDiscordGuild").callsFake(function() {
            return Promise.resolve(self.message);
        });

        this.sandbox.stub(soundsRepository, "insertSoundEvent").callsFake(function() {
            done();
            return Promise.resolve();
        });

        soundboard.playRandomSound(this.message);
    });
});

describe("playTargetedSound", function() {
    it("should query for a specific sound", function() {
        let self = this;
        const dbStub = this.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function () {
            return Promise.resolve(self.sound);
        });

        soundboard.playTargetedSound(this.message, this.sound.name);
        sinon.assert.calledWith(dbStub, this.sound.discord_guild, this.sound.name);
    });

    it("should join a voice channel to play the sound", function(done) {
        let self = this;
        this.sandbox.stub(self.message.member.voiceChannel, "join").callsFake(function() {
            done();
            return Promise.resolve(testUtils.createTestDiscordVoiceConnection());
        });
        this.sandbox.stub(soundsRepository, "getSoundByDiscordGuildIdAndName").callsFake(function() {
            return Promise.resolve(self.sound);
        });
        //Play a targeted sound, which should query the database then join a voice channel, ending the test.
        soundboard.playTargetedSound(this.message, "mySound");
    });
});