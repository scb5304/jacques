const mongoose = require('mongoose');
const config = require('./config.json');
const fs = require('fs');
const SOUNDS_DIRECTORY = config.soundsDirectory;
const Sound = require('./model/sound');

console.log("Getting db ready...");
mongoose.connect('mongodb://localhost/jontronbot', function(){

	console.log('Db connected!');

	insertSounds();	
	//clearSoundsCollection();
})

function insertSounds() {
	fs.readdir(SOUNDS_DIRECTORY, function (err, files) {
        for (var file of files) {
        	var isDirectory = fs.lstatSync(SOUNDS_DIRECTORY + "/" + file).isDirectory();
        	if (isDirectory) {
        		console.log("Not creating a sound for directory " + file);
        		continue;
        	}
            var newSound = Sound({
            	name: file.split("\.")[0],
            	add_date: new Date(),
            	added_by: "Spitsonpuppies"
            });

            newSound.save(function(err) {
            	if (err) throw err;
            	console.log("Sound created!");
            });
        }
    });
}

function clearSoundsCollection() {
	Sound.remove({}, function(err) {
            if (err) {
                console.log(err)
            } else {
                console.log('success');
            }
        }
    );
}