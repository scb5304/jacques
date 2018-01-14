describe("sound detail config", function () {
    var $stateProvider;
    var soundDetailState;
    var testGuildId = "113425666951190094";
    var testSoundName = "aha";
    var guildsService = {getGuild: function() {}};
    var soundsService = {getSoundByName: function() {}};

    //https://medium.com/@a_eife/testing-config-and-run-blocks-in-angularjs-1809bd52977e
    beforeEach(function () {
        module("ui.router");
        module(function(_$stateProvider_) {
            $stateProvider = _$stateProvider_;
            spyOn($stateProvider, "state").and.callFake(function(state) {
                soundDetailState = state;
            });
        });
        module("soundDetail");
        inject();
    });

    it("should fetch a guild with the ID in the state params", function() {
        var testSoundDetailTransition = {
            params: function() {
                return {
                    guildId: testGuildId
                };
            }
        };

        spyOn(guildsService, "getGuild");
        soundDetailState.resolve.guild(testSoundDetailTransition, guildsService);
        expect(guildsService.getGuild).toHaveBeenCalledWith(testGuildId);
    });

    it("should fetch a sound with the guild ID and sound name in the state params", function() {
        var testSoundDetailTransition = {
            params: function() {
                return {
                    guildId: testGuildId,
                    soundName: testSoundName
                };
            }
        };

        spyOn(soundsService, "getSoundByName");
        soundDetailState.resolve.sound(testSoundDetailTransition, soundsService);
        expect(soundsService.getSoundByName).toHaveBeenCalledWith(testGuildId, testSoundName);
    });
});