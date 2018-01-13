"use strict";

angular
    .module("network")
    .service("SoundsService", function ($rootScope, $resource, $q) {
        var SoundsByGuild = $resource($rootScope.JACQUES_API_ROOT + "sounds/:guildId?includeSoundEvents=:includeEvents");
        var SoundsByGuildAndName = $resource($rootScope.JACQUES_API_ROOT + "sounds/:guildId/:soundName");
        //Why can't I include birdfeed in the request body, Angular? DELETE is supposed to support this.
        var SoundsByGuildAndNameWithBirdfeedParam = $resource($rootScope.JACQUES_API_ROOT + "sounds/:guildId/:soundName?birdfeed=:birdfeed");

        return {
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
            deleteSound: function(discordGuildId, soundName, birdfeed) {
                return $q(function(resolve, reject) {
                    SoundsByGuildAndNameWithBirdfeedParam.delete({guildId: discordGuildId, soundName: soundName, birdfeed: birdfeed}, function () {
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
        };
    });