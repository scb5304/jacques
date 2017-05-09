'use strict';

// Register `soundDetail` component, along with its associated controller and template
angular
    .module('soundDetail')
    .component('soundDetail', {
        templateUrl: 'sound-detail/sound-detail.template.html',
        controller: ['$scope', 'sharedProperties', 'SoundChartsDataService', '$sce',
            function SoundDetailController($scope, sharedProperties, SoundToolsService, $sce) {
                $scope.sharedProperties = sharedProperties;
                $scope.SoundToolsService = SoundToolsService;
                console.log("hello?");

                $scope.$watch('sharedProperties.getSelected()', function(newSound, oldSound) {
                    if (newSound) {
                        console.log("hello2?");
                        onSoundSelected(newSound);
                    }
                });

                $scope.getSelectedName = function() {
                    if ($scope.sharedProperties && $scope.sharedProperties.getSelected()) {
                        return $scope.sharedProperties.getSelected().cleanedName;
                    }
                };

                function onSoundSelected(sound) {
                    updateAudioFile(sound);
                    updateSummaryCard(sound);
                    updateActivityChart(sound);
                    updatePlayedByChart(sound);
                    updatePlayTypeChart(sound);
                }

                function updateAudioFile(sound) {
                    $scope.audioUrl = $sce.trustAsResourceUrl("http://jacquesbot.io/raw/" + sound.name);
                }

                function updateSummaryCard(sound) {
                    $scope.summaryPlayCount = sound.sound_events.length;

                    var addedDate = new Date(sound.add_date);
                    $scope.summaryAddDate = formatMonthDayYear(addedDate);
                    if ($scope.summaryAddDate === "February 26, 2017") {
                        $scope.summaryAddDate = $scope.summaryAddDate + " (Legacy)";
                    }

                    var lastPlayedDate = SoundToolsService.calculateLastPlayedOnDate(sound);
                    $scope.summaryLastPlayed = lastPlayedDate ? formatMonthDayYear(lastPlayedDate) : "N/A";
                }

                function updateActivityChart(sound) {
                    var lastSixMonthsInIntegers = SoundToolsService.getSoundActivityMonths(6);
                    console.log(lastSixMonthsInIntegers);
                    $scope.labels = SoundToolsService.calculateSoundActivityLabels(lastSixMonthsInIntegers);
                    $scope.data = SoundToolsService.calculateSoundActivityCounts(sound, lastSixMonthsInIntegers);
                }

                function updatePlayedByChart(sound) {
                    $scope.soundPlayedByBarLabels = SoundToolsService.calculateSoundPlayedByLabels(sound);
                    $scope.soundPlayedByBarData = SoundToolsService.calculateSoundPlayedByCounts(sound, $scope.soundPlayedByBarLabels);
                }

                function updatePlayTypeChart(sound) {
                    $scope.soundTypeNutLabels = ["Targeted", "Random"];
                    $scope.soundTypeNutData = [
                        SoundToolsService.calculatePlayTypeCount(sound, "playTargeted"),
                        SoundToolsService.calculatePlayTypeCount(sound, "playRandom")
                    ];
                }

                function formatMonthDayYear(date) {
                    return date.toLocaleString("en", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            }
        ]
    });
