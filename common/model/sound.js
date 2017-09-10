var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var soundEventSchema = new Schema({
	category: String,
	date: Date,
	performed_by: String
});

var soundSchema = new Schema({
	name: String,
	category: String,
	tags: [String],
	add_date: Date,
	added_by: String,
	sound_events: [soundEventSchema]
});

var Sound = mongoose.model("Sound", soundSchema);
var SoundEvent = mongoose.model("SoundEvent", soundEventSchema);

module.exports.Sound = Sound;
module.exports.SoundEvent = SoundEvent;