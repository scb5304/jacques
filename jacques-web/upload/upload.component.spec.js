"use strict";

describe("upload", function() {

    beforeEach(function() {
        module('ui.router');
        module("upload");
    });

    describe("UploadController", function() {
        var $scope;
        var q;
        var UploadController;

        var sharedProperties = {
            getUser: function() {
                return {
                    discord_last_guild_id: "123456",
                    birdfeed_token: "abcdefg"
                };
            }
        };
        var jacquesToaster = {
            showToastWithText: function() {},
            showApiErrorToast: function() {}
        };
        var jacquesEndpointInterface = {};

        beforeEach(inject(function($componentController, $rootScope, $q) {
            $scope = $rootScope.$new();
            q = $q;
            UploadController = $componentController("upload", {
                $scope: $scope, sharedProperties: sharedProperties,
                jacquesToaster: jacquesToaster,
                jacquesEndpointInterface: jacquesEndpointInterface
            });
        }));

        it("does not post a sound if the form is currently invalid", function() {
            $scope.jacquesEndpointInterface.postSound = function() {};
            $scope.formValid = false;

            mockGetBase64Success();
            spyOn(jacquesEndpointInterface, "postSound");

            $scope.onSubmitClick();
            expect(jacquesEndpointInterface.postSound).not.toHaveBeenCalled();
        });

        it("posts a sound after getting the base64 string for the first file", function() {
            $scope.files = [{lfFile: {name: "mySound.mp3"}}];

            mockGetBase64Success();
            mockPostSoundSuccess();
            spyOn(jacquesEndpointInterface, "postSound").and.callThrough();

            $scope.formValid = true;
            $scope.onSubmitClick();
            $scope.$digest();
            expect(jacquesEndpointInterface.postSound).toHaveBeenCalledWith("123456", "mysound", "myBase64", "abcdefg");
        });

        it("shows the exact error in a toast when network call fails with an error message", function() {
            $scope.files = [{lfFile: {name: "mySound.mp3"}}];

            mockGetBase64Success();
            mockPostSoundFailure({
                data: {
                    error: "It failed in every way possible."
                }
            });
            spyOn(jacquesEndpointInterface, "postSound").and.callThrough();
            spyOn(jacquesToaster, "showToastWithText");

            $scope.formValid = true;
            $scope.onSubmitClick();
            $scope.$digest();
            expect(jacquesToaster.showToastWithText).toHaveBeenCalledWith("It failed in every way possible.");
        });

        it("shows a generic error in a toast when network call fails", function() {
            $scope.files = [{lfFile: {name: "mySound.mp3"}}];

            spyOn(jacquesEndpointInterface, "postSound").and.callThrough();
            spyOn(jacquesToaster, "showApiErrorToast");
            mockGetBase64Success();
            mockPostSoundFailure({});

            $scope.formValid = true;
            $scope.onSubmitClick();
            $scope.$digest();
            expect(jacquesToaster.showApiErrorToast).toHaveBeenCalled();
        });

        function mockGetBase64Success() {
            spyOn($scope, "getBase64").and.callFake(function() {
                var deferred = q.defer();
                deferred.resolve("myBase64");
                return deferred.promise;
            });
        }

        function mockPostSoundSuccess() {
            $scope.jacquesEndpointInterface.postSound = function() {
                var deferred = q.defer();
                deferred.resolve();
                return deferred.promise;
            };
        }

        function mockPostSoundFailure(err) {
            $scope.jacquesEndpointInterface.postSound = function() {
                var deferred = q.defer();
                deferred.reject(err);
                return deferred.promise;
            };
        }
    });
});