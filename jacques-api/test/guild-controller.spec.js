require("dotenv").config({path: require("app-root-path") + "/.env"});

const Db = require("../../common/data/db");
const sinon = require("sinon");
const chai = require("chai");
const guildController = require("../guild-controller");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("guild-controller", function() {
    it("does the thing", function() {
        chai.assert.isNotNull(guildController);

        this.sandbox.stub(Db, "getGuildById").callsFake(function() {
            return new Promise((resolve) => {
                return resolve();
            });
        });

        guildController.getGuild({params: {}}, {json: function() {}})
    })
});
