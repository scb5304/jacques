'use strict';

angular
    .module('jacquesApp')
    .controller('AppController', function AppController($rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {

    $rootScope.$on('$locationChangeSuccess', function(event){
        var sounds = sharedProperties.getSounds();

        sounds.forEach(function(sound) {
            if ("/" + sound.cleanedName === $location.path()) {
                sharedProperties.setSelected(sound);
            }
        });
    });

    $http.get('http://jacquesbot.io/api/sounds').then(function(soundsJSON) {
        var sounds = soundsJSON.data;
        var soundFromURL;
        sounds.forEach(function(sound) {
            sound.cleanedName = sound.name.split("\.")[0];
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
    };

    this.HelpDialogController = function() {
        var self = this;
        self.closeDialog = function() {
            $mdDialog.hide();
        }
    }
});