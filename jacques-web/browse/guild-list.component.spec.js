"use strict";

describe("guildList", function() {

    beforeEach(function() {
        module('ui.router');
        module("guildList");
    });

    describe("GuildListController", function() {
        var $scope;
        var GuildListController;

        beforeEach(inject(function($componentController, $rootScope) {
            $scope = $rootScope.$new();
            GuildListController = $componentController("guildList", {$scope: $scope }, {guilds: []});
        }));

        it("should receive the guilds binding", function() {
            expect(GuildListController.guilds).toBeDefined();
        });
    });
});