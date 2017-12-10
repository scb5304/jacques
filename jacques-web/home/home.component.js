"use strict";

angular
    .module("home")
    .component("home", {
        templateUrl: "home/home.template.html",
        controller: ["$scope", "sharedProperties",
            function HomeController($scope, sharedProperties) {
                //console.log("Hello there!");
                //jacquesEndpointInterface.getGuilds();
            }
        ]
    });