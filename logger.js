const winston = require('winston');
const moment = require('moment');

var loggerOptions = {
	timestamp: function() {
		var now = moment();
		var fmtd = now.format('MM/DD/YYYY h:mm:ss a')
		return fmtd;
	},
	filename: "logs.txt",
	"colorize": true,
	level: 'silly',
	handleExceptions: true,
	humanReadableUnhandledException: true
};

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)(loggerOptions),
		new(winston.transports.File)(loggerOptions)
	]
});

module.exports = logger;