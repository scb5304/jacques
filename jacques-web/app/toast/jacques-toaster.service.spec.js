"use strict";

describe("JacquesToaster", function() {

    var JacquesToaster;
    var mockMdToast;
    var mockSimple;

    beforeEach(function() {
        module("jacquesApp");
    });

    beforeEach(function () {
        mockSimple = {
            textContent: function () {return this;},
            position: function () {return this;},
            hideDelay: function () {return this;}
        };

        mockMdToast = {
            show: function () {},
            hide: function () {},
            simple: function () {
                return mockSimple
            }
        };

        module(function ($provide) {
            $provide.value("$mdToast", mockMdToast);
        });

    });

    beforeEach(inject(function(_JacquesToaster_) {
        JacquesToaster = _JacquesToaster_;
    }));

    describe("showing API error toast", function() {
        it("shows a toast about the Jacques API", function() {
            spyOn(mockSimple, "textContent").and.callThrough();
            JacquesToaster.showApiErrorToast();
            expect(mockSimple.textContent).toHaveBeenCalled();

            var toastText = mockSimple.textContent.calls.mostRecent().args[0];
            expect(toastText.toUpperCase().includes("Jacques API".toUpperCase())).toBeTruthy();
        });
    });

    describe("showing toast with text", function() {
        it("shows a toast that contains the passed text", function() {
            var text = "Toast content.";
            spyOn(mockSimple, "textContent").and.callThrough();
            JacquesToaster.showToastWithText(text);
            expect(mockSimple.textContent).toHaveBeenCalledWith(text);
        });
    });
});