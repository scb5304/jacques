"use strict";

// Register `soundList` component, along with its associated controller and template
angular.module("soundList")
    .component("soundList", {
        templateUrl: "sound-list/sound-list.template.html",
        controller: ["$scope", "sharedProperties",
            function SoundListController($scope, sharedProperties) {
                $scope.sharedProperties = sharedProperties;
                $scope.soundSearchQuery = "";

                $scope.getSounds = function getSounds() {
                    return sharedProperties.getSounds();
                };

                $scope.updateSelected = function updateSelected(sound) {
                    $scope.sharedProperties.setSelected(sound);
                };
            }
        ]
    });
