var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    discord_id: String,
    discord_username: String,
    birdfeed_token: String,
    birdfeed_date_time: Date
});

var User = mongoose.model("User", userSchema);
module.exports.User = User;