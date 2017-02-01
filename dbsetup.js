const mongoose = require('mongoose');
const config = require('./config.json');
const fs = require('fs');
const SOUNDS_DIRECTORY = config.soundsDirectory;
const Sound = require('./model/sound');

console.log("Getting db ready...");
mongoose.connect('mongodb://localhost/jontronbot', function() {

    console.log('Db connected!');

    syncSounds();
    //clearSoundsCollection();
    //insertSounds();
})

function syncSounds() {
    //Get sounds from database
    Sound.find({}, function(err, sounds) {
        //Get sounds file file system
        fs.readdir(SOUNDS_DIRECTORY, function(err, files) {
            //Loop through sounds in database
            for (var sound of sounds) {

                if (files.indexOf(sound.name + ".mp3") == -1) {
                    console.log("Removing " + sound.name + " from the database! It's no longer in the file system.");
                    Sound.remove({
                        name: sound.name
                    }, function(err) {
                        if (err) throw err;
                    });
                }
            }
            //Loop through sounds in file system
            for (var file of files) {
                var isDirectory = fs.lstatSync(SOUNDS_DIRECTORY + "/" + file).isDirectory();
                if (isDirectory) {
                    console.log("Not considering creating a sound for directory " + file);
                    continue;
                }

                if (!soundsArrayContainsName(sounds, file)) {
                    console.log("Adding " + file + " to the database! It's in the file system but not the database.");

                    var newSound = Sound({
                        name: file.split("\.")[0],
                        add_date: new Date(),
                        added_by: "Server"
                    });
                    newSound.save(function(err) {
                        if (err) throw err;
                    });

                }
            }
        });
    });
}

function soundsArrayContainsName(sounds, name) {
    for (var sound of sounds) {
        var soundName = sound.name + ".mp3";
        //console.log("Comparing " + soundName + " to " + name);
        if (soundName === name) {
            //console.log("True!!");
            return true;
        }
    }
    return false;
}