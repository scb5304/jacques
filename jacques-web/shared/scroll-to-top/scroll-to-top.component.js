"use strict";

angular.module("scrollToTop")
    .component("scrollToTop", {
        templateUrl: "shared/scroll-to-top/scroll-to-top.template.html",
        controller: ["$scope",
            function ScrollToTopController($scope) {
                $scope.scrollToTop = function scrollToTop() {
                    var mainContent = document.getElementById("main-content");
                    document.body.scrollTop = 0;
                    mainContent.scrollTop = 0;
                    mainContent.scrollTo(0, 0);
                }
            }
        ]
    });