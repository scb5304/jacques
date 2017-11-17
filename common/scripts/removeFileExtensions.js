const Db = require("../data/db");
const mongoose = require("mongoose");
const fs = require("fs");
var SOUNDS_DIRECTORY = "./../../sounds/";
const Sound = require("./../model/sound").Sound;
const logger = require("./../util/logger.js");

const readdirp = require("readdirp");
const path = require("path");

const ROOT_PATH = path.resolve(path.join(SOUNDS_DIRECTORY));

function doScript() {
    Db.getAllSounds()
        .then(function(sounds) {
            sounds.forEach(function(sound) {
                var currentSoundName = sound.name;
                var newSoundName = sound.name.replace(".mp3", "");

                logger.info(currentSoundName + " would become " + newSoundName);
                Sound.update({name: currentSoundName}, {name: newSoundName}, function (err, raw) {
                    if (err) {
                        logger.error(err);
                    }
                });
            });
        })
        .catch(function(err) {
            logger.error(err);
        });
}

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect("mongodb://localhost/jacques", function() {
        logger.info("Db connected!");
        doScript();
    });
}

connect();