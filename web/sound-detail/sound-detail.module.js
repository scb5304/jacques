'use strict';

angular
    .module('soundDetail', ['chart.js'])
    .service('SoundChartsDataService', function() {

        return {
            getSoundActivityMonths(numberOfMonths) {
                var monthsInPast = [];
                for (var i = numberOfMonths - 1; i >= 0; i--) {
                    var date = new Date();
                    date.setMonth(date.getMonth() - i);
                    monthsInPast.push(date.getMonth());
                }
                return monthsInPast;
            },
            calculateSoundActivityLabels(months) {
                var labels = [];
                for (var monthInt of months) {
                    var formattedMonth = moment().month(monthInt).format('MMMM');
                    labels.push(formattedMonth);
                }
                return labels;
            },
            calculateSoundActivityCounts(sound, months) {
                var soundEvents = sound.sound_events;
                var countsByMonth = [];
                for (let month of months) {
                    countsByMonth.push(0);
                }

                //Loop through the sound events
                for (var soundEvent of soundEvents) {
                    var eventDate = new Date(soundEvent.date);

                    //For each sound event, loop through each of the last six months
                    for (var i = 0; i < 6; i++) {
                        var month = months[i];
                        //If this sound event belongs to this month, increment the appropriate count index
                        if (eventDate.getMonth() == month) {
                            countsByMonth[i]++;
                        }
                    }
                }
                return [countsByMonth];
            },
            calculateSoundPlayedByLabels(sound) {
                let soundEvents = sound.sound_events;
                let labels = [];
                for (let soundEvent of soundEvents) {
                    let playedByLabel = soundEvent.performed_by;
                    if (!labels.includes(playedByLabel)) {
                        labels.push(playedByLabel);
                    }
                }
                return labels;
            },
            calculateSoundPlayedByCounts(sound, labels) {
                let soundEvents = sound.sound_events;
                let counts = [];

                for (let i = 0; i < labels.length; i++) {
                    counts.push(0);
                    let label = labels[i];

                    for (let j = 0; j < soundEvents.length; j++) {
                        let soundEvent = soundEvents[j];
                        if (soundEvent.performed_by === label) {
                            counts[i]++;
                        }
                    }
                }
                return counts;
            },
            calculatePlayTypeCount(sound, playType) {
                let soundEvents = sound.sound_events;
                let count = 0;

                for (let soundEvent of soundEvents) {
                    if (soundEvent.category === playType) {
                        count++;
                    }
                }

                return count;
            },
            calculateLastPlayedOnDate(sound) {
                let soundEvents = sound.sound_events;
                let lastPlayedDate;

                for (let soundEvent of soundEvents) {
                    if (!lastPlayedDate) {
                        lastPlayedDate = new Date(soundEvent.date)
                    } else {
                        let possibleLastPlayedDate = new Date(soundEvent.date);
                        if (possibleLastPlayedDate > lastPlayedDate) {
                            lastPlayedDate = possibleLastPlayedDate;
                        }
                    }
                }

                return lastPlayedDate;
            }
        }
    });
