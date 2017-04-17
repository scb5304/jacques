'use strict';

// Define the `jacquesApp` module
angular.module('jacquesApp', [
    'ngMaterial',
    'core',
    'soundDetail',
    'soundList',
    'floating',
    'chart.js',
]).config(($mdIconProvider, $mdThemingProvider) => {
    $mdThemingProvider.theme('default')
        .primaryPalette('green')
        .accentPalette('deep-orange');
    $mdIconProvider
        .icon("menu", "assets/svg/menu.svg", 24)
        .icon("invite", "assets/svg/person_add.svg", 24);
}).controller('AppController', function AppController($http, sharedProperties, $mdSidenav) {

    $http.get('http://jacquesbot.io/api/sounds').then(function(sounds) {
        for (var sound of sounds.data) {
            sound.cleanedName = sound.name.split("\.")[0];
        }
        sharedProperties.setSounds(sounds.data);
        sharedProperties.setSelected(sharedProperties.getSounds()[0])
    })
    var testSoundEvent = {
        category: "playTargeted",
        date: "2017-04-26T23:28:51.739Z",
        performed_by: "Spitsonpuppies",
        id: "8cb435f90aef47610d4c8j8"
    };

    console.log("hello")

    this.toggleList = function() {
        console.log("ah, hello there")
        $mdSidenav('left').toggle()
    }

}).service('sharedProperties', function() {
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
