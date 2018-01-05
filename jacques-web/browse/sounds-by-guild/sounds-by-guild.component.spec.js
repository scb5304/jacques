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

        describe("sounds popularity", function() {
            beforeEach(function() {
                $scope.sounds = [
                    {name: "third", soundEventCount: 2},
                    {name: "fourth", soundEventCount: 1},
                    {name: "second", soundEventCount: 4},
                    {name: "first", soundEventCount: 3}
                ];
            });

            it("sorts sounds by sound events count upon the 'Popularity' sort option being selected", function() {
                $scope.sortSelection = "Popularity";
                $scope.$digest();

                expect($scope.sounds[0].name === "first");
                expect($scope.sounds[1].name === "second");
                expect($scope.sounds[2].name === "third");
                expect($scope.sounds[3].name === "fourth");
            });

            it("returns the total sound play count", function() {
                var totalPlayCount = $scope.getTotalPlayCount();
                expect(totalPlayCount).toEqual(10);
            });
        });

        it("sorts sounds alphabetically upon the 'Alphabetical' sort option being selected", function() {
            $scope.sounds = [
                {name: "boats"},
                {name: "damage"},
                {name: "captain"},
                {name: "alpha"}
            ];
            $scope.sortSelection = "Alphabetical";
            $scope.$digest();

            expect($scope.sounds[0].name === "alpha");
            expect($scope.sounds[1].name === "boats");
            expect($scope.sounds[2].name === "captain");
            expect($scope.sounds[3].name === "damage");
        });

        it("sorts sounds by date added upon the 'Date Added' sort option being selected", function() {
            $scope.sounds = [
                {name: "fourth", add_date: new Date("2016-11-14T06:03:17.999Z")},
                {name: "first", add_date: new Date("2018-01-01T06:03:17.999Z")},
                {name: "third", add_date: new Date("2017-07-23T06:03:17.820Z")},
                {name: "second", add_date: new Date("2017-07-23T06:03:17.821Z")}
            ];
            $scope.sortSelection = "Date Added";
            $scope.$digest();

            expect($scope.sounds[0].name === "first");
            expect($scope.sounds[1].name === "second");
            expect($scope.sounds[2].name === "third");
            expect($scope.sounds[3].name === "fourth");
        });

        it("returns a date string in the proper format for a sound item", function() {
            var formattedDateString = $scope.getFormattedDateFromString(new Date("2017-05-13T12:59:35.474Z"));
            expect(formattedDateString).toEqual("May 13, 2017")
        });
    });
});