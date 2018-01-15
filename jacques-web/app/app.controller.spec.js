"use strict";

describe("AppController", function () {

    beforeEach(function() {
        module("jacquesApp");
    });

    var $scope;
    var sharedProperties;
    var sideNavToggleMock = jasmine.createSpy("toggle");
    var sideNavOpenMock = jasmine.createSpy("open");
    var sideNavCloseMock = jasmine.createSpy("close");

    //http://answersicouldntfindanywhereelse.blogspot.com/2016/05/testing-mdsidenav.html
    beforeEach(module(function ($provide) {
        $provide.factory("$mdSidenav", function () {
            return function () {
                return {
                    toggle: sideNavToggleMock,
                    close: sideNavCloseMock,
                    open: sideNavOpenMock
                };
            };
        });
    }));

    beforeEach(inject(function($controller, $rootScope, _sharedProperties_) {
        $scope = $rootScope.$new();
        sharedProperties = _sharedProperties_;
        $controller("AppController", {
            $scope: $scope,
            sharedProperties: sharedProperties
        });
    }));

    describe("user reference", function() {
        it("sets user to stored value when exists", function () {
            var testUserJSON = "{\"discord_id\":\"69420\"}";
            spyOn(localStorage, "getItem").and.callFake(function () {
                return testUserJSON;
            });

            $scope.initializeUserValuesFromLocalStorage();
            expect($scope.user).toEqual(JSON.parse(testUserJSON));
        });

        it("does not set user to stored value when doesn't exist", function () {
            spyOn(localStorage, "getItem").and.callFake(function () {
                return null;
            });

            $scope.initializeUserValuesFromLocalStorage();
            expect($scope.user).not.toBeDefined();
        });

        it("updates user reference when shared properties' user is changed", function () {
            var testUser = {discord_name: "Steve"};
            sharedProperties.setUser(testUser);

            $scope.$digest();
            $scope.initializeUserValuesFromLocalStorage();
            expect($scope.user).toEqual(testUser);
            expect(sharedProperties.getUser()).toEqual(testUser);
        });
    });

    describe("sidenav", function () {
        it("toggles the sidenav when the menu button is pressed", function () {
            $scope.toggleList();
            expect(sideNavToggleMock).toHaveBeenCalled();
        });

        it("closes the sidenav when a menu item is selected", function () {
            $scope.onSidenavItemClicked();
            expect(sideNavCloseMock).toHaveBeenCalled();
        });

        it("closes the sidenav when the user swipes to the left on the sidenav", function() {
            $scope.onSidenavSwipedLeft();
            expect(sideNavCloseMock).toHaveBeenCalled();
        });

        it("opens the sidenav when the user swipes to the right from the edge of the screen", function() {
            $scope.onSidenavSwipedRight();
            expect(sideNavOpenMock).toHaveBeenCalled();
        });
    });
});