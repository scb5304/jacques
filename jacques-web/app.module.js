"use strict";

// Define the `jacquesApp` module
angular
    .module("jacquesApp", [
        "ngMaterial",
        "ngMessages",
        "ngResource",
        "ui.router",
        "home",
        "guildList",
        "soundsByGuild",
        "soundDetail",
        "soundList",
        "birdfeeder",
        "chart.js"
    ])
    .service("sharedProperties", function() {
        var sounds = [];
        var selected;
        var user;
        var guilds;

        return {
            getSounds: function() {
                return sounds;
            },
            setSounds: function(newSounds) {
                sounds = newSounds;
            },
            getSelected: function() {
                return selected;
            },
            setSelected: function(newSelected) {
                selected = newSelected;
            },
            getUser: function() {
                return user;
            },
            setUser: function(newUser) {
                user = newUser;
            },
            getGuilds: function() {
                return guilds;
            },
            setGuilds: function(newGuilds) {
                guilds = newGuilds;
            }
        };
    })
    .service("jacquesEndpointInterface", function($resource) {
        var Guilds = $resource("http://localhost:8081/api/guilds");
        var Sounds = $resource("http://localhost:8081/api/sounds/:guildId");

        return {
            getGuilds: function() {
                return new Promise((resolve, reject) => {
                    Guilds.query(function(guilds) {
                        return resolve(guilds);
                    }, function(err) {
                        return reject(err);
                    });
                });
            },
            getSoundsByGuild: function(discordGuildId) {
                return new Promise((resolve, reject) => {
                    Sounds.query({guildId: discordGuildId}, function(guilds) {
                        return resolve(guilds);
                    }, function(err) {
                        return reject(err);
                    });
                });
            },
            // getSoundByName: function(discordGuildId, soundName) {
            //     return new Promise((resolve, reject) => {
            //         Sounds.get({guildId: discordGuildId, name: soundName}, function(guilds) {
            //             return resolve(guilds);
            //         }, function(err) {
            //             return reject(err);
            //         });
            //     });
            // }
        }
    });
