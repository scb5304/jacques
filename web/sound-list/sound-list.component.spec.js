'use strict';

describe('soundList', function() {

    // Load the module that contains the `phoneList` component before each test
    beforeEach(function() {
        module('soundList');
        module('chart.js');
    })

    // Test the controller
    describe('SoundListController', function() {
        var $httpBackend, ctrl, sharedPropertiesMock, scope;

        beforeEach(inject(function($componentController, _$httpBackend_, $rootScope) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $componentController('soundList', {
                $scope: scope,
                sharedProperties: sharedPropertiesMock
            });
        }));

    });

});
