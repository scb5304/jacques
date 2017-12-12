"use strict";

angular
    .module("guildList")
    .component("guildList", {
        bindings: {guilds: "<"},
        templateUrl: "sounds/guild-list.template.html",
        controller: ["$scope", "sharedProperties",
            function GuildListController($scope, sharedProperties) {
                $scope.selectedGuildId = "";

                $scope.$watch("selectedGuild", function(newSelectedGuild) {
                    console.log(newSelectedGuild);
                });
            }
        ]
    });