require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const assert = require("chai").assert;
const path = require("path");
const fs = require("fs");
let mkdirp = require("mkdirp");

const logger = require("./logger");
const testUtils = require("./test-utils");
const fileSystemManager = require("./file-system-manager");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("file-system-manager", function() {
    const testError = "Test error";
    beforeEach(function() {
        this.testSound = testUtils.createTestSound();
    });

    describe("creating a sound path from a jacques sound", function() {
        it("calculates a sound path that connects the discord guild id and the sound name", function() {
            let calculatedSoundPath = fileSystemManager.getSoundPathFromSound(this.testSound);
            assert.isTrue(calculatedSoundPath.includes(path.join(this.testSound.discord_guild), this.testSound.name));
        });
    });

    describe("checking if a sound exists in the file system", function() {
        it("rejects when fs.access to the sound's path returns an error", function(done) {
            this.sandbox.stub(fs, "access").callsFake(function(soundPath, callback) {
                callback(testError);
            });
            fileSystemManager.soundExistsInFileSystem().then(function() {
                throw "Resolve should not have been called when the file doesn't exist";
            }).catch(function(err) {
                logger.error(err);
                done();
            });
        });

        it("resolves when fs.access to the sound's path doesn't return an error", function(done) {
            this.sandbox.stub(fs, "access").callsFake(function(soundPath, callback) {
                callback();
            });
            fileSystemManager.soundExistsInFileSystem().then(function() {
                done();
            }).catch(logger.error);
        });
    });

    describe("deleting a sound from the file system", function() {
        it("rejects when fs fails to unlink", function(done) {
            this.sandbox.stub(fs, "unlink").callsFake(function(soundPath, callback) {
                callback(testError);
            });
            fileSystemManager.deleteSoundFromFileSystem(this.testSound.discord_guild, this.testSound.name).then(function() {
                throw "Resolve should not have been called when the deletion fails";
            }).catch(function(err) {
                logger.error(err);
                done();
            });
        });

        it("resolves when fs successfully unlinks", function(done) {
            this.sandbox.stub(fs, "unlink").callsFake(function(soundPath, callback) {
                callback();
            });
            fileSystemManager.deleteSoundFromFileSystem(this.testSound.discord_guild, this.testSound.name).then(function() {
                done();
            }).catch(logger.error);
        });
    });

    describe("writing a sound to the file system", function() {
        it("rejects when creating the directory fails", function(done) {
            this.sandbox.stub(mkdirp, "mkdirp").callsFake(function(directory, callback) {
                callback(testError);
            });
            fileSystemManager.writeSoundToFileSystem("", "", "").then(function() {
                throw "Resolve should not have been called when the write fails";
            }).catch(function(err) {
                logger.error(err);
                done();
            });
        });

        it("rejects when creating the directory and the sound is successful", function(done) {
            this.sandbox.stub(mkdirp, "mkdirp").callsFake(function(directory, callback) {
                callback();
            });
            this.sandbox.stub(fs, "writeFile").callsFake(function(path, data, options, callback) {
                callback();
            });
            fileSystemManager.writeSoundToFileSystem("", "", "").then(function() {
                done();
            }).catch(logger.error);
        });

        it("rejects when creating the directory succeeds but creating the sound is unsuccessful", function(done) {
            this.sandbox.stub(mkdirp, "mkdirp").callsFake(function(directory, callback) {
                callback();
            });
            this.sandbox.stub(fs, "writeFile").callsFake(function(path, data, options, callback) {
                callback(testError);
            });
            fileSystemManager.writeSoundToFileSystem("", "", "").then(function() {
                throw "Resolve should not have been called when the write fails";
            }).catch(function(err) {
                logger.error(err);
                done();
            });
        });
    });
});