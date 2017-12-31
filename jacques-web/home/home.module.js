"use strict";
angular
    .module("home", [])
    .config(["$stateProvider", function ($stateProvider, jacquesEndpointInterface) {
        var homeState = {
            name: 'home',
            url: '/',
            component: 'home',
            resolve: {
                statisticsObject: function(jacquesEndpointInterface) {
                    return jacquesEndpointInterface.getStatistics();
                }
            },
            data: {
                pageTitle: "Home"
            }
        };
        $stateProvider.state(homeState);
    }]);