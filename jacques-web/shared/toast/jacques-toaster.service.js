"use strict";

angular
    .module("jacquesApp")
    .service("jacquesToaster", function ($mdToast) {
        return {
            showApiErrorToast: function () {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Sorry, there was an error talking to the Jacques API. Try again soon.")
                        .position("bottom center")
                        .hideDelay(3150)
                );
            },
            showToastWithText: function (text) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(text)
                        .position("bottom center")
                        .hideDelay(3150)
                );
            }
        }
    });