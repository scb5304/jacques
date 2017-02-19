const Discord = require("discord.js");
const bot = require('../jacques');
const config = require('../config.json');
const Sound = require('../model/sound');
const apiai = require('apiai');
const logger = require('../logger.js');
const SOUNDS_DIRECTORY = config.soundsDirectory;
const APIAI_KEY = config.apiaiKey;

var app = apiai(APIAI_KEY);

function handleDirectMessage(message) {
	var request = app.textRequest(message.content, {
		sessionId: 1
	});
	if (message.author.username === bot.user.username) return;
	logger.info("Received Discord direct message: " + message.content + " from " + message.author.username);
	request.on('response', function(response) {
		var responseMessage = response.result.fulfillment.speech;
		//Discord API sendMessage()
		message.author.sendMessage(responseMessage)
			.then(message => logger.info(`Sent message: ${message.content}`))
			.catch(emptyErrorLol);
	});
	request.on('error', emptyErrorLol);
	request.end();
}

function emptyErrorLol(error) {

}

module.exports.handleDirectMessage = handleDirectMessage;