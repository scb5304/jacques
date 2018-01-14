"use strict";

// Define the `jacquesApp` module
angular
    .module("jacquesApp", [
        "ngMaterial",
        "ngMessages",
        "ngResource",
        "chart.js",
        "ui.router",
        "lfNgMdFileInput",
        "home",
        "scrollToTop",
        "guildList",
        "soundsByGuild",
        "soundDetail",
        "upload",
        "help",
        "birdfeeder",
        "network"
    ])
    .run(function($state, JacquesToaster) {
        $state.defaultErrorHandler(function() {
            JacquesToaster.showApiErrorToast();
        });
    })
    //https://stackoverflow.com/a/26086324/4672234
    .run(["$rootScope", "$state", "$stateParams",
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }])
    .service("sharedProperties", function () {
        var user;

        return {
            getUser: function () {
                return user;
            },
            setUser: function (newUser) {
                user = newUser;
            }
        };
    });