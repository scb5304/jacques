"use strict";

// Define the `jacquesApp` module
angular
    .module("jacquesApp", [
        "ngMaterial",
        "ngMessages",
        "ngRoute",
        "sounds",
        "soundOverview",
        "soundDetail",
        "soundList",
        "birdfeeder",
        "chart.js"
    ])
    .service("sharedProperties", function() {
        var sounds = [];
        var categories = [];
        var selected;
        var user;
        var guilds;

        return {
            getSounds: function() {
                return sounds;
            },
            setSounds: function(newSounds) {
                sounds = newSounds;
            },
            getSelected: function() {
                return selected;
            },
            setSelected: function(newSelected) {
                selected = newSelected;
            },
            getUser: function() {
                return user;
            },
            setUser: function(newUser) {
                user = newUser;
            },
            getGuilds: function() {
                return guilds;
            },
            setGuilds: function(newGuilds) {
                guilds = newGuilds;
            }
        };
    });
