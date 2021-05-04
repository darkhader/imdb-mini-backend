const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
	movie: { type:Schema.Types.ObjectId, ref: "movie" },
	actor: { type:Schema.Types.ObjectId, ref: "actor" },
	content:{type:String},
	user: {type: Schema.Types.ObjectId, ref: "User"},
	username:{type:String},
	actorname:{type:String},
	movietitle:{type:String}
},
{
    timestamps:true
});
module.exports = mongoose.model("review", reviewSchema);