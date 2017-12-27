"use strict";

// Register `soundDetail` component, along with its associated controller and template
angular
    .module("soundDetail")
    .component("soundDetail", {
        bindings: {guild: "<", sound: "<"},
        templateUrl: "sounds/sound-detail/sound-detail.template.html",
        controller: ["$location", "$scope", "sharedProperties", "SoundDetailChartsHelper", "$sce",
            function SoundDetailController($location, $scope, sharedProperties, SoundDetailChartsHelper, $sce) {
                $scope.sharedProperties = sharedProperties;
                $scope.SoundDetailChartsHelper = SoundDetailChartsHelper;
                $scope.guild = {};
                $scope.sound = {};

                this.$onChanges = function(changesObj) {
                    if (changesObj.guild) {
                        $scope.guild = changesObj.guild.currentValue;
                    }
                    if (changesObj.sound) {
                        $scope.sound = changesObj.sound.currentValue;
                        onSoundSelected(changesObj.sound.currentValue);
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
                    $scope.audioUrl = $sce.trustAsResourceUrl("http://jacquesbot.io/raw/" + $scope.guild.discord_id + sound.name);
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
                    var playedByLabels = [];
                    var playedByCounts = [];

                    SoundDetailChartsHelper.calculateSoundPlayedByLabelsAndCounts(sound, playedByLabels, playedByCounts);
                    playedByLabels = playedByLabels.slice(0, 8);
                    playedByCounts = playedByCounts.slice(0, 8);

                    $scope.soundPlayedByBarLabels = playedByLabels;
                    $scope.soundPlayedByBarData = playedByCounts;
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
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });
                }
            }
        ]
    });
