const Db = require("../data/db");
const mongoose = require("mongoose");
const fs = require("fs");
var SOUNDS_DIRECTORY = "./../../sounds/";
const Sound = require("./../model/sound").Sound;
const logger = require("./../util/logger.js");

const readdirp = require("readdirp");
const path = require("path");

const ROOT_PATH = path.resolve(path.join(SOUNDS_DIRECTORY));

function beginSync() {
    Db.getAllSounds().then(function(dbSounds) {
        performSync(dbSounds);
    });
}

function connect() {
    logger.info("Getting db ready...");
    mongoose.connect("mongodb://localhost/jacques", function() {
        logger.info("Db connected!");
        beginSync();
    });
}

function onSoundInFileSystemNotInDatabase(soundName, discordGuildId) {
    if (!discordGuildId) {
        return;
    }
    logger.info("Adding " + soundName + ", " + discordGuildId + " to the database! It's in the file system but not the database.");
    var newSound = Sound({
        name: soundName,
        add_date: new Date(),
        added_by: "Server",
        discord_guild: discordGuildId
    });
    newSound.save(function(err) {
        if (err) {
            logger.error(err);
        }
    });
}

function fileSystemContainsDbSound(soundsFoundInFileSystem, dbSound) {
    var dbSoundName = dbSound.name;
    var dbSoundDiscordGuildId = dbSound.discord_guild;

    for (var fsSound of soundsFoundInFileSystem) {
        var fsSoundName = getSoundNameWithoutExtensionFromEntry(fsSound);
        var fsSoundDiscordGuildId = getSoundDiscordGuildIdFromEntry(fsSound);

        if (dbSoundName === fsSoundName && dbSoundDiscordGuildId === fsSoundDiscordGuildId) {
            return true;
        }
    }

    return false;
}

function performSync(dbSounds) {
    logger.info("Beginning sync...");

    var soundsFoundInFileSystem = [];

    readdirp({root: ROOT_PATH})
        .on("warn", function (err) {
            logger.error("non-fatal error", err);
        })
        .on("error", function (err) {
            logger.error("fatal error", err);
        })
        .on("data", function (entry) {
            soundsFoundInFileSystem.push(entry);
            var soundName = getSoundNameWithoutExtensionFromEntry(entry);
            var discordGuildId = getSoundDiscordGuildIdFromEntry(entry);

            //See if it is in the database already.
            var dbSound = getSoundWithNameAndGuildIdFromList(dbSounds, soundName, discordGuildId);
            if (!dbSound) {
                onSoundInFileSystemNotInDatabase(soundName, discordGuildId);
            }
        })
        .on("end", function () {
            //Now we need to see if there are sounds no longer in the file system but still in the database.

            dbSounds.forEach(function(dbSound) {
                if (!fileSystemContainsDbSound(soundsFoundInFileSystem, dbSound)) {
                    logger.info("Removing " + dbSound.name + " from the database for guild " + dbSound.discord_guild + ".");

                    Sound.remove({
                        name: dbSound.name,
                        discord_guild: dbSound.discord_guild
                    }, function(err) {
                        if (err) {
                            logger.error(err);
                        }
                    });
                }
            });
            logger.info("Sync completed.");
        });
}

function getSoundWithNameAndGuildIdFromList(soundList, soundName, discordGuildId) {
    for (var sound of soundList) {
        if (sound.name === soundName) {
            if ((!sound.discord_guild && !discordGuildId) || sound.discord_guild === discordGuildId) {
                return sound;
            }
        }
    }
    return null;
}

function getSoundDiscordGuildIdFromEntry(entry) {
    //Get the parent directory name to check if this file is for a particular guild.
    var parentDirName = path.basename(entry.fullParentDir);
    var discordGuildId;

    //If it's not in the root directory, then its parent identifies the discord guild it belongs to.
    if (parentDirName !== "sounds") {
        discordGuildId = parentDirName;
    }
    return discordGuildId;
}

function getSoundNameWithoutExtensionFromEntry(entry) {
    return entry.name.split(".")[0];
}


connect();