"use strict";

describe("upload", function() {

    beforeEach(function() {
        module("ui.router");
        module("upload");
    });

    describe("UploadController", function() {
        var $scope;
        var $q;
        var UploadController;

        var sharedProperties = {
            getUser: function() {
                return {
                    discord_last_guild_id: "123456",
                    birdfeed_token: "abcdefg"
                };
            }
        };
        var JacquesToaster = {
            showToastWithText: function() {},
            showApiErrorToast: function() {}
        };
        var SoundsService = {};

        beforeEach(inject(function($componentController, $rootScope, _$q_) {
            $scope = $rootScope.$new();
            $q = _$q_;
            UploadController = $componentController("upload", {
                $scope: $scope, sharedProperties: sharedProperties,
                JacquesToaster: JacquesToaster,
                SoundsService: SoundsService
            });
        }));

        it("does not post a sound if the form is currently invalid", function() {
            $scope.SoundsService.postSound = function() {};
            $scope.formValid = false;

            mockGetBase64Success();
            spyOn(SoundsService, "postSound");

            $scope.onSubmitClick();
            expect(SoundsService.postSound).not.toHaveBeenCalled();
        });

        it("posts a sound after getting the base64 string for the first file", function() {
            $scope.files = [{lfFile: {name: "mySound.mp3"}}];

            mockGetBase64Success();
            mockPostSoundSuccess();
            spyOn(SoundsService, "postSound").and.callThrough();

            $scope.formValid = true;
            $scope.onSubmitClick();
            $scope.$digest();
            expect(SoundsService.postSound).toHaveBeenCalledWith("123456", "mysound", "myBase64", "abcdefg");
        });

        it("shows the exact error in a toast when network call fails with an error message", function() {
            $scope.files = [{lfFile: {name: "mySound.mp3"}}];

            mockGetBase64Success();
            mockPostSoundFailure({
                data: {
                    error: "It failed in every way possible."
                }
            });
            spyOn(SoundsService, "postSound").and.callThrough();
            spyOn(JacquesToaster, "showToastWithText");

            $scope.formValid = true;
            $scope.onSubmitClick();
            $scope.$digest();
            expect(JacquesToaster.showToastWithText).toHaveBeenCalledWith("It failed in every way possible.");
        });

        it("shows a generic error in a toast when network call fails", function() {
            $scope.files = [{lfFile: {name: "mySound.mp3"}}];

            spyOn(SoundsService, "postSound").and.callThrough();
            spyOn(JacquesToaster, "showApiErrorToast");
            mockGetBase64Success();
            mockPostSoundFailure({});

            $scope.formValid = true;
            $scope.onSubmitClick();
            $scope.$digest();
            expect(JacquesToaster.showApiErrorToast).toHaveBeenCalled();
        });

        function mockGetBase64Success() {
            spyOn($scope, "getBase64").and.callFake(function() {
                var deferred = $q.defer();
                deferred.resolve("myBase64");
                return deferred.promise;
            });
        }

        function mockPostSoundSuccess() {
            $scope.SoundsService.postSound = function() {
                var deferred = $q.defer();
                deferred.resolve();
                return deferred.promise;
            };
        }

        function mockPostSoundFailure(err) {
            $scope.SoundsService.postSound = function() {
                var deferred = $q.defer();
                deferred.reject(err);
                return deferred.promise;
            };
        }
    });
});