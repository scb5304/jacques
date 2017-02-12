const mongoose = require('mongoose');
const config = require('./config.json');
const Sound = require('./model/sound').Sound;
const fs = require('fs');

console.log("Getting db ready...");
mongoose.connect('mongodb://localhost/jontronbot', function() {
    console.log('Db connected!');
    
    fs.readdir("C:/Users/scb53/Music/JonTronBotSounds/DARKEST_COMMAND", function(err, files) {
    	for (var file of files) {
    		console.log(file);
    		Sound.findOne({name : file}), function(err, sound) {
    			if (err) throw err;
    			console.log("Found a match: " + sound);
    		};
    	}
    });
});