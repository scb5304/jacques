'use strict';

// Define the `jacquesApp` module
angular
    .module('jacquesApp', [
        'ngMaterial',
        'core',
        'soundDetail',
        'soundList',
        'floating',
        'chart.js',
    ])
    .controller('AppController', function AppController($http, sharedProperties, $mdSidenav) {

        $http.get('http://jacquesbot.io/api/sounds').then(function(sounds) {
            var clientSounds = [];
            for (var i = 0; i < sounds.data.length; i++) {
                var sound = sounds.data[i];
                sound.cleanedName = sound.name.split("\.")[0];
                clientSounds.push(sound);
            }

            sharedProperties.setSounds(clientSounds);
            sharedProperties.setSelected(sharedProperties.getSounds()[0])
        })

        this.toggleList = function() {
            $mdSidenav('left').toggle()
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
                console.log("setting selected");
                selected = newSelected;
                console.log("done setting selected");
            }
        }
    });
