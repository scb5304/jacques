"use strict";

describe("scrollToTop", function() {

    beforeEach(function() {
        module("ui.router");
        module("scrollToTop");
    });

    describe("ScrollToTopController", function() {
        var $scope;
        var ScrollToTopController;

        beforeEach(inject(function($componentController, $rootScope) {
            $scope = $rootScope.$new();
            ScrollToTopController = $componentController("scrollToTop", {
                $scope: $scope
            });
        }));

        it("scrolls the page's main content to the very top when the FAB is pressed", function() {
            var mockMainContent = {
                scrollTo: function(x, y) {}
            };

            spyOn(document, "getElementById").and.callFake(function() {
                return mockMainContent;
            });

            spyOn(mockMainContent, "scrollTo");

            $scope.scrollToTop();
            expect(ScrollToTopController).toBeDefined();
            expect(mockMainContent.scrollTo).toHaveBeenCalledWith(0, 0);
        });
    });
});