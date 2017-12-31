var logger = require("./../common/util/logger.js");
var ytdl = require("ytdl-core");

function streamAudio(voiceChannel, volume, streamLink) {
    if (!streamLink) {
        logger.info("Stream requested with no link.");
        return;
    }

    ytdl.getInfo(streamLink, function(err, info) {
       if (err || !info) {
           logger.error(err);
       } else {
           //Video exists
           voiceChannel.join()
               .then(function(connection) {
                   try {
                       const streamOptions = {
                           seek: calculateStreamSeekSeconds(streamLink),
                           volume: volume,
                           passes: 6
                       };

                       const ytdlStream = ytdl(streamLink, {
                           filter: "audioonly"
                       });

                       const dispatcher = connection.playStream(ytdlStream, streamOptions);
                       dispatcher.once("end", function() {
                           logger.info("Leaving after playing sound.");
                           connection.disconnect();
                       });

                       dispatcher.once("speaking", function() {
                           dispatcher.setVolumeLogarithmic(volume);
                       });

                   } catch (e) {
                       logger.error(e);
                   }
               })
               .catch(logger.error);
       }
    });
}

function calculateStreamSeekSeconds(streamLink) {
    var secondsToSeek = 0;
    var timeArg = streamLink.split("t=");
    if (!timeArg || timeArg.length === 1) {
        return secondsToSeek;
    }
    timeArg = streamLink.split("t=")[1].split("&")[0]; // 3m4s

    var hourArgMatches = /.+?(?=h)/.exec(timeArg);
    if (hourArgMatches) {
        var hourArg = hourArgMatches[0];
        secondsToSeek += Number(hourArg) * 3600;
        timeArg = timeArg.split(hourArg + "h")[1];
    }

    var minuteArgMatches = /.+?(?=m)/.exec(timeArg);
    if (minuteArgMatches) {
        var minuteArg = minuteArgMatches[0];
        secondsToSeek += Number(minuteArg) * 60;
        timeArg = timeArg.split(minuteArg + "m")[1];
    }

    var secondArgMatches = /.+?(?=s)/.exec(timeArg);
    if (secondArgMatches) {
        var secondArg = secondArgMatches[0];
        secondsToSeek += Number(secondArg);
    }

    if (secondsToSeek) {
        logger.info("URL wants to start at a given time: " + secondsToSeek);
    }
    return secondsToSeek;
}

function changeVolume(message, requestedVolume, voiceConnection) {
    //Not a number
    if (isNaN(requestedVolume)) {
        logger.error("Not a number: " + requestedVolume);
        return;
    }

    var actualVolume = requestedVolume / 100;
    if (actualVolume > 1) {
        actualVolume = 1;
    }

    message.reply("Changing volume to " + requestedVolume + "%");

    if (voiceConnection) {
        voiceConnection.player.dispatcher.setVolumeLogarithmic(actualVolume);
    }

    return actualVolume;
}

module.exports.streamAudio = streamAudio;
module.exports.changeVolume = changeVolume;