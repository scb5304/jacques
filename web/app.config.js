'use strict';

angular
    .module('jacquesApp')
    .config(function($mdIconProvider, $mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('deep-orange');
        $mdIconProvider
            .icon("menu", "assets/svg/menu.svg", 24)
            .icon("help", "assets/svg/help-circle-outline.svg", 24)
            .icon("github", "assets/svg/github-circle.svg", 24)
            .icon("invite", "assets/svg/person_add.svg", 24);
    });
