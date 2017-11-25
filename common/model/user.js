var mongoose = require("mongoose");
var sanitizerPlugin = require("mongoose-sanitizer");
var Schema = mongoose.Schema;

var userSchema = new Schema({
    discord_id: String,
    discord_username: String,
    discord_last_guild_id: String,
    birdfeed_token: String,
    birdfeed_date_time: Date
});
userSchema.plugin(sanitizerPlugin);

var User = mongoose.model("User", userSchema);
module.exports.User = User;