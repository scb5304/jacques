const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const logger = require("./../util/logger");

function connect() {
    logger.info("Connecting to database...");
    return mongoose.connect(process.env.JACQUES_MONGO_PATH);
}

module.exports.connect = connect;