"use strict";

angular
    .module("home")
    .component("home", {
        bindings: {statisticsObject: "<"},
        templateUrl: "home/home.template.html",
        controller: ["$scope",
            function HomeController($scope) {

            }
        ]
    });