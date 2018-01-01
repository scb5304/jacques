require("dotenv").config({path: require("app-root-path") + "/.env"});
const logger = require("./../util/logger.js");
const mongoose = require("mongoose");
const Db = require("../data/db");
const fs = require("fs-extra");
const Sound = require("./../model/sound").Sound;
const path = require("path");
const Discord = require("discord.js");
const SOUNDS_DIRECTORY = process.env.JACQUES_SOUNDS_DIRECTORY;
const NEW_SOUNDS_FOLDER_NAME = "soundsCopy";
const syncUtils = require("./sync-utils");
var bot;

mongoose.connect("mongodb://localhost/jacques", function () {
    logger.info("Db connected!");

    bot = new Discord.Client();
    bot.login(process.env.JACQUES_TOKEN).then(function() {
        logger.info("Jacques logged in.");
    });
    bot.on("ready", function() {
        logger.info("Jacques ready");

        //Step 1: all current sounds need a guild ID.
        setCurrentSoundsToJellySpottersGuild().then(function() {
            logger.info("Completed step 1. All sounds are now set to have discord_guild 149253578081435648.");
            var soundsCopyPath = path.join(SOUNDS_DIRECTORY, "..", NEW_SOUNDS_FOLDER_NAME);

            //Step 2: gather all original sounds so we can dish out sound events to the appropriate guild sounds.
            Db.getAllSounds().then(function(originalSounds) {
                logger.info("Completed step 2. Original sounds with their events are stored in memory.");

                //Step 3: create a new folder with the current sounds so we can copy it into the root directory.
                fs.copy(SOUNDS_DIRECTORY, soundsCopyPath, function(err) {
                    if (err) {
                        logger.error(err);
                    } else {
                        logger.info("Completed step 3. Sounds have been copied into a new directory " + NEW_SOUNDS_FOLDER_NAME + ", which we can read from.");

                        //Step 4: empty the current sounds directory.
                        fs.emptyDir(SOUNDS_DIRECTORY, function(err) {
                            if (err) {
                                logger.error(err);
                            } else {
                                logger.info("Completed step 4. Root sounds directory is empty.");

                                //Step 5: copy the current sounds directory for each Discord Guild.
                                var discordGuilds = bot.guilds.array();

                                discordGuilds.forEach(function(discordGuild) {
                                    var discordGuildId = discordGuild.id;
                                    var discordGuildSoundsPath = path.join(SOUNDS_DIRECTORY, discordGuildId);

                                    try {
                                        fs.copySync(soundsCopyPath, discordGuildSoundsPath);
                                    } catch (err) {
                                        logger.error(err);
                                    }

                                });
                                logger.info("Completed step 5. Every guild has its own directory of sounds.");

                                logger.info("Beginning step 6. Running sync...");
                                syncUtils.sync().then(function() {
                                    logger.info("Completed step 6! Sync complete.");

                                    logger.info("Beginning final step (7). When it stops logging sound event updates, it is complete.");
                                    originalSounds.forEach(function(originalSound) {
                                        originalSound = originalSound.toObject();
                                        //Step 7: Give all new sounds the appropriate added date and sound events.
                                        Sound.findOneAndUpdate({name: originalSound.name}, {add_date: originalSound.add_date}, function(err) {
                                            if (err) {
                                                logger.error(err);
                                            }
                                        });

                                        if (originalSound.sound_events) {
                                            originalSound.sound_events.forEach(function(originalSoundEvent) {
                                                var guild = getGuildFromUserName(bot.guilds, originalSoundEvent.performed_by);
                                                if (guild) {
                                                    Sound.findOneAndUpdate(
                                                        {name: originalSound.name.replace(".mp3", ""), discord_guild: guild.id},
                                                        {$push: {sound_events: originalSoundEvent}},
                                                        function(err) {
                                                            if (err) {
                                                                logger.error(err);
                                                            } else {
                                                                logger.info("Gave event by " + originalSoundEvent.performed_by + " on sound " + originalSound.name + " to guild " + guild.id);
                                                            }
                                                        }
                                                    );
                                                }
                                            });
                                        }
                                    });
                                });
                            }
                        });
                    }
                });
            });
        }).catch(logger.error);
    });

});

function getGuildFromUserName(guilds, userName) {
    for (var guild of guilds.array()) {
        for (var member of guild.members.array()) {
            if (member.displayName === userName) {
                return guild;
            }
        }
    }
    return null;
}

function setCurrentSoundsToJellySpottersGuild() {
    return new Promise((resolve, reject) => {
        Sound.update({},
            {$set: {discord_guild: "149253578081435648"}}, {upsert: false, multi: true}, function(err) {
            if (err) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}