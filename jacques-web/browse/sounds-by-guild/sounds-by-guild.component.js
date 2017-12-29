"use strict";

angular
    .module("soundsByGuild")
    .component("soundsByGuild", {
        bindings: {guild: "<", sounds: "<"},
        templateUrl: "browse/sounds-by-guild/sounds-by-guild.template.html",
        controller: ["$scope",
            function SoundsByGuildController($scope) {
                $scope.sounds = this.sounds;
                $scope.sortSelection = "Ascending";

                $scope.$watch("sortSelection", function() {
                    if (!$scope.sounds) {
                        return;
                    }
                    switch ($scope.sortSelection) {
                        case "Ascending":
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
                });

                $scope.getFormattedDateFromString = function(dateString) {
                    return new Date(dateString).toLocaleString("en", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                    });
                };
            }
        ]
    });