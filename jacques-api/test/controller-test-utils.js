const chai = require("chai");
const logger = require("../../common/util/logger");

function expectResponseStatus(expected, actual, done) {
    logger.info("Expecting status of " + expected + ", got " + actual);
    chai.assert.equal(expected, actual);
    return {
        send: function () {
            done();
        }
    }
}

function expectResponseJson(expected, actual, done) {
    logger.info("Expecting json of " + JSON.stringify(expected) + ", got " + JSON.stringify(actual));
    chai.assert.deepEqual(expected, actual);
    done();
}

module.exports.expectResponseStatus = expectResponseStatus;
module.exports.expectResponseJson = expectResponseJson;