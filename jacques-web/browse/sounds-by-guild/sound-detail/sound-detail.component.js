"use strict";

// Register `soundDetail` component, along with its associated controller and template
angular
    .module("soundDetail")
    .component("soundDetail", {
        bindings: {guild: "<", sound: "<"},
        templateUrl: "browse/sounds-by-guild/sound-detail/sound-detail.template.html",
        controller: ["$location", "$scope", "sharedProperties", "SoundDetailChartsHelper", "$sce", "SoundsService",
            "jacquesToaster", "$state", "$mdDialog",
            function SoundDetailController($location, $scope, sharedProperties, SoundDetailChartsHelper, $sce,
                                           SoundsService, jacquesToaster, $state, $mdDialog) {
                $scope.sharedProperties = sharedProperties;
                $scope.SoundsService = SoundsService;
                $scope.SoundDetailChartsHelper = SoundDetailChartsHelper;
                $scope.guild = {};
                $scope.sound = {};

                this.$onChanges = function(changesObj) {
                    if (changesObj.guild) {
                        $scope.guild = changesObj.guild.currentValue;
                    }
                    if (changesObj.sound) {
                        $scope.sound = changesObj.sound.currentValue;
                        $scope.onSoundBindingReady();
                    }
                };

                $scope.onSoundBindingReady = function() {
                    $scope.updateAudioFile();
                    $scope.updateSummaryCard();
                    $scope.updateActivityChart();
                    $scope.updatePlayedByChart();
                    $scope.updatePlayTypeChart();
                };

                $scope.updateAudioFile = function() {
                    $scope.audioUrl = $sce.trustAsResourceUrl("http://jacquesbot.io/raw/" + $scope.guild.discord_id + "/" + $scope.sound.name + ".mp3");
                };

                $scope.updateSummaryCard = function() {
                    $scope.summaryPlayCount = $scope.sound.sound_events.length;

                    var addedDate = new Date($scope.sound.add_date);
                    $scope.summaryAddDate = $scope.formatMonthDayYear(addedDate);
                    $scope.summaryAddedBy = $scope.sound.added_by;

                    var lastPlayedDate = SoundDetailChartsHelper.calculateLastPlayedOnDate($scope.sound);
                    $scope.summaryLastPlayed = lastPlayedDate ? $scope.formatMonthDayYear(lastPlayedDate) : "N/A";
                };

                $scope.updateActivityChart = function() {
                    var lastSixMonthsInIntegers = SoundDetailChartsHelper.getSoundActivityMonths(6);
                    $scope.labels = SoundDetailChartsHelper.calculateSoundActivityLabels(lastSixMonthsInIntegers);
                    $scope.data = [SoundDetailChartsHelper.calculateSoundActivityCounts($scope.sound, lastSixMonthsInIntegers)];
                };

                $scope.updatePlayedByChart = function() {
                    var playedByLabels = [];
                    var playedByCounts = [];

                    SoundDetailChartsHelper.calculateSoundPlayedByLabelsAndCounts($scope.sound, playedByLabels, playedByCounts);
                    playedByLabels = playedByLabels.slice(0, 8);
                    playedByCounts = playedByCounts.slice(0, 8);

                    $scope.soundPlayedByBarLabels = playedByLabels;
                    $scope.soundPlayedByBarData = playedByCounts;
                };

                $scope.updatePlayTypeChart = function() {
                    $scope.soundTypeNutLabels = ["Targeted", "Random"];
                    $scope.soundTypeNutData = [
                        SoundDetailChartsHelper.calculatePlayTypeCount($scope.sound, "playTargeted"),
                        SoundDetailChartsHelper.calculatePlayTypeCount($scope.sound, "playRandom")
                    ];
                };

                $scope.formatMonthDayYear = function(date) {
                    return date.toLocaleString("en", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    });
                };

                $scope.onDeleteClicked = function() {
                    $mdDialog.show({
                        templateUrl: "browse/sounds-by-guild/sound-detail/sound-detail-delete-dialog.html",
                        clickOutsideToClose: false,
                        controller: function() {
                            var self = this;
                            self.closeDialog = $scope.closeDialog;
                            self.onConfirmDelete = $scope.onConfirmDelete;
                        },
                        controllerAs: "$ctrl"
                    })
                };

                $scope.closeDialog = function() {
                    $mdDialog.hide();
                };

                $scope.onConfirmDelete = function () {
                    var birdfeed = "";
                    var user = sharedProperties.getUser();
                    if (user) {
                        birdfeed = user.birdfeed_token;
                    }
                    $scope.SoundsService.deleteSound($scope.guild.discord_id, $scope.sound.name, birdfeed)
                        .then($scope.onSuccessfulDeleteSoundResponse)
                        .catch($scope.onFailedDeleteSoundResponse);
                };

                $scope.onSuccessfulDeleteSoundResponse = function() {
                    $state.go("soundsByGuild", {
                        guildId: $scope.guild.discord_id
                    });
                    $scope.closeDialog();
                };

                $scope.onFailedDeleteSoundResponse = function(err) {
                    if (err.status >= 400 && err.status < 500) {
                        jacquesToaster.showToastWithText(err.data.error);
                        sharedProperties.setUser({});
                    } else {
                        jacquesToaster.showApiErrorToast();
                    }
                }
            }
        ]
    });
