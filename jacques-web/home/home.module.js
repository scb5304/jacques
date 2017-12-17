"use strict";
angular
    .module("home", [])
    .config(["$stateProvider", function ($stateProvider) {
        var homeState = {
            name: 'home',
            url: '/',
            component: 'home'
        };
        $stateProvider.state(homeState);
    }]);