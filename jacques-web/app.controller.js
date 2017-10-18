"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {

        var self = this;

        $rootScope.$on("$locationChangeSuccess", function() {
            var sounds = sharedProperties.getSounds();

            sounds.forEach(function(sound) {
                if ("/" + sound.cleanedName === $location.path()) {
                    sharedProperties.setSelected(sound);
                    $mdSidenav("left").close()
                }
            });
        });

        $rootScope.$on('$locationChangeStart', function(event) {
        	var sidenav = $mdSidenav("left");
        	
		    if (sidenav.isOpen()) {
		    	sidenav.close();
		        event.preventDefault();
		    } else if (angular.element(document.body).hasClass('md-dialog-is-showing')) {
		    	event.preventDefault();
		    	$mdDialog.cancel();
		    }
		});

        $http.get("http://jacquesbot.io/api/sounds").then(function(soundsJSON) {
            self.fetchCategories();

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

        this.fetchCategories = function() {
            $http.get("http://jacquesbot.io/api/categories").then(function(categoriesJSON) {
                var categories = categoriesJSON.data;
                sharedProperties.setCategories(categories);
            });
        };

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
            }
        };
    });