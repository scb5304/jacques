"use strict";

angular.module("soundList")
    .component("soundList", {
        templateUrl: "sound-list/sound-list.template.html",
        controller: ["$scope", "sharedProperties",
            function SoundListController($scope, sharedProperties) {
                $scope.sharedProperties = sharedProperties;
                $scope.soundSearchQuery = "";
                $scope.username = localStorage.getItem("jacques_discord_username");
                $scope.guildId = localStorage.getItem("jacques_discord_last_guild_id");

                $scope.$watch("sharedProperties.getUser()", function(newUser) {
                    if (newUser) {
                        $scope.username = newUser.discord_username;
                        $scope.guildId = newUser.discord_last_guild_id;
                        localStorage.setItem("jacques_discord_username", $scope.username);
                        localStorage.setItem("jacques_discord_last_guild_id", $scope.guildId);
                    }
                });

                $scope.getSounds = function getSounds() {
                    return sharedProperties.getSounds();
                };

                $scope.updateSelected = function updateSelected(sound) {
                    $scope.sharedProperties.setSelected(sound);
                };
            }
        ]
    });
