describe("directive: svg-circle", function() {
    var element, scope;

    beforeEach(module("jacquesApp"));
    beforeEach(inject(function($rootScope, $compile) {
        scope = $rootScope.$new();
        element = "<md-content scroll-watch></md-content>";
        scope.size = 100;

        element = $compile(element)(scope);
        scope.$digest();
    }));

    describe("toggles the visible of the floating action button based on scroll values", function() {
        var testFab;
        var testMainContent;

        beforeEach(function() {
            testFab = {style: {visibility: "none"}};
            testMainContent = {scrollTop: 0};

            document.getElementById = jasmine.createSpy("getElement fake").and.callFake(function(id) {
                if (id === "fab-scroll-to-top") {
                    return testFab;
                }
                if (id === "main-content") {
                    return testMainContent;
                }
            });
        });

        it("leaves the FAB as undefined when it isn't defined", function() {
            testFab = undefined;
            element.triggerHandler("scroll");
            expect(testFab).not.toBeDefined();
        });

        it("does nothing if the main content isn't defined", function() {
            testMainContent = undefined;
            element.triggerHandler("scroll");
            expect(testFab.style.visibility).toEqual("none");
        });

        it("hides the FAB when main content is scrolled before 400 y", function() {
            testMainContent.scrollTop = 200;
            element.triggerHandler("scroll");
            expect(testFab.style.visibility).toEqual("hidden");
        });

        it("shows the FAB when main content is scrolled past 400 y", function() {
            testMainContent.scrollTop = 589;
            element.triggerHandler("scroll");
            expect(testFab.style.visibility).toEqual("visible");
        });
    });
});