require('dotenv').config({path: './../.env'});
var logger = require('./../common/util/logger.js');
var jacques = require('./jacques.js');

logger.info("Running Jacques...");
jacques.initialize();