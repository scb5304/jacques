"use strict";
angular
    .module("guildList", [])
    .config(["$stateProvider", function ($stateProvider) {
        var guildListState = {
            name: "guildList",
            url: "/sounds",
            component: "guildList",
            resolve: {
                guilds: function(GuildsService) {
                    return GuildsService.getGuilds();
                }
            },
            data: {
                pageTitle: "Guilds"
            }
        };
        $stateProvider.state(guildListState);
    }]);