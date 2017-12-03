"use strict";

angular.module("soundList")
    .component("soundList", {
        templateUrl: "sound-list/sound-list.template.html",
        controller: ["$scope", "sharedProperties",
            function SoundListController($scope, sharedProperties) {
                //Pulls in any values we stored in local storage.
                $scope.initializeUserValuesFromLocalStorage = function() {
                    $scope.username = localStorage.getItem("jacques_discord_username");
                    $scope.guildId = localStorage.getItem("jacques_discord_last_guild_id");
                };

                //Initialize our values.
                $scope.sharedProperties = sharedProperties;
                $scope.soundSearchQuery = "";
                $scope.initializeUserValuesFromLocalStorage();

                //Listen in on changes to our User.
                $scope.$watch("sharedProperties.getUser()", function(newUser) {
                    if (newUser) {
                        $scope.username = newUser.discord_username;
                        $scope.guildId = newUser.discord_last_guild_id;

                        if ($scope.username) {
                            localStorage.setItem("jacques_discord_username", $scope.username);
                        } else {
                            localStorage.removeItem("jacques_discord_username");
                        }
                        if ($scope.guildId) {
                            localStorage.setItem("jacques_discord_last_guild_id", $scope.guildId);
                        } else {
                            localStorage.removeItem("jacques_discord_last_guild_id");
                        }
                        $scope.refreshGuildName(sharedProperties.getGuilds());
                    }
                });

                //Listen in on changes to our list of Guilds.
                $scope.$watch("sharedProperties.getGuilds()", function(newGuilds) {
                    if (newGuilds) {
                        $scope.refreshGuildName(newGuilds);
                    }
                });

                $scope.getUsername = function getUsername() {
                    return $scope.username;
                };

                //Provide the sounds to the side-nav list.
                $scope.getSounds = function getSounds() {
                    return sharedProperties.getSounds();
                };

                //Provide the guild descriptor, ideally its name if we have it, otherwise the ID.
                $scope.getGuildDescriptor = function getGuildDescriptor() {
                    if ($scope.guildName) {
                        return $scope.guildName;
                    } else {
                        return $scope.guildId;
                    }
                };

                //Updates the scope's guild name
                $scope.refreshGuildName = function refreshGuildName(guilds) {
                    $scope.guildName = undefined;
                    guilds.forEach(function(guild) {
                        if (guild.discord_id === $scope.guildId) {
                            $scope.guildName = guild.discord_name;
                        }
                    });
                };

                //Update the selected sound in shared properties when it is selected.
                $scope.updateSelected = function updateSelected(sound) {
                    $scope.sharedProperties.setSelected(sound);
                };
            }
        ]
    });
