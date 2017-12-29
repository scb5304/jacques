"use strict";

// Define the `jacquesApp` module
angular
    .module("jacquesApp", [
        "ngMaterial",
        "ngMessages",
        "ngResource",
        "ui.router",
        "lfNgMdFileInput",
        "home",
        "scrollToTop",
        "guildList",
        "soundsByGuild",
        "soundDetail",
        "upload",
        "help",
        "birdfeeder",
        "chart.js",
    ])
    .run(function($state, jacquesToaster) {
        $state.defaultErrorHandler(function(error) {
            console.error(error);
            jacquesToaster.showApiErrorToast();
        });
    })
    //https://stackoverflow.com/a/26086324/4672234
    .run(['$rootScope', '$state', '$stateParams',
        function ($rootScope, $state, $stateParams) {
            $rootScope.$state = $state;
            $rootScope.$stateParams = $stateParams;
        }])
    .service("sharedProperties", function () {
        var sounds = [];
        var selected;
        var user;
        var guilds;

        return {
            getSounds: function () {
                return sounds;
            },
            setSounds: function (newSounds) {
                sounds = newSounds;
            },
            getSelected: function () {
                return selected;
            },
            setSelected: function (newSelected) {
                selected = newSelected;
            },
            getUser: function () {
                return user;
            },
            setUser: function (newUser) {
                user = newUser;
            },
            getGuilds: function () {
                return guilds;
            },
            setGuilds: function (newGuilds) {
                guilds = newGuilds;
            }
        };
    })
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
    })
    .service("jacquesToaster", function($mdToast) {
        return {
            showApiErrorToast: function () {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent("Sorry, there was an error talking to the Jacques API. Try again soon.")
                        .position("bottom center")
                        .hideDelay(3150)
                );
            },
            showToastWithText: function (text) {
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(text)
                        .position("bottom center")
                        .hideDelay(3150)
                );
            }
        }
    })
    .service("jacquesEndpointInterface", function ($resource) {
        var Guilds = $resource("http://localhost:8081/api/guilds/:guildId");
        var SoundsByGuild= $resource("http://localhost:8081/api/sounds/:guildId?includeSoundEvents=:includeEvents");
        var SoundsByGuildAndName = $resource("http://localhost:8081/api/sounds/:guildId/:soundName");

        return {
            getGuilds: function () {
                return new Promise((resolve, reject) => {
                    Guilds.query(function (guilds) {
                        return resolve(guilds);
                    }, function (err) {
                        return reject(err);
                    });
                });
            },
            getGuild: function (discordGuildId) {
                return new Promise((resolve, reject) => {
                    Guilds.get({guildId: discordGuildId}, function (guild) {
                        return resolve(guild);
                    }, function (err) {
                        return reject(err);
                    });
                });
            },
            getSoundsByGuild: function (discordGuildId) {
                return new Promise((resolve, reject) => {
                    SoundsByGuild.query({guildId: discordGuildId, includeEvents: false}, function (guilds) {
                        return resolve(guilds);
                    }, function (err) {
                        return reject(err);
                    });
                });
            },
            getSoundByName: function (discordGuildId, soundName) {
                return new Promise((resolve, reject) => {
                    SoundsByGuildAndName.get({guildId: discordGuildId, soundName: soundName}, function (sound) {
                        return resolve(sound);
                    }, function (err) {
                        return reject(err);
                    });
                });
            },
            deleteSound: function(discordGuildId, soundName) {
                return new Promise((resolve, reject) => {
                    SoundsByGuildAndName.delete({guildId: discordGuildId, soundName: soundName}, function () {
                        return resolve();
                    }, function (err) {
                        return reject(err);
                    });
                });
            },
            postSound: function(discordGuildId, soundName, soundData, birdfeed) {
                return new Promise((resolve, reject) => {
                    var sound = {soundData, birdfeed};
                    SoundsByGuildAndName.save({guildId: discordGuildId, soundName: soundName}, sound, function () {
                        return resolve();
                    }, function (err) {
                        return reject(err);
                    });
                });
            }
        }
    });