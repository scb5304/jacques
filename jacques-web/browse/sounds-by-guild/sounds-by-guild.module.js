"use strict";
angular
    .module("soundsByGuild", [])
    .config(["$stateProvider", function ($stateProvider) {
        var soundsByGuildState = {
            name: "soundsByGuild",
            url: "/sounds/{guildId}",
            component: "soundsByGuild",
            resolve: {
                guild: function ($transition$, GuildsService) {
                    var guildId = $transition$.params().guildId;
                    return GuildsService.getGuild(guildId);
                },
                sounds: function ($transition$, SoundsService) {
                    var guildId = $transition$.params().guildId;
                    return SoundsService.getSoundsByGuild(guildId);
                }
            },
            data: {
                pageTitle: "Sounds"
            }
        };
        $stateProvider.state(soundsByGuildState);
    }]);