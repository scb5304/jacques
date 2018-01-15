require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
const sinon = require("sinon");
const Db = require("../jacques-common/data/db");

beforeEach(function() {
    this.sandbox = sinon.sandbox.create();
});

afterEach(function() {
    this.sandbox.restore();
});

describe("jacques-api", function() {
   it("connects to database", function(done) {
       this.sandbox.stub(Db, "connect").callsFake(function() {
           done();
       });
       require("./jacques-api");
   })
});
