"use strict";
angular
    .module("soundsByGuild", [])
    .config(["$stateProvider", function ($stateProvider) {
        var soundsByGuildState = {
            name: 'soundsByGuild',
            url: '/sounds/{guildId}',
            component: 'soundsByGuild',
            resolve: {
                guild: function ($transition$, jacquesEndpointInterface) {
                    var guildId = $transition$.params().guildId;
                    return jacquesEndpointInterface.getGuild(guildId);
                },
                sounds: function ($transition$, jacquesEndpointInterface) {
                    var guildId = $transition$.params().guildId;
                    return jacquesEndpointInterface.getSoundsByGuild(guildId);
                }
            },
            data: {
                pageTitle: "Sounds"
            }
        };
        $stateProvider.state(soundsByGuildState);
    }]);