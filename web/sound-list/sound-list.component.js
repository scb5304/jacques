'use strict';

// Register `soundList` component, along with its associated controller and template
angular.module('soundList')
    .component('soundList', {
        templateUrl: 'sound-list/sound-list.template.html',
        controller: ['$scope', 'sharedProperties',
            function SoundListController($scope, sharedProperties) {
                $scope.sharedProperties = sharedProperties;

                this.calcMonthDiff = function calcMonthDiff(dateTo, dateFrom) {
                    return dateTo.getMonth() - dateFrom.getMonth() + (12 * (dateTo.getFullYear() - dateFrom.getFullYear()));
                }

                this.calcMonthName = function calcMonthName(date) {
                    return date.toLocaleString("en", { month: "long" });
                }

                this.removeOldSoundEvents = function removeOldSoundEvents(soundEvents) {
                    var now = new Date();
                    for (var i = soundEvents.length - 1; i >= 0; i--) {
                        var soundEvent = soundEvents[i];
                        if (calcMonthDiff(now, new Date(soundEvent.date)) > 5) {
                            soundEvents.splice(i, 1);
                        }
                    }
                }

                $scope.getSounds = function getSounds() {
                    return sharedProperties.getSounds();
                }

                $scope.updateSelected = function updateSelected(sound) {
                    $scope.sharedProperties.setSelected(sound);
                }
            }
        ]
    });
