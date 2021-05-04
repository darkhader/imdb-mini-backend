const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const movieSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String},
	image: { type: String, },
	duration: { type: String  },
	year: {type: String},
	luotlike: {type: String, default:0},
	date: {
		type: Date,
		default: Date.now
	},
    like:[{type: Schema.Types.ObjectId, ref: "User"}],
    review: [{type: Schema.Types.ObjectId, ref: "review"}],
    actor: [{type: Schema.Types.ObjectId, ref: "actor"}]
});

module.exports = mongoose.model("movie", movieSchema);