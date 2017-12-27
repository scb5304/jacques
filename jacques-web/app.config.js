"use strict";

angular
    .module("jacquesApp")
    .config(function ($mdIconProvider, $mdThemingProvider, $urlRouterProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("green")
            .accentPalette("deep-orange");
        $mdIconProvider
            .icon("view-list", "assets/svg/view-list.svg", 24)
            .icon("menu", "assets/svg/menu.svg", 24)
            .icon("help", "assets/svg/help-circle-outline.svg", 24)
            .icon("github", "assets/svg/github-circle.svg", 24)
            .icon("close", "assets/svg/close.svg", 24)
            .icon("birdfeed", "assets/svg/hops.svg", 24)
            .icon("chevron-up", "assets/svg/chevron-up.svg", 24)
            .icon("invite", "assets/svg/person_add.svg", 24)
            .icon("arrow-top-left", "assets/svg/arrow-top-left.svg", 24);
        $urlRouterProvider.when('', '/');
    });
