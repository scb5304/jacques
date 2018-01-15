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
   it("connects to database, initializing without crashing", function(done) {
       this.sandbox.stub(Db, "connect").callsFake(function() {
           setTimeout(function() {
               done();
           }, 5);
       });
       require("./jacques-api");
   })
});
