'use strict';

// Register `soundDetail` component, along with its associated controller and template
angular.module('soundDetail')
    .component('soundDetail', {
        templateUrl: 'sound-detail/sound-detail.template.html',
        controller: ['$scope', 'sharedProperties', '$sce', function SoundDetailController($scope, sharedProperties, $sce) {
            $scope.sharedProperties = sharedProperties;
            $scope.labels = [];
            $scope.data = [];
            $scope.audioUrl = "";

            $scope.soundActivityLineOptions = {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            userCallback: function (label, index, labels) {
                                if (Math.floor(label) === label) {
                                    return label;
                                }
                            }
                        }
                    }]
                }
            };

            $scope.soundPlayedByBarOptions = {
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            userCallback: function (label, index, labels) {
                                if (Math.floor(label) == label) {
                                    return label;
                                }
                            }
                        },

                    }],
                    yAxes: [{
                        categoryPercentage: 0.4
                    }]
                }
            };

            $scope.soundTypeNutData = [];
            $scope.soundTypeNutLabels = ["Targeted", "Random"]

            $scope.soundPlayedByBarData = [];
            $scope.soundPlayedByBarLabels = [];

            $scope.getSelectedName = function() {
                if ($scope.sharedProperties && $scope.sharedProperties.getSelected()) {
                    return $scope.sharedProperties.getSelected().cleanedName;
                }
            };

            $scope.$watch('sharedProperties.getSelected()', function (newVal, oldVal) {
                if (newVal) {
                    $scope.labels = getLabels();
                    $scope.data = getData();

                    var sound = sharedProperties.getSelected();
                    var playTypeCounts = [0, 0];

                    var playedByCounts = []
                    var playedByNames = []

                    $scope.soundPlayedByBarData = []
                    $scope.soundPlayedByBarLabels = []

                    $scope.summaryLastPlayed = "N/A";

                    if (sound.sound_events.length === 0) {
                        console.log("No sound events!");
                    }
                    for (var event of sound.sound_events) {
                        if (event.category === "playTargeted") {
                            playTypeCounts[0]++;
                        } else {
                            playTypeCounts[1]++;
                        }

                        //console.log(event)
                        if (!playedByNames.includes(event.performed_by)) {
                            playedByNames.push(event.performed_by);
                            playedByCounts.push(0)
                        }
                        var indexOfName = playedByNames.indexOf(event.performed_by);

                        //console.log(indexOfName)
                        playedByCounts[indexOfName]++;

                        if ($scope.summaryLastPlayed === "N/A") {
                            $scope.summaryLastPlayed = new Date(event.date)
                        } else {
                            var possibleLastPlayedDate = new Date(event.date);
                            if (possibleLastPlayedDate > $scope.summaryLastPlayed) {
                                $scope.summaryLastPlayed = possibleLastPlayedDate
                            }
                        }
                    }
                    $scope.soundPlayedByBarLabels = playedByNames;
                    $scope.soundPlayedByBarData = playedByCounts;

                    $scope.soundTypeNutData = playTypeCounts;
                    $scope.audioUrl = $sce.trustAsResourceUrl("http://jacquesbot.io/raw/" + sound.name);

                    $scope.summaryPlayCount = sound.sound_events.length;
                    $scope.summaryAddDate = new Date(sound.add_date).toLocaleString("en", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })
                    $scope.summaryLastPlayed = $scope.summaryLastPlayed.toLocaleString("en", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })

                    if (($scope.summaryAddDate + "") === "February 26, 2017") {
                        $scope.summaryAddDate = $scope.summaryAddDate + " (Legacy)"
                    }
                }
            });

            this.calcMonthDiff = function calcMonthDiff(dateTo, dateFrom) {
                return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
            }

            function calcMonthName(date) {
                return date.toLocaleString("en", {month: "long"});
            }

            function removeOldSoundEvents(soundEvents) {
                var now = new Date();
                for (var i = soundEvents.length - 1; i >= 0; i--) {
                    var soundEvent = soundEvents[i];
                    if (calcMonthDiff(now, new Date(soundEvent.date)) > 5) {
                        soundEvents.splice(i, 1);
                    }
                }
            }

            function getLabels() {
                var lastSixMonths = getLastSixMonths();
                var labels = [];
                for (var monthInt of lastSixMonths) {
                    var formattedMonth = moment().month(monthInt).format('MMMM');
                    labels.push(formattedMonth);
                }
                return labels;
            }

            function getLastSixMonths() {
                var sound = $scope.sharedProperties.getSelected();
                var soundEvents = sound.sound_events;
                var lastSixMonths = [];
                //Calculate the last six months
                for (var i = 5; i >= 0; i--) {
                    var date = new Date();
                    date.setMonth(date.getMonth() - i);
                    lastSixMonths.push(date.getMonth());
                }
                return lastSixMonths;
            }

            function getData() {
                var sound = $scope.sharedProperties.getSelected();
                var lastSixMonths = getLastSixMonths();
                var soundEvents = sound.sound_events;
                var lastSixMonthsCounts = [0, 0, 0, 0, 0, 0];

                //Loop through the sound events
                for (var soundEvent of soundEvents) {
                    var eventDate = new Date(soundEvent.date);

                    //For each sound event, loop through each of the last six months
                    for (var i = 0; i < 6; i++) {
                        var month = lastSixMonths[i];
                        //If this sound event belongs to this month, increment the appropriate count index
                        if (eventDate.getMonth() == month) {
                            lastSixMonthsCounts[i]++;
                        }

                    }
                }
                return [lastSixMonthsCounts];
            }
        }]
    });
