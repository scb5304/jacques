'use strict';

describe('Sound Detail', function () {

    var SoundChartsDataService;

    beforeEach(function () {
        module('soundDetail');
    });

    beforeEach(inject(function (_SoundChartsDataService_) {
        SoundChartsDataService = _SoundChartsDataService_;
    }));

    describe('SoundChartsDataService', function () {
    	describe('Sound Summary Card', function() {
    		it('should properly calculate the last played on date.', function() {
    			let lastPlayedOnDateBowser = SoundChartsDataService.calculateLastPlayedOnDate(testSoundBowser);
    			expect(JSON.stringify(lastPlayedOnDateBowser)).toEqual("\"2017-05-04T13:42:43.097Z\"");

    			let lastPlayedOnDateCups = SoundChartsDataService.calculateLastPlayedOnDate(testSoundCups);
    			expect(JSON.stringify(lastPlayedOnDateCups)).toEqual("\"2017-05-05T03:37:52.672Z\"");
    		});
    	});

    	describe('Sound Activity Chart', function() {
    		it('should produce an array of sound activity labels whose size is equal to the number of months passed.', function() {
    			let testMonths = [0, 1, 2, 3, 4, 5];
    			let soundActivityLabels = SoundChartsDataService.calculateSoundActivityLabels(testMonths);
    			expect(soundActivityLabels.length).toEqual(testMonths.length);

    			testMonths = [3, 4, 5, 6, 7, 8, 9, 10, 11];
    			soundActivityLabels = SoundChartsDataService.calculateSoundActivityLabels(testMonths);
    			expect(soundActivityLabels.length).toEqual(testMonths.length);
    		});

    		it('should produce an array of sound activity labels that are all Strings.', function() {
    			let testMonths = [0, 1, 2, 3, 4, 5];
    			let soundActivityLabels = SoundChartsDataService.calculateSoundActivityLabels(testMonths);
    			for (let label of soundActivityLabels) {
    				expect(label).toEqual(jasmine.any(String));
    			}
    		});

    	});
        describe('Play Type Chart', function() {
            it('should properly tally the number of times a sound was played randomly.', function () {
                let randomCountBowser = SoundChartsDataService.calculatePlayTypeCount(testSoundBowser, "playRandom");
                expect(randomCountBowser).toEqual(3);
                let randomCountCups = SoundChartsDataService.calculatePlayTypeCount(testSoundCups, "playRandom");
                expect(randomCountCups).toEqual(2);
            });

            it('should properly tally the number of times a sound was played targeted.', function () {
                let targetedCountBowser = SoundChartsDataService.calculatePlayTypeCount(testSoundBowser, "playTargeted");
                expect(targetedCountBowser).toEqual(1);
                let targetedCountCups = SoundChartsDataService.calculatePlayTypeCount(testSoundCups, "playTargeted");
                expect(targetedCountCups).toEqual(7);
            });

            it('should properly tally the number of times a sound was played for an unexpected sound event type to be 0.', function () {
                let unexpectedCountBowser = SoundChartsDataService.calculatePlayTypeCount(testSoundBowser, "playPajamas");
                expect(unexpectedCountBowser).toEqual(0);
                let unexpectedCountCups = SoundChartsDataService.calculatePlayTypeCount(testSoundCups, "playPajamas");
                expect(unexpectedCountCups).toEqual(0);
            })
        });
        describe('Played By Chart', function() {
        	it('should properly calculate which users have played a sound.', function() {
        		let playedByLabelsBowser = SoundChartsDataService.calculateSoundPlayedByLabels(testSoundBowser);
        		let expectedLabelsBowser = ["Eldre Hund", "Valle"];
        		expect(JSON.stringify(expectedLabelsBowser)).toEqual(JSON.stringify(playedByLabelsBowser));

				let playedByLabelsCups = SoundChartsDataService.calculateSoundPlayedByLabels(testSoundCups);
        		let expectedLabelsCups = ["Captain Dogbeard", "Nathe-kyuuun~", "banana jam", "Valle", "Velenys", "Spitsonpuppies"];
        		expect(JSON.stringify(expectedLabelsCups)).toEqual(JSON.stringify(playedByLabelsCups));
        	});

        	it('should properly calculate the numbers of times users have played a sound.', function() {
        		let playedByLabelsBowser = SoundChartsDataService.calculateSoundPlayedByLabels(testSoundBowser);
        		let playedByCountsBowser = SoundChartsDataService.calculateSoundPlayedByCounts(testSoundBowser, playedByLabelsBowser);
        		let expectedPlayedByCountsBowser = [3, 1];
        		expect(JSON.stringify(playedByCountsBowser)).toEqual(JSON.stringify(expectedPlayedByCountsBowser));

        		let playedByLabelsCups = SoundChartsDataService.calculateSoundPlayedByLabels(testSoundCups);
        		let playedByCountsCups = SoundChartsDataService.calculateSoundPlayedByCounts(testSoundCups, playedByLabelsCups);
        		let expectedPlayedByCountsCups = [4, 1, 1, 1, 1, 1];
        		expect(JSON.stringify(playedByCountsCups)).toEqual(JSON.stringify(expectedPlayedByCountsCups));
        	})
        });
    });
});

