'use strict';

describe('soundDetail', function() {

    var SoundChartsDataService;

    beforeEach(function() {
        module('soundDetail');
    })

    beforeEach(inject(function(_SoundChartsDataService_) {
        SoundChartsDataService = _SoundChartsDataService_;
    }));

    // Test the service
    describe('SoundChartsDataService', function() {

        it('Should add 2 and 2', function() {
            let randomCount = SoundChartsDataService.calculatePlayTypeCount(testSound, "playRandom");
            expect(randomCount).toEqual(3);
        });

    });



});

const testSound = {
    "_id": "58b35fdc8561f709c60f40c1",
    "name": "bowser.mp3",
    "add_date": "2017-02-26T23:08:12.629Z",
    "added_by": "Server",
    "__v": 4,
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
}
