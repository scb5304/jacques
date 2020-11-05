const logger = require("../../jacques-common/util/logger.js");
const ytdl = require("ytdl-core");

function streamAudio(voiceChannel, volume, streamLink) {
    if (!streamLink) {
        logger.info("Stream requested with no link.");
        return;
    }

    ytdl.getBasicInfo(streamLink).then(function(info) {
        logger.info(info)
        if (!info) {
           logger.error("No info returned");
        } else {
           //Video exists
           voiceChannel.join()
               .then(function (connection) {
                   try {
                       const streamOptions = {
                           seek: calculateStreamSeekSeconds(streamLink),
                           volume: volume
                       };
                       const ytdlStream = ytdl(streamLink, {filter: "audioonly", begin: calculateStreamSeekSeconds(streamLink) + "s"});

                       const dispatcher = connection.play(ytdlStream, streamOptions);

                       dispatcher.once("start", function() {
                           dispatcher.setVolumeLogarithmic(volume);
                       });

                       dispatcher.on("speaking", function (speaking) {
                           if (!speaking) {
                               logger.info("Leaving stream on 'speaking' event not true");
                               connection.disconnect();
                           }
                       });

                       dispatcher.once("error", function (err) {
                           logger.error("Leaving stream on 'error' event: " + err);
                           connection.disconnect();
                       });

                   } catch (e) {
                       logger.error(e);
                   }
               })
               .catch(logger.error);
       }
    }).catch(function(err) {
       logger.error("Could not get ytdl basic info: " + err);
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