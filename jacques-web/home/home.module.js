"use strict";
angular
    .module("home", [])
    .config(["$stateProvider", function ($stateProvider) {
        var homeState = {
            name: 'home',
            url: '/',
            component: 'home',
            resolve: {
                statisticsObject: function(StatisticsService) {
                    return StatisticsService.getStatistics();
                }
            },
            data: {
                pageTitle: "Home"
            }
        };
        $stateProvider.state(homeState);
    }]);