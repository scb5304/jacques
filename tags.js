const mongoose = require('mongoose');
const config = require('./config.json');
const Sound = require('./model/sound').Sound;
const fs = require('fs');

console.log("Getting db ready...");
mongoose.connect('mongodb://localhost/jontronbot', function() {
    console.log('Db connected!');

/*
    fs.readdir("C:/Users/scb53/Music/JonTronBotSounds/IMAQTPIE_COMMAND", function(err, files) {
        for (var file of files) {

            Sound.findOne({
                name: file
            }, function(err, sound) {
                if (err) throw err;
                if (sound) {
                    console.log("Pushing tag to " + sound.name);
                    sound.tags.push("imaqtpie");
                    sound.save(function(err, doc, numRowsAffected) {
                        if (err) console.log(err);
                        //console.log("Added " + numRowsAffected + " rows: " + doc);
                    });
                }
            });
        }
    });
    fs.readdir("C:/Users/scb53/Music/JonTronBotSounds/JONTRON_COMMAND", function(err, files) {
        for (var file of files) {

            Sound.findOne({
                name: file
            }, function(err, sound) {
                if (err) throw err;
                if (sound) {
                    console.log("Pushing tag to " + sound.name);
                    sound.tags.push("jon");
                    sound.save(function(err, doc, numRowsAffected) {
                        if (err) console.log(err);
                        //console.log("Added " + numRowsAffected + " rows: " + doc);
                    });
                }
            });
        }
    });
    fs.readdir("C:/Users/scb53/Music/JonTronBotSounds/DARKEST_COMMAND", function(err, files) {
        for (var file of files) {

            Sound.findOne({
                name: file
            }, function(err, sound) {
                if (err) throw err;
                if (sound) {
                    console.log("Pushing tag to " + sound.name);
                    sound.tags.push("darkest");
                    sound.save(function(err, doc, numRowsAffected) {
                        if (err) console.log(err);
                        //console.log("Added " + numRowsAffected + " rows: " + doc);
                    });
                }

            });
        }
    });
    fs.readdir("C:/Users/scb53/Music/JonTronBotSounds/SPONGEBOB_COMMAND", function(err, files) {
        for (var file of files) {

            Sound.findOne({
                name: file
            }, function(err, sound) {
                if (err) throw err;
                if (sound) {
                    console.log("Pushing tag to " + sound.name);
                    sound.tags.push("sponge");
                    sound.save(function(err, doc, numRowsAffected) {
                        if (err) console.log(err);
                        //console.log("Added " + numRowsAffected + " rows: " + doc);
                    });
                }
            });
        }
    });
    fs.readdir("C:/Users/scb53/Music/JonTronBotSounds/PELO_COMMAND", function(err, files) {
        for (var file of files) {

            Sound.findOne({
                name: file
            }, function(err, sound) {
                if (err) throw err;
                if (sound) {
                    console.log("Pushing tag to " + sound.name);
                    sound.tags.push("pelo");
                    sound.save(function(err, doc, numRowsAffected) {
                        if (err) console.log(err);
                        //console.log("Added " + numRowsAffected + " rows: " + doc);
                    });
                }
            });
        }
    });
    */
});