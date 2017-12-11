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

        var guildsState = {
            name: 'guildList',
            url: '/sounds',
            component: 'guildList',
            resolve: {
                guilds: function(jacquesEndpointInterface) {
                    return jacquesEndpointInterface.getGuilds();
                }
            }
        };

        var soundsByGuildState = {
            name: 'soundsByGuild',
            url: '/sounds/{guildId}',
            component: 'soundsByGuild',
            resolve: {
                guildId: function($transition$) {
                    return $transition$.params().guildId;
                },
                sounds: function($transition$, jacquesEndpointInterface) {
                    var guildId = $transition$.params().guildId;
                    return jacquesEndpointInterface.getSoundsByGuild(guildId);
                }
            }
        };

        var soundDetailState = {
            name: 'soundDetail',
            url: '/sounds/{guildId}/{soundName}',
            component: 'soundDetail',
            resolve: {
                guildId: function($transition$) {
                    return $transition$.params().guildId;
                },
                soundName: function($transition$) {
                    return $transition$.params().soundName;
                }
            }
        };

        $stateProvider.state(homeState);
        $stateProvider.state(guildsState);
        $stateProvider.state(soundsByGuildState);
        $stateProvider.state(soundDetailState);
    });
