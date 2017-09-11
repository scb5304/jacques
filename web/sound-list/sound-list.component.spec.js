"use strict";

describe("soundList", function() {

    beforeEach(function() {
        module("soundList");
        module("chart.js");
    });

    describe("SoundListController", function() {
        var $httpBackend, ctrl, sharedPropertiesMock, scope;

        beforeEach(inject(function($componentController, _$httpBackend_, $rootScope) {
            $httpBackend = _$httpBackend_;
            scope = $rootScope.$new();
            ctrl = $componentController("soundList", {
                $scope: scope,
                sharedProperties: sharedPropertiesMock
            });
        }));

    });

});
