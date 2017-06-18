const fs = require('fs');
const path = require('path');
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;

function getSoundPathFromSound(sound) {
	var soundsDirectoryCleansed = path.join(SOUNDS_DIRECTORY);
    var rootPath = path.resolve(soundsDirectoryCleansed);
    var soundPath = path.join(rootPath, sound.category, sound.name);
}

function soundExistsInFileSystem(soundPath) {
	return fs.existsSync(soundPath);
}

module.exports.getSoundPathFromSound = getSoundPathFromSound;
module.exports.soundExistsInFileSystem = soundExistsInFileSystem;