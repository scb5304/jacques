var Db = require('./../common/data/db');
var config = require('./../config.json');
var logger = require('./../common/util/logger.js');
var ytdl = require('ytdl-core');

var streamVolume = 0.40;

function streamAudio(voiceChannel, streamLink) {
    logger.info("Attempting to stream audio...");
    if (!streamLink) {
        logger.info("Stream requested with no link.");
        return;
    } else {
        logger.info(streamLink);
    }

    const streamOptions = {
        seek: calculateStreamSeekSeconds(streamLink),
        volume: streamVolume
    };

    voiceChannel.join()
        .then(function(connection) {
            const stream = ytdl(streamLink, {
                filter: 'audioonly'
            });

            const dispatcher = connection.playStream(stream, streamOptions);
            dispatcher.once('end', function() {
                logger.info("Leaving after playing sound.");
                connection.disconnect();
            });
            dispatcher.once('speaking', function() {
                dispatcher.setVolumeLogarithmic(streamVolume);
            })
        })
        .catch(logger.error);
}

function calculateStreamSeekSeconds(streamLink) {
    var secondsToSeek = 0;

    var timeArg = streamLink.split("\?t=")[1]; // 3m4s

    if (!timeArg) {
        return secondsToSeek;
    }

    if (timeArg.includes("m")) {
        var mins = timeArg.split("m")[0];
        secondsToSeek += Number(mins) * 60;

        if (timeArg.includes("s")) {
            var secs = timeArg.split("m")[0].split("s")[0];
            secondsToSeek += Number(secs);
        }
    } else if (timeArg.includes("s")) {
        var secs = timeArg.split("s")[0];
        secondsToSeek += secs;
    } else {
        secondsToSeek = timeArg;
    }
    if (secondsToSeek) {
        logger.info("URL wants to start at a given time: " + secondsToSeek);
    }
    return secondsToSeek;
}

function changeVolume(message, requestedVolume, voiceConnection) {
    logger.info("Change the volume.");
    if (!requestedVolume) {
        message.reply("Volume is currently at " + streamVolume * 100 + "%");
        return;
    }

    var requester = message.member;
    
    //Not a number
    if (isNaN(requestedVolume)) return;

    var actualVolume = requestedVolume / 100;
    if (actualVolume > 1) {
        actualVolume = 1;
    }

    message.reply("Changing volume from " + (streamVolume * 100) + "% to " + requestedVolume + "%")
    streamVolume = actualVolume;

    if (voiceConnection) {
        currentVoiceConnection.player.dispatcher.setVolumeLogarithmic(streamVolume);
    }
}

module.exports.streamAudio = streamAudio;
module.exports.changeVolume = changeVolume;