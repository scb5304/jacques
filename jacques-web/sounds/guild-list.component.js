"use strict";

angular
    .module("guildList")
    .component("guildList", {
        bindings: {guilds: "<"},
        templateUrl: "sounds/guild-list.template.html",
        controller: ["$scope",
            function GuildListController($scope) {

            }
        ]
    });