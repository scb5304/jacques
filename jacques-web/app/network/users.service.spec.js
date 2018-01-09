"use strict";

describe("UsersService", function() {

    var UsersService;
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

    beforeEach(inject(function(_UsersService_) {
        UsersService = _UsersService_;
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

    var endpoint = "users";
    var birdfeed = "ahguio23hgo1";
    var expectedUser = {
        discord_name: "Steve",
        discord_last_guild_name: "Jelly Spooters"
    };

    describe("get user by birdfeed", function() {

        it("returns a user when successful network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(endpoint, birdfeed)).respond(expectedUser);
            UsersService.getUser(birdfeed).then(function(returnedUser) {
                expect(expectedUser).toEqual(returnedUser.toJSON());
            }).catch(function(err) {
                console.error(err);
            });
        });

        it("returns an error when failed network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(endpoint, birdfeed)).respond(404);
            UsersService.getUser(birdfeed).then(function() {
                throw "Server error should not have resulted in a resolved promise.";
            }).catch(function(err) {
                expect(err).toBeDefined();
                expect(err.status).toEqual(404);
            });
        });
    });
});