"use strict";

// Register `soundList` component, along with its associated controller and template
angular.module("soundList")
    .component("soundList", {
        templateUrl: "sound-list/sound-list.template.html",
        controller: ["$scope", "sharedProperties",
            function SoundListController($scope, sharedProperties) {
                $scope.sharedProperties = sharedProperties;
                $scope.soundSearchQuery = "";
                $scope.selectedCategory = "all";

                $scope.getSounds = function getSounds() {
                    return sharedProperties.getSounds();
                };

                $scope.getCategories = function getCategories() {
                    var defaultCategories = ["all"];
                    var soundCategories = sharedProperties.getCategoryNames();
                    return defaultCategories.concat(soundCategories);
                };

                $scope.updateSelected = function updateSelected(sound) {
                    $scope.sharedProperties.setSelected(sound);
                };

                $scope.soundMatchesFilter = function soundMatchesFilter(sound) {
                    return $scope.selectedCategory === "all" || $scope.selectedCategory === sound.category;
                }
            }
        ]
    });
