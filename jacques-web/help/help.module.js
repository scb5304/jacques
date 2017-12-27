"use strict";
angular
    .module("help", [])
    .config(["$stateProvider", function ($stateProvider) {
        var helpState = {
            name: 'help',
            url: '/help',
            component: 'help',
            data: {
                pageTitle: "Help"
            }
        };
        $stateProvider.state(helpState);
    }]);