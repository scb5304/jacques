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
            name: "testSound",
            category: "jontron"
        };

        var imaqtpieSound = {
            name: "testSound",
            category: "imaqtpie"
        };

        beforeEach(function() {
            sharedPropertiesMock = {
                getSounds: function() {
                    return [];
                },
                getCategoryNames: function() {
                    return []
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

        it("by default has 'all' as a category.", function() {
            var categories = scope.getCategories();
            expect(categories).toEqual(["all"]);
        });

        it("combines categories sent by the Jacques API with 'all'.", function() {
            spyOn(sharedPropertiesMock, "getCategoryNames").and.callFake(function() {
                return ["jontron", "imaqtpie"]
            });
            var categories = scope.getCategories();
            expect(categories.length).toEqual(3);
            expect(categories.indexOf("all")).not.toEqual(-1);
            expect(categories.indexOf("imaqtpie")).not.toEqual(-1);
            expect(categories.indexOf("jontron")).not.toEqual(-1);
        });

        it("updates shared properties when a sound is selected.", function() {
            spyOn(sharedPropertiesMock, "setSelected");
            scope.updateSelected(jontronSound);
            expect(sharedPropertiesMock.setSelected).toHaveBeenCalledWith(jontronSound);
        });

        it("matches any sound to the 'all' category when it is selected.", function() {
            scope.selectedCategory = "all";

            var isJontronMatch = scope.soundMatchesFilter(jontronSound);
            expect(isJontronMatch).toEqual(true);

            var isImaqtpieMatch = scope.soundMatchesFilter(imaqtpieSound);
            expect(isImaqtpieMatch).toEqual(true);
        });

        it("matches only sounds in the appropriate category when one is selected.", function() {
            scope.selectedCategory = "jontron";

            var isJontronMatch = scope.soundMatchesFilter(jontronSound);
            expect(isJontronMatch).toEqual(true);

            var isImaqtpieMatch = scope.soundMatchesFilter(imaqtpieSound);
            expect(isImaqtpieMatch).toEqual(false);
        });
    });
});