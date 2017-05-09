'use strict';
angular
    .module('soundDetail')
    .service('SoundDetailChartsHelper', function() {
        return {
            getSoundActivityMonths: function(numberOfMonths) {
                var monthsInPast = [];
                for (var i = numberOfMonths - 1; i >= 0; i--) {
                    var date = new Date();
                    date.setMonth(date.getMonth() - i);
                    monthsInPast.push(date.getMonth());
                }
                return monthsInPast;
            },
            calculateSoundActivityLabels: function(months) {
                var labels = [];
                for (var i = 0; i < months.length; i++) {
                    var formattedMonth = moment().month(months[i]).format('MMMM');
                    labels.push(formattedMonth);
                }
                return labels;
            },
            calculateSoundActivityCounts: function(sound, months) {
                var soundEvents = sound.sound_events;
                var countsByMonth = [];
                for (var i = 0; i < months.length; i++) {
                    countsByMonth.push(0);
                }

                for (var i = 0; i < soundEvents.length; i++) {
                    var eventDate = new Date(soundEvents[i].date);

                    //For each sound event, loop through each of the last six months
                    for (var j = 0; j < months.length; j++) {
                        var month = months[j];
                        //If this sound event belongs to this month, increment the appropriate count index
                        if (eventDate.getMonth() == month) {
                            countsByMonth[j]++;
                        }
                    }
                }
                return countsByMonth;
            },
            calculateSoundPlayedByLabels: function(sound) {
                var soundEvents = sound.sound_events;
                var labels = [];
                for (var i = 0; i < soundEvents.length; i++) {
                    var playedByLabel = soundEvents[i].performed_by;
                    if (labels.indexOf(playedByLabel) == -1) {
                        labels.push(playedByLabel);
                    }
                }
                return labels;
            },
            calculateSoundPlayedByCounts: function(sound, labels) {
                var soundEvents = sound.sound_events;
                var counts = [];

                for (var i = 0; i < labels.length; i++) {
                    counts.push(0);
                    var label = labels[i];

                    for (var j = 0; j < soundEvents.length; j++) {
                        var soundEvent = soundEvents[j];
                        if (soundEvent.performed_by === label) {
                            counts[i]++;
                        }
                    }
                }
                return counts;
            },
            calculatePlayTypeCount: function(sound, playType) {
                var soundEvents = sound.sound_events;
                var count = 0;
                for (var i = 0; i < soundEvents.length; i++) {
                    if (soundEvents[i].category === playType) {
                        count++;
                    }
                }
                return count;
            },
            calculateLastPlayedOnDate: function(sound) {
                var soundEvents = sound.sound_events;
                var lastPlayedDate;
                for (var i = 0; i < soundEvents.length; i++) {
                    var soundEvent = soundEvents[i];
                    if (!lastPlayedDate) {
                        lastPlayedDate = new Date(soundEvent.date)
                    } else {
                        var possibleLastPlayedDate = new Date(soundEvent.date);
                        if (possibleLastPlayedDate > lastPlayedDate) {
                            lastPlayedDate = possibleLastPlayedDate;
                        }
                    }
                }
                return lastPlayedDate;
            }
        }
    })
