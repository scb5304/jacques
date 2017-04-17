'use strict';

// Register `floating` component, along with its associated controller and template
angular.
module('floating').
component('floating', {
    templateUrl: 'floating/floating.template.html',
    controller: ['Sound',
        function PhoneDetailController(Sound) {

        }
    ]
});
