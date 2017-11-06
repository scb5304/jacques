const fs = require("fs");
const path = require("path");
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;

function getSoundPathFromSound(sound) {
	var soundsDirectoryCleansed = path.join(SOUNDS_DIRECTORY);
    var rootPath = path.resolve(soundsDirectoryCleansed);

	return path.join(rootPath, sound.name);
}

function soundExistsInFileSystem(soundPath) {
	return fs.existsSync(soundPath);
}

module.exports.getSoundPathFromSound = getSoundPathFromSound;
module.exports.soundExistsInFileSystem = soundExistsInFileSystem;
