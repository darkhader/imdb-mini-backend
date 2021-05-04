const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActorSchema = new Schema({
	name: { type: String, required: true },
	dob: { type: String},
	image: { type: String, },
	nationality: { type: String  },
	luotlike: {type: Number},
	date: {
		type: Date,
		default: Date.now
	},
	review: [{type: Schema.Types.ObjectId, ref: "review"}],
	like:[{type: Schema.Types.ObjectId, ref: "User"}],
	movie:[{type: Schema.Types.ObjectId, ref: "movie"}],
	
});

module.exports = mongoose.model("actor", ActorSchema);