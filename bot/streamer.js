var Db = require('./../common/data/db');
var logger = require('./../common/util/logger.js');
var ytdl = require('ytdl-core');

var streamVolume = 0.40;

function streamAudio(voiceChannel, streamLink) {
    if (!streamLink) {
        logger.info("Stream requested with no link.");
        return;
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

            stream.on('info', function(info) {
                var streamLength = Number(info.length_seconds) * 1000;
                setTimeout(function() {
                    console.log("We're done here, disconnect!");
                    connection.disconnect();
                }, streamLength);
            })

            const dispatcher = connection.playStream(stream, streamOptions);
            dispatcher.once('speaking', function() {
                dispatcher.setVolumeLogarithmic(streamVolume);
            })
        })
        .catch(logger.error);
}

function calculateStreamSeekSeconds(streamLink) {
    var secondsToSeek = 0;

    var timeArg = streamLink.split("t=")[1]; // 3m4s
    if (!timeArg) {
        return secondsToSeek;
    }

    if (timeArg.includes("m")) {
        var mins = timeArg.split("m")[0];
        secondsToSeek += Number(mins) * 60;

        if (timeArg.includes("s")) {
            var secs = timeArg.split("m")[1].split("s")[0];
            logger.info("secs after: " + secs);
            secondsToSeek += Number(secs);
        }
    } else if (timeArg.includes("s")) {
        var secs = timeArg.split("s")[0];
        secondsToSeek += Number(secs);
    } else {
        secondsToSeek = Number(timeArg);
    }
    if (secondsToSeek) {
        logger.info("URL wants to start at a given time: " + secondsToSeek);
    }
    return secondsToSeek;
}

function changeVolume(message, requestedVolume, voiceConnection) {
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
        voiceConnection.player.dispatcher.setVolumeLogarithmic(streamVolume);
    }
}

function getVolume() {
    return streamVolume; 
}

module.exports.streamAudio = streamAudio;
module.exports.calculateStreamSeekSeconds = calculateStreamSeekSeconds;
module.exports.changeVolume = changeVolume;
module.exports.getVolume = getVolume;