'use strict';

// Define the `jacquesApp` module
angular
    .module('jacquesApp', [
        'ngMaterial',
        'soundDetail',
        'soundList',
        'floating',
        'chart.js',
    ])
    .controller('AppController', function AppController($http, sharedProperties, $mdSidenav) {

        $http.get('http://jacquesbot.io/api/sounds').then(function(soundsJSON) {
            var sounds = soundsJSON.data;
            sounds.forEach(function(sound) {
                sound.cleanedName = sound.name.split("\.")[0];
            });

            sharedProperties.setSounds(sounds);
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
                selected = newSelected;
            }
        }
    });
