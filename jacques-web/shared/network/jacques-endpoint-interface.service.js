"use strict";

angular
    .module("jacquesApp")
    .service("jacquesEndpointInterface", function ($resource, $q) {
        var Guilds = $resource("http://localhost:8081/api/guilds/:guildId");
        var SoundsByGuild= $resource("http://localhost:8081/api/sounds/:guildId?includeSoundEvents=:includeEvents");
        var SoundsByGuildAndName = $resource("http://localhost:8081/api/sounds/:guildId/:soundName");

        //Why can't I include birdfeed in the request body, Angular? DELETE is supposed to support this.
        var SoundsByGuildAndNameWithBirdfeedParam = $resource("http://localhost:8081/api/sounds/:guildId/:soundName?birdfeed=:birdfeed");

        return {
            getGuilds: function () {
                return $q(function(resolve, reject) {
                    Guilds.query(function (guilds) {
                        resolve(guilds);
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            getGuild: function (discordGuildId) {
                return $q(function(resolve, reject) {
                    Guilds.get({guildId: discordGuildId}, function (guild) {
                        resolve(guild);
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            getSoundsByGuild: function (discordGuildId) {
                return $q(function(resolve, reject) {
                    SoundsByGuild.query({guildId: discordGuildId, includeEvents: false}, function (guilds) {
                        resolve(guilds);
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            getSoundByName: function (discordGuildId, soundName) {
                return $q(function(resolve, reject) {
                    SoundsByGuildAndName.get({guildId: discordGuildId, soundName: soundName}, function (sound) {
                        resolve(sound);
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            deleteSound: function(discordGuildId, soundName, birdfeed_token) {
                return $q(function(resolve, reject) {
                    SoundsByGuildAndNameWithBirdfeedParam.delete({guildId: discordGuildId, soundName: soundName, birdfeed: birdfeed_token}, function () {
                        resolve();
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            postSound: function(discordGuildId, soundName, soundData, birdfeed) {
                return $q(function(resolve, reject) {
                    var sound = {soundData: soundData, birdfeed: birdfeed};
                    SoundsByGuildAndName.save({guildId: discordGuildId, soundName: soundName}, sound, function () {
                        resolve();
                    }, function (err) {
                        reject(err);
                    });
                });
            }
        }
    });