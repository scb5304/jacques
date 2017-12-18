"use strict";
angular
    .module("upload", [])
    .config(["$stateProvider", function ($stateProvider) {
        var uploadState = {
            name: 'upload',
            url: '/upload',
            component: 'upload'
        };
        $stateProvider.state(uploadState);
    }]);