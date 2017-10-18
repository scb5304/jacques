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
                        if (eventDate.getMonth() === month) {
                            countsByMonth[i]++;
                        }
                    });
                });

                return countsByMonth;
            },
            calculateSoundPlayedByLabelsAndCounts: function(sound, labelsArray, countsArray) {
                //Pull out each unique user from the sound's events
                var soundEvents = sound.sound_events;
                soundEvents.forEach(function(soundEvent) {
                    var playedByLabel = soundEvent.performed_by;
                    if (labelsArray.indexOf(playedByLabel) === -1) {
                        labelsArray.push(playedByLabel);
                    }
                });

                //Get the number of sound events each of those unique users are responsible for
                labelsArray.forEach(function(label, i) {
                    countsArray.push(0);

                    soundEvents.forEach(function(soundEvent) {
                        if (soundEvent.performed_by === label) {
                            countsArray[i]++;
                        }
                    });
                });

                //To sort both simultaneously, combine them into a list of objects, then sort them together.
                var combinedArray = [];
                countsArray.forEach(function(value, i) {
                    combinedArray.push({"label": labelsArray[i], "value": value});
                });
                combinedArray.sort(function(a, b) {
                    return ((a.value < b.value) ? 1 : ((a.value === b.value) ? 0 : -1));
                });

                //Pull the values out for use in the chart (two arrays)
                combinedArray.forEach(function(combinedEntry, j) {
                   labelsArray[j] = combinedEntry.label;
                   countsArray[j] = combinedEntry.value;
                });
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
                        lastPlayedDate = new Date(soundEvent.date);
                    } else {
                        var possibleLastPlayedDate = new Date(soundEvent.date);
                        if (possibleLastPlayedDate > lastPlayedDate) {
                            lastPlayedDate = possibleLastPlayedDate;
                        }
                    }
                });

                return lastPlayedDate;
            }
        };
    });