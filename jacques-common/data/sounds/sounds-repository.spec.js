require("dotenv").config({path: require("app-root-path") + "/.env"});
const sinon = require("sinon");
const chai = require("chai");
const Sound = require("../../model/sound").Sound;
const soundsRepository = require("./sounds-repository");
const logger = require("../../util/logger");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("sounds repository", function() {
    const testDiscordId = "91638832488";
    const testSoundName = "wah";
    const testDate = new Date("2018-01-09");
    const testBirdfeed = "a8sHd7r6wB";
    const testUser = {
        discord_id: testDiscordId,
        discord_username: "Steubenville",
        discord_last_guild_id: "10239409324934443241",
        birdfeed_token: testBirdfeed,
        birdfeed_date_time: testDate
    };

    describe("insert sound created by user", function() {
        it("inserts with passed sound name and user data", function(done) {
            this.sandbox.stub(Sound, "create").callsFake(function(doc, callback) {
                logger.info(doc);
                chai.assert.equal(doc.name, testSoundName);
                chai.assert.isTrue(doc.add_date instanceof Date);
                chai.assert.equal(doc.added_by, testUser.discord_username);
                chai.assert.equal(doc.discord_guild, testUser.discord_last_guild_id);
                done();
            });
            soundsRepository.insertSoundForGuildByUser(testSoundName, testUser);
        });
    });
});


