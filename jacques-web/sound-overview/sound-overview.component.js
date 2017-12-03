"use strict";

angular
    .module("soundOverview")
    .component("soundOverview", {
        templateUrl: "sound-overview/sound-overview.template.html",
        controller: ["$scope", "sharedProperties",
            function SoundDetailController($scope, sharedProperties) {
                console.log("Hello there!");
            }
        ]
    });