"use strict";

angular
    .module("jacquesApp")
    .config(function ($mdIconProvider, $mdThemingProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("green")
            .accentPalette("deep-orange");
        $mdIconProvider
            .icon("view-list", "app/assets/svg/view-list.svg")
            .icon("menu", "app/assets/svg/menu.svg")
            .icon("help", "app/assets/svg/help-circle-outline.svg")
            .icon("github", "app/assets/svg/github-circle.svg")
            .icon("close", "app/assets/svg/close.svg")
            .icon("birdfeed", "app/assets/svg/hops.svg")
            .icon("chevron-up", "app/assets/svg/chevron-up.svg")
            .icon("invite", "app/assets/svg/person_add.svg")
            .icon("search", "app/assets/svg/magnify.svg")
            .icon("sort", "app/assets/svg/sort.svg")
            .icon("sound", "app/assets/svg/music-box.svg")
            .icon("delete", "app/assets/svg/delete-forever.svg")
            .icon("discord", "app/assets/svg/discord.svg")
            .icon("arrow-top-left", "app/assets/svg/arrow-top-left.svg");
        $urlRouterProvider.when("", "/");
        $urlMatcherFactoryProvider.strictMode(false);
    });
