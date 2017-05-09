'use strict';

// Register `soundDetail` component, along with its associated controller and template
angular
    .module('soundDetail')
    .component('soundDetail', {
        templateUrl: 'sound-detail/sound-detail.template.html',
        controller: ['$scope', 'sharedProperties', 'SoundDetailChartsHelper', '$sce',
            function SoundDetailController($scope, sharedProperties, SoundDetailChartsHelper, $sce) {
                $scope.sharedProperties = sharedProperties;
                $scope.SoundDetailChartsHelper = SoundDetailChartsHelper;

                $scope.$watch('sharedProperties.getSelected()', function(newSound, oldSound) {
                    if (newSound) {
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

                    var lastPlayedDate = SoundDetailChartsHelper.calculateLastPlayedOnDate(sound);
                    $scope.summaryLastPlayed = lastPlayedDate ? formatMonthDayYear(lastPlayedDate) : "N/A";
                }

                function updateActivityChart(sound) {
                    var lastSixMonthsInIntegers = SoundDetailChartsHelper.getSoundActivityMonths(6);
                    $scope.labels = SoundDetailChartsHelper.calculateSoundActivityLabels(lastSixMonthsInIntegers);
                    $scope.data = [SoundDetailChartsHelper.calculateSoundActivityCounts(sound, lastSixMonthsInIntegers)];
                }

                function updatePlayedByChart(sound) {
                    $scope.soundPlayedByBarLabels = SoundDetailChartsHelper.calculateSoundPlayedByLabels(sound);
                    $scope.soundPlayedByBarData = SoundDetailChartsHelper.calculateSoundPlayedByCounts(sound, $scope.soundPlayedByBarLabels);
                }

                function updatePlayTypeChart(sound) {
                    $scope.soundTypeNutLabels = ["Targeted", "Random"];
                    $scope.soundTypeNutData = [
                        SoundDetailChartsHelper.calculatePlayTypeCount(sound, "playTargeted"),
                        SoundDetailChartsHelper.calculatePlayTypeCount(sound, "playRandom")
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
