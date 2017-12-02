const logger = require("../common/util/logger");
var Discord = require("discord.js");
var bot;

login();

function login() {
    bot = new Discord.Client();
    bot.login(process.env.JACQUES_TOKEN);
}

function ensureLoggedIn() {
    if (!bot || !bot.user) {
        logger.error("Not logged in, trying to log in.");
        login();
        return false;
    } else {
        return true;
    }
}

function getGuilds(req, res) {
    if (!ensureLoggedIn() || !bot.guilds) {
        res.status(500).send();
    } else {
        var discordGuildArray = bot.guilds.array();
        var myGuildArray = [];

        for (var guild of discordGuildArray) {
            var myGuild = {
                "id": guild.id,
                "name": guild.name
            };
            myGuildArray.push(myGuild);
        }
        res.json(myGuildArray);
    }
}

module.exports.getGuilds = getGuilds;