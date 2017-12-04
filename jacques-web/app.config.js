"use strict";

angular
    .module("jacquesApp")
    .config(function ($mdIconProvider, $mdThemingProvider, $routeProvider) {
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
            .icon("invite", "assets/svg/person_add.svg", 24);
        $routeProvider
            .when("/", {
                templateUrl: "sound-overview/sound-overview.template.html",
                title: "Home",
            })
            .when("/sounds", {
                templateUrl: "sounds/sounds.template.html",
                title: "Sounds"
            })
            .when("/upload", {
                templateUrl: "green.htm",
                title: "Upload"
            })
            .when("/help", {
                templateUrl: "blue.htm",
                title: "Help"
            })
            .when("/contact", {
                templateUrl: "blue.htm",
                title: "Contact"
            });
    });
