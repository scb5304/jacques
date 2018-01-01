"use strict";

angular
    .module("jacquesApp")
    .directive('scroll', function ($window) {
        return {
            link: function (scope, elem, attrs) {
                elem.on('scroll', function (e) {
                    var fab = document.getElementById("fab-scroll-to-top");
                    if (!fab) {
                        return;
                    }
                    var mainContent = document.getElementById("main-content");

                    if (!mainContent) {
                        return;
                    }

                    if (mainContent.scrollTop > 400) {
                        fab.style.visibility = "visible";
                    } else {
                        fab.style.visibility = "hidden";
                    }
                });
            }
        };
    });