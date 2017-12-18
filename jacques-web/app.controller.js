"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {
        $rootScope.JACQUES_API_ROOT = "http://localhost:8081/api";

        var self = this;

        self.initializeUserValuesFromLocalStorage = function() {
            this.username = localStorage.getItem("jacques_discord_username");
            this.guildName = localStorage.getItem("jacques_discord_last_guild_name");

            console.log("Initialized values " + this.username + " and " + this.guildName + " from local storage.");
        };

        self.initializeUserValuesFromLocalStorage();

        self.getTitle = function() {
            return $rootScope.title;
        };

        self.getUsername = function() {
            return self.username;
        };

        self.getGuildName = function() {
            return self.guildName;
        };

        //Listen in on changes to our User.
        $rootScope.$watch("sharedProperties.getUser()", function(newUser) {
            console.log("user hcnaged!");
            if (newUser) {
                self.username = newUser.discord_username;
                self.guildName = newUser.discord_last_guild_name;
                console.log("guild name: " + self.guildName);

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

        $rootScope.$on("$locationChangeStart", function(event) {
            var sidenav = $mdSidenav("left");

            if (sidenav.isOpen()) {
                sidenav.close();
            } else if (angular.element(document.body).hasClass('md-dialog-is-showing')) {
                event.preventDefault();
                $mdDialog.cancel();
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