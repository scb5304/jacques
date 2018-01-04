"use strict";

describe("Sound Detail", function () {

    beforeEach(function () {
        module("ui.router");
        module("ngMaterial");
        module("soundDetail");
    });

    describe("SoundDetailController", function () {
        var $scope;
        var sce;
        var SoundDetailController;

        var sharedProperties = {};
        var jacquesEndpointInterface = {};
        var jacquesToaster = {};
        var SoundDetailChartsHelper = {};

        beforeEach(inject(function($componentController, $rootScope, $sce) {
            $scope = $rootScope.$new();
            sce = $sce;
            SoundDetailChartsHelper = {
                getSoundActivityMonths: function() {},
                calculateSoundActivityLabels: function() {},
                calculateSoundActivityCounts: function() {},
                calculateSoundPlayedByLabelsAndCounts: function() {},
                calculatePlayTypeCount: function() {},
                calculateLastPlayedOnDate: function() {},
            };
            SoundDetailController = $componentController("soundDetail", {
                $scope: $scope,
                sharedProperties: sharedProperties,
                jacquesEndpointInterface: jacquesEndpointInterface,
                jacquesToaster: jacquesToaster,
                SoundDetailChartsHelper: SoundDetailChartsHelper
            });
        }));

        //https://medium.com/front-end-hacking/angularjs-onchanges-component-hook-as-solution-for-not-ready-bindings-cb78335c3f5e
        it("calls onSoundBindingReady when $onChanges is invoked", function() {
            spyOn($scope, "onSoundBindingReady");

            SoundDetailController.$onChanges({sound: {}});
            expect($scope.onSoundBindingReady).toHaveBeenCalled();
        });

        it("does not call onSoundBindingReady when $onChanges is invoked but sound is not defined", function() {
            spyOn($scope, "onSoundBindingReady");

            SoundDetailController.$onChanges({sound: undefined});
            expect($scope.onSoundBindingReady).not.toHaveBeenCalled();
        });

        describe("onSoundBindingReady", function() {
            var guild = {
                currentValue: {
                    discord_id: "1005"
                }
            };

            var sound = {
                currentValue: {
                    name: "mySound",
                    sound_events: [],
                }
            };

            var changesObj = {
                guild: guild,
                sound: sound
            };

            it("calls to populate all views when sound binding is ready", function() {
                spyOn($scope, "updateAudioFile");
                spyOn($scope, "updateSummaryCard");
                spyOn($scope, "updateActivityChart");
                spyOn($scope, "updatePlayedByChart");
                spyOn($scope, "updatePlayTypeChart");

                SoundDetailController.$onChanges(changesObj);
                expect($scope.updateAudioFile).toHaveBeenCalled();
                expect($scope.updateSummaryCard).toHaveBeenCalled();
                expect($scope.updateActivityChart).toHaveBeenCalled();
                expect($scope.updatePlayedByChart).toHaveBeenCalled();
                expect($scope.updatePlayTypeChart).toHaveBeenCalled();
            });
        });

        describe("updating sound file resource", function() {
            it("creates a trusted URL from the sound's data", function() {
                $scope.sound = {name: "mySound"};
                $scope.guild = {discord_id: "1005"};
                $scope.updateAudioFile();
                expect(sce.valueOf($scope.audioUrl)).toEqual("http://jacquesbot.io/raw/1005/mySound.mp3");
            });
        });

        describe("updating summary card", function() {
            it("sets the total play count accurately", function() {
                $scope.sound = {name: "mySound", sound_events: [{}, {}, {}]};
                $scope.updateSummaryCard();
                expect($scope.summaryPlayCount).toEqual(3);
            });

            it("sets the sound added date", function() {
                $scope.sound = {name: "mySound", sound_events: [], add_date: new Date()};
                $scope.updateSummaryCard();
                expect($scope.summaryAddDate).toBeDefined();
            });

            it("sets the sound added by username", function() {
                var expectedDate = new Date("2016-11-14T06:03:17.999Z");
                $scope.sound = {name: "mySound", sound_events: [], added_by: "Steve"};
                spyOn(SoundDetailChartsHelper, "calculateLastPlayedOnDate").and.callFake(function() {
                    return expectedDate;
                });

                $scope.updateSummaryCard();
                expect($scope.summaryLastPlayed).toEqual($scope.formatMonthDayYear(expectedDate));
            });
        });
    });
});