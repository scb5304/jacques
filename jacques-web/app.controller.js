"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($scope, $rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {
        $rootScope.JACQUES_API_ROOT = "http://localhost:8081/api";

        var self = this;
        $scope.sharedProperties = sharedProperties;

        self.initializeUserValuesFromLocalStorage = function() {
            self.username = localStorage.getItem("jacques_discord_username");
            self.guildName = localStorage.getItem("jacques_discord_last_guild_name");

            console.log("Initialized values " + this.username + " and " + this.guildName + " from local storage.");
        };

        self.initializeUserValuesFromLocalStorage();

        self.getTitle = function() {
            return $rootScope.title;
        };

        //Listen in on changes to our User.
        $scope.$watch("sharedProperties.getUser()", function(newUser) {
            if (newUser) {
                self.username = newUser.discord_username;
                self.guildName = newUser.discord_last_guild_name;

                if (self.username) {
                    localStorage.setItem("jacques_discord_username", self.username);
                } else {
                    localStorage.removeItem("jacques_discord_username");
                }
                if (self.guildName) {
                    localStorage.setItem("jacques_discord_last_guild_name", self.guildName);
                } else {
                    localStorage.removeItem("jacques_discord_last_guild_name");
                }
            }
        });

        self.toggleList = function() {
            $mdSidenav("left").toggle();
        };

        self.onSidenavSwipedLeft = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        };

        self.onSidenavSwipedRight = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.open();
            }
        };

        self.onSidenavItemClicked = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        }
    });