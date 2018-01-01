require("dotenv").config({path: require("app-root-path") + "/.env"});
var Discord = require("discord.js");
var Db = require("./../common/data/db");
var logger = require("./../common/util/logger.js");
var mongoose = require("mongoose");
var jacques = require("./jacques-core");
var bot;

logger.info("Running jacques-bot.js...");

runJacques();

function runJacques() {
    logger.info("Running Jacques...");

    ensureConnectedToDatabase().then(function() {
        bot = new Discord.Client();
        bot.login(process.env.JACQUES_TOKEN).then(function() {
            logger.info("Jacques logged in.");
            jacques.setClientInstance(bot);
            initClientEventListeners();
        });
    }).catch(function(err) {
       logger.error("Could not run Jacques due to a database connection failure: " + err);
    });
}

function ensureConnectedToDatabase() {
    /*
     * 0 = disconnected
     * 1 = connected
     * 2 = connecting
     * 3 = disconnecting
     */
    return new Promise((resolve, reject) => {
        var readyState = mongoose.connection.readyState;
        if (readyState !== 1 && readyState !== 2) {
            Db.connect().then(function(err) {
                if (err) {
                    return reject(err);
                } else {
                    logger.info("Jacques bot now connected to database.");
                    return resolve();
                }
            });
        } else {
            logger.info("Jacques bot already connected to database.");
            return resolve();
        }
    });
}

function initClientEventListeners() {
    bot.on("disconnect", onDisconnect);
    bot.on("error", logger.error);
    bot.on("ready", jacques.onReady);
    bot.on("message", jacques.onMessage);
    bot.on("guildCreate", jacques.onGuildCreate);
    bot.on("guildDelete", jacques.onGuildDelete);
}

function onDisconnect() {
    runJacques();
}
