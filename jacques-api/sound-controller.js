const Sound = require("../common/model/sound").Sound;
const fs = require("fs");
const path = require("path");
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const logger = require("../common/util/logger.js");
const db = require("../common/data/db.js");

const MP3_META_DATA = "data:audio/mp3;base64,";
const fileSystemReader = require("../common/util/fileSystemReader");

function getSound(req, res) {
    Sound.findOne({
        name: req.params.sound_name + ".mp3"
    }, function(err, sound) {
        if (err) {
            logger.error(err);
            res.status(500).send({ error: "Failed to get this sound. Error: " + err });
        } else {
            res.json(sound);
        }
    });
}

function getSounds(req, res) {
    db.getAllSounds()
        .then(function(sounds) {
            res.json(sounds);
        }).catch(function(error) {
            logger.error(error);
            res.status(500).send({ error: "Failed to get sounds. Error: " + err });
        });
}

function postSound(req, res) {
    if (!validateSoundPostHasRequiredData(req, res)) {
        return;
    }

    var soundName = req.params.sound_name;
    var soundData = req.body.sound;

    var cleansedSoundData;

    //Remove MP3 meta data, or handle the file not being the appropriate type.
    if (soundData.includes(MP3_META_DATA)) {
        cleansedSoundData = soundData.replace(MP3_META_DATA, "");
    } else {
        res.status(400).send({ error: "Unsupported file type. Jacques only supports MP3 files." });
        return;
    }

    //Create the file name from the sound name parameter and the mp3 extension.
    var soundFileName = path.join(SOUNDS_DIRECTORY, soundName + ".mp3");

    if (fileSystemReader.soundExistsInFileSystem(soundFileName)) {
        res.status(400).send({error: "Sound with this name already exists."});
        return;
    }

    //Attempt to save the sound to file system.
    saveSoundToFileSystem(soundFileName, cleansedSoundData, function(err) {
        if (err) {
            logger.error(err);
            res.status(500).send({ error: "Couldn't save file." });
        } else {
            res.send("Saved file!");
        }
    })
}

function validateSoundPostHasRequiredData(req, res) {
    var soundName = req.params.sound_name;
    var soundData = req.body.sound;

    //Must have sound name in request parameter to process a POST request for this resource.
    if (!soundName) {
        res.status(400).send({ error: "Sound name missing from parameters." });
        return false;
    }

    //Must have sound data to process a POST request for this resource.
    if (!soundData) {
        res.status(400).send({ error: "Missing sound data!" });
        return false;
    }

    return true;
}

function saveSoundToFileSystem(soundFileName, soundFileData, soundSavedCallback) {
    fs.writeFile(soundFileName, soundFileData, "base64", soundSavedCallback);
}

module.exports.getSound = getSound;
module.exports.getSounds = getSounds;
module.exports.postSound = postSound;