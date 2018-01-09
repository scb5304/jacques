"use strict";

describe("GuildsService", function() {

    var GuildsService;
    var $rootScope;
    var $httpBackend;

    beforeEach(function() {
        module("jacquesApp");
    });

    //https://stackoverflow.com/a/26613169/4672234
    beforeEach(module(function($urlRouterProvider) {
        $urlRouterProvider.deferIntercept();
    }));

    beforeEach(inject(function(_$rootScope_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $rootScope.JACQUES_API_ROOT = "http://localhost:8081/api/";
        $httpBackend = _$httpBackend_;
    }));

    beforeEach(inject(function(_GuildsService_) {
        GuildsService = _GuildsService_;
    }));

    afterEach(function() {
        $httpBackend.flush();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    function buildDelimited() {
        var args = Array.prototype.slice.call(arguments);
        return args.join("/");
    }

    var expectedEndpoint = "guilds";

    describe("get by guild id", function() {
        var guildId = "420";
        var expectedGuild = {
            discord_guild_id: guildId,
            discord_guild_name: "The Jelly Pooters",
            volume: 0.65
        };

        it("returns a guild when successful network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, guildId)).respond(expectedGuild);
            GuildsService.getGuild(guildId).then(function(guild) {
                expect(expectedGuild).toEqual(guild.toJSON());
            }).catch(function(err) {
                console.error(err);
            });
        });

        it("returns an error when failed network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, guildId)).respond(500);
            GuildsService.getGuild(guildId).then(function() {
                throw "Server error should not have resulted in a resolved promise.";
            }).catch(function(err) {
                expect(err).toBeDefined();
                expect(err.status).toEqual(500);
            });
        });
    });

    describe("get guilds", function() {
        it("returns a list of guilds when successful network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint)).respond([{}, {}, {}, {}]);
            GuildsService.getGuilds().then(function(guilds) {
                expect(guilds.length).toEqual(4);
            }).catch(function(err) {
                console.error(err);
            });
        });

        it("returns an error when failed network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint)).respond(500);
            GuildsService.getGuilds().then(function() {
                throw "Server error should not have resulted in a resolved promise.";
            }).catch(function(err) {
                expect(err).toBeDefined();
                expect(err.status).toEqual(500);
            });
        });
    });
});