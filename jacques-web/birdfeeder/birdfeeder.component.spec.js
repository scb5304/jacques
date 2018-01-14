"use strict";

describe("birdfeeder", function() {

    beforeEach(function() {
        module("ngMaterial");
        module("birdfeeder");
    });

    describe("BirdfeedController", function() {
        var $scope;
        var $q;
        var sharedProperties = {
            setUser: function() {}
        };
        var UsersService = {
            getUser: function() {}
        };
        var JacquesToaster = {
            showToastWithText: function() {},
            showApiErrorToast: function() {}
        };
        var mdDialog = {
            show: function() {},
            hide: function() {}
        };
        var BirdfeedController;

        beforeEach(inject(function($componentController, $rootScope, _$q_) {
            $scope = $rootScope.$new();
            $q = _$q_;
            BirdfeedController = $componentController("birdfeeder", {
                $scope: $scope,
                sharedProperties: sharedProperties,
                UsersService: UsersService,
                JacquesToaster: JacquesToaster,
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

        describe("birdfeed submission", function() {
            var testBirdfeed = "abc4567890";
            var testUser = {
                discord_name: "Steubenville",
                birdfeed: testBirdfeed
            };

            describe("successful", function() {
                beforeEach(function() {
                    UsersService.getUser = function() {
                        var deferred = $q.defer();
                        deferred.resolve(testUser);
                        return deferred.promise;
                    };
                });

                it("uses jacques endpoint interface to fetch the user with this birdfeed", function() {
                    spyOn(UsersService, "getUser").and.callThrough();
                    $scope.submitBirdfeed(testBirdfeed);
                    expect(UsersService.getUser).toHaveBeenCalledWith(testBirdfeed);
                });

                it("stores the returned user in local storage", function() {
                    spyOn(UsersService, "getUser").and.callThrough();
                    spyOn(localStorage, "setItem");

                    $scope.submitBirdfeed(testBirdfeed);
                    $scope.$digest();
                    expect(localStorage.setItem).toHaveBeenCalledWith("jacques_user", JSON.stringify(testUser));
                });

                it("stores the returned user in shared properties", function() {
                    spyOn(UsersService, "getUser").and.callThrough();
                    spyOn(sharedProperties, "setUser");

                    $scope.submitBirdfeed(testBirdfeed);
                    $scope.$digest();
                    expect(sharedProperties.setUser).toHaveBeenCalledWith(testUser);
                });
            });

            describe("failed", function() {
                beforeEach(function() {
                    UsersService.getUser = function() {
                        var deferred = $q.defer();
                        deferred.reject({});
                        return deferred.promise;
                    };
                });

                it("removes the current user in local storage", function() {
                    spyOn(UsersService, "getUser").and.callThrough();
                    spyOn(localStorage, "removeItem");

                    $scope.submitBirdfeed(testBirdfeed);
                    $scope.$digest();
                    expect(localStorage.removeItem).toHaveBeenCalledWith("jacques_user");
                });

                it("removes the current user in shared properties", function() {
                    spyOn(UsersService, "getUser").and.callThrough();
                    spyOn(sharedProperties, "setUser");

                    $scope.submitBirdfeed(testBirdfeed);
                    $scope.$digest();
                    expect(sharedProperties.setUser).toHaveBeenCalledWith({});
                });

                it("displays toast with specific error when exists", function() {
                    UsersService.getUser = function() {
                        var deferred = $q.defer();
                        deferred.reject({
                            data: {
                                error: "Everything is broken."
                            }
                        });
                        return deferred.promise;
                    };
                    spyOn(UsersService, "getUser").and.callThrough();
                    spyOn(JacquesToaster, "showToastWithText");

                    $scope.submitBirdfeed(testBirdfeed);
                    $scope.$digest();
                    expect(JacquesToaster.showToastWithText).toHaveBeenCalledWith("Everything is broken.");
                });

                it("displays toast with generic error when a specific one doesnt exist", function() {
                    spyOn(UsersService, "getUser").and.callThrough();
                    spyOn(JacquesToaster, "showApiErrorToast");

                    $scope.submitBirdfeed(testBirdfeed);
                    $scope.$digest();
                    expect(JacquesToaster.showApiErrorToast).toHaveBeenCalled();
                });
            });
        });
    });
});