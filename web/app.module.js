'use strict';

// Define the `jacquesApp` module
angular
    .module('jacquesApp', [
        'ngMaterial',
        'soundDetail',
        'soundList',
        'chart.js',
    ])
    .controller('AppController', function AppController($location, $http, sharedProperties, $mdSidenav, $mdDialog) {

        $http.get('http://jacquesbot.io/api/sounds').then(function(soundsJSON) {
            var sounds = soundsJSON.data;
            var soundFromURL;
            sounds.forEach(function(sound) {
                sound.cleanedName = sound.name.split("\.")[0];
                if ("/" + sound.cleanedName == $location.path()) {
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

        this.toggleList = function() {
            $mdSidenav('left').toggle()
        };

        this.showHelp = function() {
            $mdDialog.show({
                templateUrl: 'help.html',
                clickOutsideToClose: true,
                controller: this.HelpDialogController,
                controllerAs: "$ctrl"
            });
        }

        this.HelpDialogController = function() {
            var self = this;
            self.closeDialog = function() {
                $mdDialog.hide();
            }
        }
    })
    .service('sharedProperties', function() {
        var sounds = [];
        var selected;

        return {
            getSounds: function() {
                return sounds;
            },
            setSounds: function(newSounds) {
                sounds = newSounds;
            },
            getSelected: function() {
                return selected;
            },
            setSelected: function(newSelected) {
                selected = newSelected;
            }
        }
    });
