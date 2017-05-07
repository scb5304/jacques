'use strict';

angular
    .module('jacquesApp')
    .config(($mdIconProvider, $mdThemingProvider) => {
        $mdThemingProvider.theme('default')
            .primaryPalette('green')
            .accentPalette('deep-orange');
        $mdIconProvider
            .icon("menu", "assets/svg/menu.svg", 24)
            .icon("invite", "assets/svg/person_add.svg", 24);
    });
