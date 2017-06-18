'use strict';

// Define the `jacquesApp` module
angular
    .module('jacquesApp', [
        'ngMaterial',
        'soundDetail',
        'soundList',
        'chart.js',
    ])
    .service('sharedProperties', function() {
        var sounds = [];
        var categories = [];
        var selected;

        return {
            getSounds: function() {
                return sounds;
            },
            setSounds: function(newSounds) {
                sounds = newSounds;
            },
            getCategories: function() {
                return categories;
            },
            setCategories: function(newCategories) {
                categories = newCategories;
            },
            getSelected: function() {
                return selected;
            },
            setSelected: function(newSelected) {
                selected = newSelected;
            }
        }
    });
