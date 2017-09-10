"use strict";
angular
    .module("soundDetail")
    .service("SoundDetailChartsHelper", function() {
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
                months.forEach(function(month) {
                    var formattedMonth = moment().month(month).format("MMMM");
                    labels.push(formattedMonth);
                });

                return labels;
            },
            calculateSoundActivityCounts: function(sound, months) {
                var soundEvents = sound.sound_events;
                var countsByMonth = [];
                for (var i = 0; i < months.length; i++) {
                    countsByMonth.push(0);
                }

                soundEvents.forEach(function(soundEvent) {
                    var eventDate = new Date(soundEvent.date);

                    months.forEach(function(month, i) {
                        if (eventDate.getMonth() == month) {
                            countsByMonth[i]++;
                        }
                    });
                });

                return countsByMonth;
            },
            calculateSoundPlayedByLabels: function(sound) {
                var soundEvents = sound.sound_events;
                var labels = [];
                soundEvents.forEach(function(soundEvent) {
                    var playedByLabel = soundEvent.performed_by;
                    if (labels.indexOf(playedByLabel) == -1) {
                        labels.push(playedByLabel);
                    }
                });

                return labels;
            },
            calculateSoundPlayedByCounts: function(sound, labels) {
                var soundEvents = sound.sound_events;
                var counts = [];

                labels.forEach(function(label, i) {
                    counts.push(0);

                    soundEvents.forEach(function(soundEvent, j) {
                        if (soundEvent.performed_by === label) {
                            counts[i]++;
                        }
                    });
                });

                //Having at least one '0' entry will make sure the graph still appears
                if (counts.length == 0) {
                    counts.push(0);
                }

                return counts;
            },
            calculatePlayTypeCount: function(sound, playType) {
                var soundEvents = sound.sound_events;
                var count = 0;

                soundEvents.forEach(function(soundEvent) {
                    if (soundEvent.category === playType) {
                        count++;
                    }
                });

                return count;
            },
            calculateLastPlayedOnDate: function(sound) {
                var soundEvents = sound.sound_events;
                var lastPlayedDate;

                soundEvents.forEach(function(soundEvent) {
                    if (!lastPlayedDate) {
                        lastPlayedDate = new Date(soundEvent.date)
                    } else {
                        var possibleLastPlayedDate = new Date(soundEvent.date);
                        if (possibleLastPlayedDate > lastPlayedDate) {
                            lastPlayedDate = possibleLastPlayedDate;
                        }
                    }
                });

                return lastPlayedDate;
            }
        }
    })
