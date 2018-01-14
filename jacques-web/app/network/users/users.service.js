"use strict";

angular
    .module("network")
    .service("UsersService", function ($rootScope, $resource, $q) {
        var Users = $resource($rootScope.JACQUES_API_ROOT + "users/:birdfeed");

        return {
            getUser: function(birdfeed) {
                return $q(function(resolve, reject) {
                    Users.get({birdfeed: birdfeed}, function(user) {
                        resolve(user);
                    }, function (err) {
                        reject(err);
                    });
                });
            }
        };
    });