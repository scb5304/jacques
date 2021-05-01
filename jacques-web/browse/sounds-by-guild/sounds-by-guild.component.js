"use strict";

angular
    .module("soundsByGuild")
    .component("soundsByGuild", {
        bindings: {guild: "<", sounds: "<"},
        templateUrl: "browse/sounds-by-guild/sounds-by-guild.template.html",
        controller: ["$scope",
            function SoundsByGuildController($scope) {
                $scope.sounds = this.sounds;
                var storedSelection = localStorage.getItem("soundSortSelection")
                if (storedSelection === null) {
                    localStorage.setItem("soundSortSelection", "Alphabetical")
                }
                $scope.sortSelection = localStorage.getItem("soundSortSelection");

                $scope.$watch("sortSelection", function() {
                    if (!$scope.sounds) {
                        return;
                    }
                    $scope.onSortOptionSelected();
                });

                $scope.onSortOptionSelected = function() {
                    localStorage.setItem("soundSortSelection", $scope.sortSelection);
                    switch ($scope.sortSelection) {
                        case "Alphabetical":
                            $scope.sounds.sort(function(a, b) {
                                return a.name.localeCompare(b.name);
                            });
                            break;
                        case "Popularity":
                            $scope.sounds.sort(function(a, b) {
                                return b.soundEventCount - a.soundEventCount;
                            });
                            break;
                        case "Date Added":
                            $scope.sounds.sort(function(a, b) {
                                return new Date(b.add_date) - new Date(a.add_date);
                            });
                            break;
                    }
                };

                $scope.getFormattedDateFromString = function(dateString) {
                    return new Date(dateString).toLocaleDateString("en", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    });
                };

                $scope.getTotalPlayCount = function() {
                    var playCount = 0;
                    $scope.sounds.forEach(function(sound) {
                        playCount += sound.soundEventCount;
                    });
                    return playCount;
                };
            }
        ]
    });
