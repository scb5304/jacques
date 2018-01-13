require("dotenv").config({path: require("app-root-path") + "/.config/.env"});
var syncUtils = require("./sync-utils");
const logger = require("./../util/logger.js");
const Db = require("../data/db");

Db.connect().then(function(){
    logger.info("Db connected!");
    syncUtils.sync();
});