/*
 * A sample sound object as would be retrieved from jacquesbot.io's API.
 * 4 sound events: 3 random, 1 targeted.
 * Played by "Eldre Hund" 3 times, by "Valle" 1 time.
 */
const testSoundBowser = {
    "_id": "58b35fdc8561f709c60f40c1",
    "name": "bowser.mp3",
    "add_date": "2017-02-26T23:08:12.629Z",
    "added_by": "Server",
    "sound_events": [{
        "_id": "58b3999650d9093808d12761",
        "performed_by": "Eldre Hund",
        "date": "2017-02-27T03:14:30.142Z",
        "category": "playRandom"
    }, {
        "_id": "58cb4dba90aef47610d4c8e7",
        "performed_by": "Eldre Hund",
        "date": "2017-03-17T02:45:14.174Z",
        "category": "playRandom"
    }, {
        "_id": "58cf00740480db123133f2db",
        "performed_by": "Eldre Hund",
        "date": "2017-03-19T22:04:36.036Z",
        "category": "playRandom"
    }, {
        "_id": "590b2fd3e2ff822dbc8badaf",
        "performed_by": "Valle",
        "date": "2017-05-04T13:42:43.097Z",
        "category": "playTargeted"
    }],
    "tags": []
};

/*
 * A sample sound object as would be retrieved from jacquesbot.io's API.
 * 9 sound events: 2 random, 7 targeted.
 * Played by "Captain Dogbeard" 4 times, and the following each 1 time:
 * "Nathe-kyuuun~", "banana jam", "Valle", "Velenys", "Spitsonpuppies"
 */
const testSoundCups = {
    "_id": "58fb9e381ee0117c26f084b9",
    "name": "cups.mp3",
    "add_date": "2017-04-22T18:17:28.914Z",
    "added_by": "Server",
    "sound_events": [{
        "_id": "58fbdf731ee0117c26f084db",
        "performed_by": "Captain Dogbeard",
        "date": "2017-04-22T22:55:47.328Z",
        "category": "playTargeted"
    }, {
        "_id": "58fea5bb208edd6977e35c51",
        "performed_by": "Captain Dogbeard",
        "date": "2017-04-25T01:26:19.569Z",
        "category": "playTargeted"
    }, {
        "_id": "590173b17988db62a7f2f02e",
        "performed_by": "Captain Dogbeard",
        "date": "2017-04-27T04:29:37.111Z",
        "category": "playTargeted"
    }, {
        "_id": "590adf65e2ff822dbc8bac4c",
        "performed_by": "Nathe-kyuuun~",
        "date": "2017-05-04T07:59:33.354Z",
        "category": "playRandom"
    }, {
        "_id": "590ae21fe2ff822dbc8bac4e",
        "performed_by": "banana jam",
        "date": "2017-05-04T08:11:11.700Z",
        "category": "playRandom"
    }, {
        "_id": "590b298fe2ff822dbc8bad53",
        "performed_by": "Valle",
        "date": "2017-05-04T13:15:59.062Z",
        "category": "playTargeted"
    }, {
        "_id": "590b2e89e2ff822dbc8bad94",
        "performed_by": "Velenys",
        "date": "2017-05-04T13:37:13.181Z",
        "category": "playTargeted"
    }, {
        "_id": "590bf390bcdff650b4c952d1",
        "performed_by": "Spitsonpuppies",
        "date": "2017-05-05T03:37:52.672Z",
        "category": "playTargeted"
    }, {
        "_id": "590bce5fe2ff822dbc8bae5d",
        "performed_by": "Captain Dogbeard",
        "date": "2017-05-05T00:59:11.244Z",
        "category": "playTargeted"
    }],
    "tags": []
};