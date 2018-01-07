"use strict";

describe("birdfeeder", function() {

    beforeEach(function() {
        module("ngMaterial");
        module("birdfeeder");
    });

    describe("BirdfeedController", function() {
        var $scope;
        var sharedProperties = {};
        var jacquesEndpointInterface = {};
        var mdDialog = {
            show: function() {},
            hide: function() {}
        };
        var BirdfeedController;

        beforeEach(inject(function($componentController, $rootScope) {
            $scope = $rootScope.$new();
            BirdfeedController = $componentController("birdfeeder", {
                $scope: $scope,
                sharedProperties: sharedProperties,
                jacquesEndpointInterface: jacquesEndpointInterface,
                $mdDialog: mdDialog
            });
        }));

        it("uses the $mdDialog service to show a dialog when the user presses the birdfeed icon", function() {
            spyOn(mdDialog, "show");
            $scope.showBirdfeeder();
            expect(mdDialog.show).toHaveBeenCalled();
        });

        it("uses the $mdDialog service to hide the active dialog when the user presses the cancel button or close icon", function() {
            spyOn(mdDialog, "hide");
            $scope.closeDialog();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });
});