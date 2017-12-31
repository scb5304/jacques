"use strict";

angular
    .module("jacquesApp")
    .config(function ($mdIconProvider, $mdThemingProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("green")
            .accentPalette("deep-orange");
        $mdIconProvider
            .icon("view-list", "shared/assets/svg/view-list.svg")
            .icon("menu", "shared/assets/svg/menu.svg")
            .icon("help", "shared/assets/svg/help-circle-outline.svg")
            .icon("github", "shared/assets/svg/github-circle.svg")
            .icon("close", "shared/assets/svg/close.svg")
            .icon("birdfeed", "shared/assets/svg/hops.svg")
            .icon("chevron-up", "shared/assets/svg/chevron-up.svg")
            .icon("invite", "shared/assets/svg/person_add.svg")
            .icon("search", "shared/assets/svg/magnify.svg")
            .icon("sort", "shared/assets/svg/sort.svg")
            .icon("sound", "shared/assets/svg/music-box.svg")
            .icon("delete", "shared/assets/svg/delete-forever.svg")
            .icon("discord", "shared/assets/svg/discord.svg")
            .icon("arrow-top-left", "shared/assets/svg/arrow-top-left.svg");
        $urlRouterProvider.when('', '/');
        $urlMatcherFactoryProvider.strictMode(false);
    });
