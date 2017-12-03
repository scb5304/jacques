"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {

        var self = this;

        $rootScope.JACQUES_API_ROOT = "http://localhost:8081/api";

        $rootScope.$on("$locationChangeStart", function(event) {
            var sidenav = $mdSidenav("left");

            if (sidenav.isOpen()) {
                sidenav.close();
                event.preventDefault();
            } else if (angular.element(document.body).hasClass('md-dialog-is-showing')) {
                event.preventDefault();
                $mdDialog.cancel();
            }
        });

        $http.get($rootScope.JACQUES_API_ROOT + "/sounds").then(function(soundsJSON) {
            var sounds = soundsJSON.data;
            var soundFromURL;
            sounds.forEach(function(sound) {
                sound.cleanedName = sound.name.split(".")[0];
                if ("/" + sound.cleanedName === $location.path()) {
                    soundFromURL = sound;
                }
            });

            sharedProperties.setSounds(sounds);

            if (soundFromURL) {
                sharedProperties.setSelected(soundFromURL);
            } else {
                sharedProperties.setSelected(sharedProperties.getSounds()[0]);
            }
        });

        $http.get($rootScope.JACQUES_API_ROOT + "/guilds").then(function(guildsJSON) {
        	var guilds = guildsJSON.data;
        	sharedProperties.setGuilds(guilds);
        });

        this.toggleList = function() {
            $mdSidenav("left").toggle();
        };

        this.showHelp = function() {
            $mdDialog.show({
                templateUrl: "help.html",
                clickOutsideToClose: true,
                controller: this.HelpDialogController,
                controllerAs: "$ctrl"
            });
        };

        this.HelpDialogController = function() {
            var self = this;
            self.closeDialog = function() {
                $mdDialog.hide();
            };
        };
    });