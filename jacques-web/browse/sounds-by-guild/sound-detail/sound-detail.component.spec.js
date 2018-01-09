"use strict";

describe("Sound Detail", function () {

    beforeEach(function () {
        module("ui.router");
        module("ngMaterial");
        module("soundDetail");
    });

    describe("SoundDetailController", function () {
        var $scope;
        var $q;
        var $sce;
        var $state;
        var SoundDetailController;

        var sharedProperties = {
            setUser: function() {}
        };
        var SoundsService = {};
        var jacquesToaster = {
            showToastWithText: function() {},
            showApiErrorToast: function() {}
        };
        var SoundDetailChartsHelper = {};
        var mdDialog = {
            hide: function () {},
            show: function () {}
        };

        beforeEach(inject(function($componentController, $rootScope, _$sce_, _$q_, _$state_) {
            $scope = $rootScope.$new();
            $sce = _$sce_;
            $q = _$q_;
            $state = _$state_;
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
                SoundsService: SoundsService,
                jacquesToaster: jacquesToaster,
                SoundDetailChartsHelper: SoundDetailChartsHelper,
                $mdDialog: mdDialog
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
                expect($sce.valueOf($scope.audioUrl)).toEqual("http://jacquesbot.io/raw/1005/mySound.mp3");
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

        describe("updating activity card", function() {
            it("uses SoundDetailChartsHelper to get activity data", function() {
                var expectedMonths = [2, 3, 4, 5, 6, 7];
                $scope.sound = {name: "mySound"};

                spyOn(SoundDetailChartsHelper, "getSoundActivityMonths").and.callFake(function() {
                    return expectedMonths;
                });
                spyOn(SoundDetailChartsHelper, "calculateSoundActivityLabels");
                spyOn(SoundDetailChartsHelper, "calculateSoundActivityCounts");

                $scope.updateActivityChart();
                expect(SoundDetailChartsHelper.calculateSoundActivityLabels).toHaveBeenCalledWith(expectedMonths);
                expect(SoundDetailChartsHelper.calculateSoundActivityCounts).toHaveBeenCalledWith($scope.sound, expectedMonths);
            });
        });

        describe("played by chart", function() {
            it("uses SoundDetailChartsHelper to get activity data", function() {
                $scope.sound = {name: "mySound"};
                spyOn(SoundDetailChartsHelper, "calculateSoundPlayedByLabelsAndCounts");

                $scope.updatePlayedByChart();
                expect(SoundDetailChartsHelper.calculateSoundPlayedByLabelsAndCounts).toHaveBeenCalledWith($scope.sound, [], []);
            });
        });

        describe("play type chart", function() {
            it("uses SoundDetailChartsHelper to get both play types data", function() {
                $scope.sound = {name: "mySound"};
                spyOn(SoundDetailChartsHelper, "calculatePlayTypeCount");

                $scope.updatePlayTypeChart();
                expect(SoundDetailChartsHelper.calculatePlayTypeCount).toHaveBeenCalledTimes(2);
            });
        });

        describe("deletion", function() {
            it("shows deletion warning dialog when delete is pressed", function() {
                spyOn(mdDialog, "show");

                $scope.onDeleteClicked();
                expect(mdDialog.show).toHaveBeenCalled();
            });

            it("closes dialog when cancel is pressed", function() {
                spyOn(mdDialog, "hide");

                $scope.closeDialog();
                expect(mdDialog.hide).toHaveBeenCalled();
            });

            it("closes dialog when sound is successfully uploaded", function() {
                spyOn($scope, "closeDialog");

                $scope.onSuccessfulDeleteSoundResponse();
                expect($scope.closeDialog).toHaveBeenCalled();
            });

            it("navigates to sounds by guild when sound is successfully uploaded", function() {
                spyOn($state, "go").and.callThrough();
                $scope.guild = {discord_id: "1994"};

                $scope.onSuccessfulDeleteSoundResponse();
                expect($state.go).toHaveBeenCalledWith("soundsByGuild", {guildId: "1994"});
            });

            it("makes call to delete sound when confirm is pressed", function() {
                $scope.sound = {name: "mySound"};
                $scope.guild = {discord_id: "1994"};

                sharedProperties.getUser = function() {
                    return {
                        discord_username: "Steubenville",
                        discord_last_guild_id: "1994",
                        birdfeed_token: "lolololol"
                    }
                };

                SoundsService.deleteSound = function(){
                    var deferred = $q.defer();
                    deferred.resolve("Remote call result");
                    return deferred.promise;
                };

                spyOn(SoundsService, "deleteSound").and.callThrough();

                $scope.onConfirmDelete();
                expect(SoundsService.deleteSound).toHaveBeenCalledWith("1994", "mySound", "lolololol");
            });

            it("shows an error toast with specific text when sound upload fails with a 400-range response", function() {
                spyOn(jacquesToaster, "showToastWithText");
                var err = {
                    status: 404,
                    data: {
                        error: "Not found."
                    }
                };

                $scope.onFailedDeleteSoundResponse(err);
                expect(jacquesToaster.showToastWithText).toHaveBeenCalledWith("Not found.")
            });

            it("shows a generic API error toast other when sound upload fails", function() {
                spyOn(jacquesToaster, "showApiErrorToast");
                var err = {
                    status: 500
                };

                $scope.onFailedDeleteSoundResponse(err);
                expect(jacquesToaster.showApiErrorToast).toHaveBeenCalledWith()
            });
        });
    });
});