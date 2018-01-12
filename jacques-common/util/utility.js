/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 * Using Math.round() will give you a non-uniform distribution!
 */
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//https://medium.com/@tkssharma/objects-in-javascript-object-assign-deep-copy-64106c9aefab
function cloneObject(obj) {
    var clone = {};
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (obj[property] != null && typeof(obj[property]) === "object") {
                clone[property] = cloneObject(obj[property]);
            } else {
                clone[property] = obj[property];
            }
        }
    }
    return clone;
}

module.exports.getRandomInt = getRandomInt;
module.exports.cloneObject = cloneObject;
