"use strict";

describe("AppController", function() {

    beforeEach(function() {
        module("jacquesApp");
    });

    describe("AppController", function() {
        var $scope;
        var AppController;
        var createController;
        var sharedProperties;

        beforeEach(inject(function($controller, $rootScope, _sharedProperties_) {
            $scope = $rootScope.$new();
            sharedProperties = _sharedProperties_;
            createController = function() {
                return $controller("AppController", {
                    $scope: $scope,
                    sharedProperties: sharedProperties
                });
            };
        }));

        fdescribe("user reference", function() {
            it("sets user to stored value when exists", function() {
                var testUserJSON = "{\"discord_id\":\"69420\"}";
                spyOn(localStorage, "getItem").and.callFake(function() {
                    return testUserJSON;
                });

                AppController = createController();
                expect($scope.user).toEqual(JSON.parse(testUserJSON));
            });

            it("does not set user to stored value when doesn't exist", function() {
                spyOn(localStorage, "getItem").and.callFake(function() {
                    return null;
                });

                AppController = createController();
                expect($scope.user).not.toBeDefined();
            });

            it("updates user reference when shared properties' user is changed", function() {
                AppController = createController();
                sharedProperties.setUser({discord_name: "Steve"});
                $scope.$digest();
                expect($scope.user).toEqual({discord_name: "Steve"});
            });
        });
    });
});