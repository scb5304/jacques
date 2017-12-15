"use strict";

// Define the `jacquesApp` module
angular
    .module("jacquesApp", [
        "ngMaterial",
        "ngMessages",
        "ngResource",
        "ui.router",
        "home",
        "scrollToTop",
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
    .directive('scroll', function ($window) {
        return {
            link: function (scope, elem, attrs) {
                elem.on('scroll', function (e) {
                    var fab = document.getElementById("fab-scroll-to-top");
                    if (!fab) {
                        return;
                    }
                    var mainContent = document.getElementById("main-content");

                    if (!mainContent) {
                        return;
                    }

                    if (mainContent.scrollTop > 400) {
                        fab.style.visibility = "visible";
                    } else {
                        fab.style.visibility = "hidden";
                    }
                });
            }
        };
    })
    .service("jacquesEndpointInterface", function($resource) {
        var Guilds = $resource("http://localhost:8081/api/guilds/:guildId");
        var Sounds = $resource("http://localhost:8081/api/sounds/:guildId/:soundName");

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
            getGuild: function(discordGuildId) {
                return new Promise((resolve, reject) => {
                    Guilds.get({guildId: discordGuildId}, function(guild) {
                        return resolve(guild);
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
            getSoundByName: function(discordGuildId, soundName) {
                return new Promise((resolve, reject) => {
                    Sounds.get({guildId: discordGuildId, soundName: soundName}, function(sound) {
                        return resolve(sound);
                    }, function(err) {
                        return reject(err);
                    });
                });
            }
        }
    });
