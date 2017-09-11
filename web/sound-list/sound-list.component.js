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
                    var sounds = $scope.getSounds();
                    var soundCategories = ["all"];
                    var derivedCategories = [];

                    sounds.forEach(function(sound) {
                        if (sound.category && derivedCategories.indexOf(sound.category) == -1) {
                            derivedCategories.push(sound.category);
                        }
                    });
                    derivedCategories.sort();
                    soundCategories = soundCategories.concat(derivedCategories);
                    return soundCategories;
                }

                $scope.updateSelected = function updateSelected(sound) {
                    $scope.sharedProperties.setSelected(sound);
                }

                $scope.categoryFilter = function categoryFilter(sound) {
                    return $scope.selectedCategory === "all" || $scope.selectedCategory === sound.category;
                }
            }
        ]
    });
