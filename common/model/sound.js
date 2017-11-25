var mongoose = require("mongoose");
var sanitizerPlugin = require("mongoose-sanitizer");
var Schema = mongoose.Schema;

var soundEventSchema = new Schema({
	category: String,
	date: Date,
	performed_by: String
});
soundEventSchema.plugin(sanitizerPlugin);

var soundSchema = new Schema({
	name: String,
	tags: [String],
	add_date: Date,
	added_by: String,
	sound_events: [soundEventSchema]
});
soundSchema.plugin(sanitizerPlugin);

var Sound = mongoose.model("Sound", soundSchema);
var SoundEvent = mongoose.model("SoundEvent", soundEventSchema);

module.exports.Sound = Sound;
module.exports.SoundEvent = SoundEvent;