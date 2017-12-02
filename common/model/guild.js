var mongoose = require("mongoose");
var sanitizerPlugin = require("mongoose-sanitizer");
var Schema = mongoose.Schema;

var guildSchema = new Schema({
    discord_id: String,
    discord_name: String
});
guildSchema.plugin(sanitizerPlugin);

var Guild = mongoose.model("Guild", guildSchema);
module.exports.Guild = Guild;