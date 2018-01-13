const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;

function getSoundPathFromSound(sound) {
	var soundsDirectoryCleansed = path.join(SOUNDS_DIRECTORY, sound.discord_guild);
    var rootPath = path.resolve(soundsDirectoryCleansed);

	return path.join(rootPath, sound.name);
}

function soundExistsInFileSystem(soundPath) {
    return new Promise((resolve, reject) => {
        fs.access(soundPath, function(err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        })
    });
}

function deleteSoundFromFileSystem(guildId, soundName) {
    return new Promise((resolve, reject) => {
        const soundPath = path.join(SOUNDS_DIRECTORY, guildId, soundName + ".mp3");
        fs.unlink(soundPath, function(err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        })
    })
}

function writeSoundToFileSystem(guildId, soundName, fileData) {
    return new Promise((resolve, reject) => {
        const soundsDirectoryToSaveIn = path.join(SOUNDS_DIRECTORY, guildId);
        mkdirp(soundsDirectoryToSaveIn, function(err) {
            if (err) {
                return reject(err);
            } else {
                const fileName = path.join(soundsDirectoryToSaveIn, soundName + ".mp3");
                fs.writeFile(fileName, fileData, "base64", function(err) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve();
                    }
                });
            }
        });
    });
}

module.exports.getSoundPathFromSound = getSoundPathFromSound;
module.exports.soundExistsInFileSystem = soundExistsInFileSystem;
module.exports.deleteSoundFromFileSystem = deleteSoundFromFileSystem;
module.exports.writeSoundToFileSystem = writeSoundToFileSystem;
