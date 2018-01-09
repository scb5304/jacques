"use strict";

describe("jacquesEndpointInterface", function() {

    var jacquesEndpointInterface;
    var $rootScope;
    var $httpBackend;

    beforeEach(function() {
        module("jacquesApp");
    });

    //https://stackoverflow.com/a/26613169/4672234
    beforeEach(module(function($urlRouterProvider) {
        $urlRouterProvider.deferIntercept();
    }));

    beforeEach(inject(function(_$rootScope_, _jacquesEndpointInterface_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        jacquesEndpointInterface = _jacquesEndpointInterface_;
        $httpBackend = _$httpBackend_;
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

    describe("Sounds", function() {
        var expectedEndpoint = "sounds";

        describe("by guild id and sound name", function() {
            var expectedGuildId = "420";
            var expectedSoundName = "mySound69";

            it("returns a sound when successful network request", function() {
                var expectedReturnedSound = {
                    name: expectedSoundName,
                    discord_guild: expectedGuildId
                };

                $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId, expectedSoundName))
                    .respond(expectedReturnedSound);
                jacquesEndpointInterface.getSoundByName("420", "mySound69").then(function(sound) {
                    expect(expectedReturnedSound).toEqual(sound.toJSON());
                });
            });

            it("returns an error when failed network request", function() {
                $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId, expectedSoundName))
                    .respond(500, "Internal Server Error");
                jacquesEndpointInterface.getSoundByName("420", "mySound69").then(function() {
                    throw "Server error should not have resulted in a resolved promise.";
                }).catch(function(err) {
                    expect(err).toBeDefined();
                    expect(err.status).toEqual(500);
                });
            });
        });

        describe("by guild id only", function() {
            it("returns an array of sounds when successful network request", function() {
                var expectedGuildId = "420";
                var expectedReturnedSounds = [{}, {}, {}];

                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId) + "?includeSoundEvents=false";
                $httpBackend.expectGET(uri).respond(expectedReturnedSounds);
                jacquesEndpointInterface.getSoundsByGuild("420").then(function(sound) {
                    expect(expectedReturnedSounds.length).toEqual(3);
                });
            });

            it("returns an error when failed network request", function() {
                var expectedGuildId = "420";
                var expectedSoundName = "mySound69";

                $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId, expectedSoundName))
                    .respond(500, "Internal Server Error");
                jacquesEndpointInterface.getSoundByName("420", "mySound69").then(function() {
                    throw "Server error should not have resulted in a resolved promise.";
                }).catch(function(err) {
                    expect(err).toBeDefined();
                    expect(err.status).toEqual(500);
                });
            });
        });
    });
});