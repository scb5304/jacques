"use strict";

describe("soundsByGuild", function() {

    beforeEach(function() {
        module('ui.router');
        module("soundsByGuild");
    });

    describe("SoundsByGuildController", function() {
        var $scope;
        var SoundsByGuildController;

        beforeEach(inject(function($componentController, $rootScope) {
            $scope = $rootScope.$new();
            SoundsByGuildController = $componentController("soundsByGuild", {
                $scope: $scope,
            });
        }));

        it("does the thing.", function() {
            expect(true).toBe(true);
        });
    });
});