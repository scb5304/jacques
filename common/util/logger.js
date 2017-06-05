process.env.TZ = 'America/New_York';
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
	humanReadableUnhandledException: true,
	prettyPrint:true
};

var logger = new(winston.Logger)({
	transports: [
		new(winston.transports.Console)(loggerOptions)
	]
});

module.exports = logger;