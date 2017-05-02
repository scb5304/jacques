/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function secondsFromTimeArg(timeArg) {
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
    return secondsToSeek;
}

module.exports.getRandomInt = getRandomInt;
