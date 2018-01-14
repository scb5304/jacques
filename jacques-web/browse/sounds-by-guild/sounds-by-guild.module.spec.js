describe("sounds by guild config", function () {
    var $stateProvider;
    var soundsByGuildState;
    var testGuildId = "113425666951190094";
    var guildsService = {getGuild: function() {}};
    var soundsService = {getSoundsByGuild: function() {}};

    //https://medium.com/@a_eife/testing-config-and-run-blocks-in-angularjs-1809bd52977e
    beforeEach(function () {
        module("ui.router");
        module(function(_$stateProvider_) {
            $stateProvider = _$stateProvider_;
            spyOn($stateProvider, "state").and.callFake(function(state) {
                soundsByGuildState = state;
            });
        });
        module("soundsByGuild");
        inject();
    });

    it("should fetch a guild with the ID in the state params", function() {
        var testSoundsByGuildTransition = {
            params: function() {
                return {
                    guildId: testGuildId
                };
            }
        };

        spyOn(guildsService, "getGuild");
        soundsByGuildState.resolve.guild(testSoundsByGuildTransition, guildsService);
        expect(guildsService.getGuild).toHaveBeenCalledWith(testGuildId);
    });

    it("should fetch all sounds with the guild ID in the state params", function() {
        var testSoundDetailTransition = {
            params: function() {
                return {
                    guildId: testGuildId,
                };
            }
        };

        spyOn(soundsService, "getSoundsByGuild");
        soundsByGuildState.resolve.sounds(testSoundDetailTransition, soundsService);
        expect(soundsService.getSoundsByGuild).toHaveBeenCalledWith(testGuildId);
    });
});