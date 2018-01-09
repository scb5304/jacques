"use strict";

describe("SoundsService", function() {

    var SoundsService;
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

    beforeEach(inject(function(_SoundsService_) {
        SoundsService = _SoundsService_;
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

        describe("get by guild id and sound name", function() {
            var expectedGuildId = "420";
            var expectedSoundName = "mySound";

            it("returns a sound when successful network request", function() {
                var expectedReturnedSound = {
                    name: expectedSoundName,
                    discord_guild: expectedGuildId
                };

                $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId, expectedSoundName))
                    .respond(expectedReturnedSound);
                SoundsService.getSoundByName(expectedGuildId, expectedSoundName).then(function(sound) {
                    expect(expectedReturnedSound).toEqual(sound.toJSON());
                });
            });

            it("returns an error when failed network request", function() {
                $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId, expectedSoundName))
                    .respond(500, "Internal Server Error");
                SoundsService.getSoundByName(expectedGuildId, expectedSoundName).then(function() {
                    throw "Server error should not have resulted in a resolved promise.";
                }).catch(function(err) {
                    expect(err).toBeDefined();
                    expect(err.status).toEqual(500);
                });
            });
        });

        describe("get by guild id only", function() {
            var expectedGuildId = "420";

            it("returns an array of sounds when successful network request", function() {
                var expectedReturnedSounds = [{}, {}, {}];
                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId) + "?includeSoundEvents=false";

                $httpBackend.expectGET(uri).respond(expectedReturnedSounds);
                SoundsService.getSoundsByGuild(expectedGuildId).then(function(returnedSounds) {
                    expect(expectedReturnedSounds.length).toEqual(returnedSounds.length);
                });
            });

            it("returns an error when failed network request", function() {
                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, expectedGuildId) + "?includeSoundEvents=false";

                $httpBackend.expectGET(uri).respond(500, "Internal Server Error");
                SoundsService.getSoundsByGuild(expectedGuildId).then(function() {
                    throw "Server error should not have resulted in a resolved promise.";
                }).catch(function(err) {
                    expect(err).toBeDefined();
                    expect(err.status).toEqual(500);
                });
            });
        });

        describe("post", function() {
            var uploadBirdfeed = "a10b10293494";
            var uploadGuildId = "420";
            var uploadSoundName = "mySound";
            var uploadSoundData = "data:audio/mp3;base64";

            var uploadBody = {
                soundData: uploadSoundData,
                birdfeed: uploadBirdfeed
            };

            it("resolves when using valid parameters and successfully uploading", function() {
                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, uploadGuildId, uploadSoundName);
                $httpBackend.expectPOST(uri, uploadBody).respond(200);
                var resolveCallback = jasmine.createSpy("resolve");

                SoundsService.postSound(uploadGuildId, uploadSoundName, uploadSoundData, uploadBirdfeed).then(resolveCallback)
                    .catch(function (err) {
                        console.error(err);
                        throw "Unexpected rejection during sound upload.";
                    });

                setTimeout(10, function() {
                    expect(resolveCallback).toHaveBeenCalled();
                })
            });

            it("rejects when there's a server error during upload", function() {
                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, uploadGuildId, uploadSoundName);
                $httpBackend.expectPOST(uri, uploadBody).respond(500);
                var rejectCallback = jasmine.createSpy("reject");

                SoundsService.postSound(uploadGuildId, uploadSoundName, uploadSoundData, uploadBirdfeed).then(function() {
                    throw "Resolve should not occur when a server error does.";
                }).catch(rejectCallback);

                setTimeout(10, function() {
                    expect(rejectCallback).toHaveBeenCalled();
                })
            });
        });

        describe("delete", function() {
            var deleteBirdfeed = "a10b10293494";
            var deleteGuildId = "420";
            var deleteSoundName = "mySound";

            it("resolves when using valid parameters and successfully deleting", function() {
                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, deleteGuildId, deleteSoundName)
                    + "?birdfeed=" + deleteBirdfeed;
                $httpBackend.expectDELETE(uri).respond(200);
                var resolveCallback = jasmine.createSpy("resolve");

                SoundsService.deleteSound(deleteGuildId, deleteSoundName, deleteBirdfeed).then(resolveCallback)
                    .catch(function (err) {
                        console.error(err);
                        throw "Unexpected rejection during sound deletion.";
                    });

                setTimeout(10, function() {
                    expect(resolveCallback).toHaveBeenCalled();
                });
            });

            it("rejects when there's a server error during upload", function() {
                var uri = $rootScope.JACQUES_API_ROOT + buildDelimited(expectedEndpoint, deleteGuildId, deleteSoundName)
                    + "?birdfeed=" + deleteBirdfeed;
                $httpBackend.expectDELETE(uri).respond(500);
                var rejectCallback = jasmine.createSpy("reject");

                SoundsService.deleteSound(deleteGuildId, deleteSoundName, deleteBirdfeed).then(function() {
                    throw "Resolve should not occur when a server error does.";
                }).catch(rejectCallback);

                setTimeout(10, function() {
                    expect(rejectCallback).toHaveBeenCalled();
                });
            });
        });
    });
});