"use strict";

angular
    .module("jacquesApp")
    .controller("AppController", function AppController($rootScope, $location, $http, sharedProperties, $mdSidenav, $mdDialog) {
        $rootScope.JACQUES_API_ROOT = "http://localhost:8081/api";

        this.getTitle = function() {
            return $rootScope.title;
        };

        $rootScope.$on("$locationChangeStart", function(event) {
            var sidenav = $mdSidenav("left");

            if (sidenav.isOpen()) {
                sidenav.close();
            } else if (angular.element(document.body).hasClass('md-dialog-is-showing')) {
                event.preventDefault();
                $mdDialog.cancel();
            }
        });

        this.toggleList = function() {
            $mdSidenav("left").toggle();
        };

        this.onSidenavSwipedLeft = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        };

        this.onSidenavSwipedRight = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.open();
            }
        };

        this.onSidenavItemClicked = function() {
            var sidenav = $mdSidenav("left");
            if (sidenav) {
                sidenav.close();
            }
        }
    });