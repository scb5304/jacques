"use strict";

describe("soundList", function() {

    beforeEach(function() {
        module("soundList");
        module("chart.js");
    });

    describe("SoundListController", function() {
        var scope;
        var $httpBackend;
        var sharedPropertiesMock;
        var SoundListController;

        var jontronSound = {
            name: "testSound"
        };

        var imaqtpieSound = {
            name: "testSound"
        };

        beforeEach(function() {
            sharedPropertiesMock = {
                getSounds: function() {
                    return [];
                },
                setSelected: function() {

                }
            };
        });

        beforeEach(inject(function($componentController, _$httpBackend_, $rootScope) {
            scope = $rootScope.$new();
            $httpBackend = _$httpBackend_;
            SoundListController = $componentController("soundList", {
                $scope: scope,
                sharedProperties: sharedPropertiesMock
            });
        }));

        it("calls shared properties to get sounds.", function() {
            spyOn(sharedPropertiesMock, "getSounds").and.callThrough();
            scope.getSounds();
            expect(sharedPropertiesMock.getSounds).toHaveBeenCalled();
        });

        it("updates shared properties when a sound is selected.", function() {
            spyOn(sharedPropertiesMock, "setSelected");
            scope.updateSelected(jontronSound);
            expect(sharedPropertiesMock.setSelected).toHaveBeenCalledWith(jontronSound);
        });
    });
});