"use strict";

angular
    .module("jacquesApp")
    .directive("scroll", function () {
        return {
            link: function (scope, elem) {
                elem.on("scroll", function () {
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