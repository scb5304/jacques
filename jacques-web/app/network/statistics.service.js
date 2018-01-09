"use strict";

angular
    .module("network")
    .service("StatisticsService", function ($rootScope, $resource, $q) {
        var Statistics = $resource($rootScope.JACQUES_API_ROOT + "statistics");

        return {
            getStatistics: function() {
                return $q(function(resolve, reject) {
                    Statistics.get({}, function(statisticsObject) {
                        resolve(statisticsObject);
                    }, function (err) {
                        reject(err);
                    });
                });
            }
        }
    });