"use strict";

angular
    .module("soundsByGuild")
    .component("soundsByGuild", {
        bindings: {guild: "<", sounds: "<"},
        templateUrl: "sounds/sounds-by-guild/sounds-by-guild.template.html",
        controller: ["$scope", "sharedProperties",
            function SoundsByGuildController($scope, sharedProperties) {
                console.log("Hello there buddy!");
            }
        ]
    });