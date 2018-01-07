"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($rootScope, $scope, $location, $http, sharedProperties, $mdSidenav) {
        $scope.sharedProperties = sharedProperties;

        $scope.initializeUserValuesFromLocalStorage = function() {
            var storedUser = localStorage.getItem("jacques_user");
            if (storedUser) {
                $scope.user = JSON.parse(storedUser);
                $scope.sharedProperties.setUser(self.user);
            }
        };

        $scope.initializeUserValuesFromLocalStorage();

        //Listen in on changes to our User.
        $scope.$watch("sharedProperties.getUser()", function(newUser) {
            if (newUser) {
                $scope.user = newUser;
            }
        });

        $scope.toggleList = function() {
            $mdSidenav("left").toggle();
        };

        $scope.onSidenavSwipedLeft = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        };

        $scope.onSidenavSwipedRight = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.open();
            }
        };

        $scope.onSidenavItemClicked = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        };
    });