var syncUtils = require("./sync-utils");
const mongoose = require("mongoose");
const logger = require("./../util/logger.js");
const Db = require("../data/db");

Db.connect().then(function(){
    logger.info("Db connected!");
    syncUtils.sync();
});