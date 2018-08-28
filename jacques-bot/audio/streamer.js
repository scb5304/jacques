const logger = require("../../jacques-common/util/logger.js");
const ytdl = require("ytdl-core");

function streamAudio(voiceChannel, volume, streamLink) {
    if (!streamLink) {
        logger.info("Stream requested with no link.");
        return;
    }

    ytdl.getBasicInfo(streamLink, function(err, info) {
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
                           passes: 3
                       };

                       const ytdlStream = ytdl(streamLink, {
                           filter: "audioonly"
                       });

                       const dispatcher = connection.playStream(ytdlStream, streamOptions);
                       dispatcher.once("end", function(reason) {
                           logger.info("Leaving stream on 'end' event. " + (reason ? reason : ""));
                           connection.disconnect();
                       });

                       dispatcher.once("speaking", function() {
                           dispatcher.setVolumeLogarithmic(volume);
                       });

                       dispatcher.once("error", function(err) {
                           logger.error("Leaving stream on 'error' event: " + err);
                           connection.disconnect();
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
    let secondsToSeek = 0;
    let timeArg = streamLink.split("t=");
    if (!timeArg || timeArg.length === 1) {
        return secondsToSeek;
    }
    timeArg = streamLink.split("t=")[1].split("&")[0]; // 3m4s

    const hourArgMatches = /.+?(?=h)/.exec(timeArg);
    if (hourArgMatches) {
        const hourArg = hourArgMatches[0];
        secondsToSeek += Number(hourArg) * 3600;
        timeArg = timeArg.split(hourArg + "h")[1];
    }

    const minuteArgMatches = /.+?(?=m)/.exec(timeArg);
    if (minuteArgMatches) {
        const minuteArg = minuteArgMatches[0];
        secondsToSeek += Number(minuteArg) * 60;
        timeArg = timeArg.split(minuteArg + "m")[1];
    }

    const secondArgMatches = /.+?(?=s)/.exec(timeArg);
    if (secondArgMatches) {
        const secondArg = secondArgMatches[0];
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

    let actualVolume = requestedVolume / 100;
    if (actualVolume > 1) {
        actualVolume = 1;
    }

    if (voiceConnection) {
        voiceConnection.player.dispatcher.setVolumeLogarithmic(actualVolume);
    }

    return actualVolume;
}

module.exports.streamAudio = streamAudio;
module.exports.changeVolume = changeVolume;