"use strict";

angular
    .module("jacquesApp")
    .config(function ($mdIconProvider, $mdThemingProvider, $stateProvider) {
        $mdThemingProvider.theme("default")
            .primaryPalette("green")
            .accentPalette("deep-orange");
        $mdIconProvider
            .icon("view-list", "assets/svg/view-list.svg", 24)
            .icon("menu", "assets/svg/menu.svg", 24)
            .icon("help", "assets/svg/help-circle-outline.svg", 24)
            .icon("github", "assets/svg/github-circle.svg", 24)
            .icon("close", "assets/svg/close.svg", 24)
            .icon("birdfeed", "assets/svg/hops.svg", 24)
            .icon("invite", "assets/svg/person_add.svg", 24);

        var homeState = {
            name: '/',
            url: '/',
            component: 'home'
        };

        var soundsState = {
            name: 'sounds',
            url: '/sounds',
            component: 'sounds',
            resolve: {
                guilds: function(jacquesEndpointInterface) {
                    return jacquesEndpointInterface.getGuilds();
                }
            }
        };

        var soundsByGuildState = {
            name: 'sounds.soundsByGuild',
            url: '/{guildId}',
            component: 'soundsByGuild',
            resolve: {
                sounds: function($transition$, jacquesEndpointInterface) {
                    var guildId = $transition$.params().guildId;
                    return jacquesEndpointInterface.getSoundsByGuild(guildId);
                }
            }
        };

        $stateProvider.state(homeState);
        $stateProvider.state(soundsState);
        $stateProvider.state(soundsByGuildState);
    });
