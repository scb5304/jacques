'use strict';

describe('soundDetail', function() {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(function() {
        module('soundDetail');
       
    })

    // Test the controller
    describe('SoundDetailController', function() {
        var $httpBackend, ctrl, sharedPropertiesMock, scope, mockSce;

        beforeEach(inject(function($componentController, _$httpBackend_, $rootScope) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $componentController('soundDetail', {
                $scope: scope,
                sharedProperties: sharedPropertiesMock,
                $sce: mockSce
            });
        }));

        it('calcMonthDiff should return a difference of 0 for two today\'s dates', function() {
            var diff = ctrl.calcMonthDiff(new Date(), new Date())
            expect(diff).toEqual(0);
        });

        it('calcMonthDiff should return a difference of 2 for March (this year) and January (this year)', function() {
            let januaryDate = new Date();
            januaryDate.setMonth(0);
            let marchDate = new Date();
            marchDate.setMonth(2);

            var diff = ctrl.calcMonthDiff(marchDate, januaryDate);
            expect(diff).toEqual(2);
        });

        it('calcMonthDiff should return a difference of 9 for July (this year) and September (last year)', function() {
            let julyDate = new Date();
            julyDate.setMonth(7);
            let septemberDate = new Date();
            septemberDate.setMonth(10);
            septemberDate.setFullYear(septemberDate.getFullYear() - 1);

            var diff = ctrl.calcMonthDiff(julyDate, septemberDate);
            expect(diff).toEqual(9);
        });
    });

});
