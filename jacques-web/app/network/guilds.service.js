"use strict";

angular
    .module("network")
    .service("GuildsService", function ($rootScope, $resource, $q) {
        var Guilds = $resource($rootScope.JACQUES_API_ROOT + "guilds/:guildId");
        return {
            getGuild: function (discordGuildId) {
                return $q(function(resolve, reject) {
                    Guilds.get({guildId: discordGuildId}, function (guild) {
                        resolve(guild);
                    }, function (err) {
                        reject(err);
                    });
                });
            },
            getGuilds: function () {
                return $q(function(resolve, reject) {
                    Guilds.query(function (guilds) {
                        resolve(guilds);
                    }, function (err) {
                        reject(err);
                    });
                });
            }
        }
    });