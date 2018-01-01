var syncUtils = require("./sync-utils");
const mongoose = require("mongoose");
const logger = require("./../util/logger.js");

mongoose.connect("mongodb://localhost/jacques", function() {
    logger.info("Db connected!");
    syncUtils.sync();
});