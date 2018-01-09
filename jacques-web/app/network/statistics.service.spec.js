"use strict";

describe("StatisticsService", function() {

    var StatisticsService;
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

    beforeEach(inject(function(_StatisticsService_) {
        StatisticsService = _StatisticsService_;
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

    var endpoint = "statistics";
    var expectedStatistics = {
        soundsCount: 500,
        guildsCount: 600,
        soundEventsCount: 1500
    };

    describe("get", function() {

        it("returns a statistics object when successful network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(endpoint)).respond(expectedStatistics);
            StatisticsService.getStatistics().then(function(statisticsObj) {
                expect(expectedStatistics).toEqual(statisticsObj.toJSON());
            }).catch(function(err) {
                console.error(err);
            });
        });

        it("returns an error when failed network request", function() {
            $httpBackend.expectGET($rootScope.JACQUES_API_ROOT + buildDelimited(endpoint)).respond(500);
            StatisticsService.getStatistics().then(function() {
                throw "Server error should not have resulted in a resolved promise.";
            }).catch(function(err) {
                expect(err).toBeDefined();
                expect(err.status).toEqual(500);
            });
        });
    });
});