"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($scope, $rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {
        var self = this;
        $scope.sharedProperties = sharedProperties;

        self.initializeUserValuesFromLocalStorage = function() {
            var storedUser = localStorage.getItem("jacques_user");
            if (storedUser) {
                self.user = JSON.parse(storedUser);
                $scope.sharedProperties.setUser(self.user);
                console.log("Pulled this object from local storage.");
                console.log(self.user);
            }
        };

        self.initializeUserValuesFromLocalStorage();

        //Listen in on changes to our User.
        $scope.$watch("sharedProperties.getUser()", function(newUser) {
            if (newUser) {
                self.user = newUser;
            }
        });

        self.getTitle = function() {
            return $rootScope.title;
        };

        self.toggleList = function() {
            $mdSidenav("left").toggle();
        };

        self.onSidenavSwipedLeft = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        };

        self.onSidenavSwipedRight = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.open();
            }
        };

        self.onSidenavItemClicked = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        };

        self.onSidenavMouseover = function($event) {
            if ($event.buttons === 1 && $event.movementX < -12) {
                setTimeout(function() {
                    self.onSidenavSwipedLeft();
                }, 100);
            }
        }
    });