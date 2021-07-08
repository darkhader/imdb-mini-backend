const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	hashPassword: { type: String, required: true },
	avatar: { type: String },
	intro: { type: String },
	like: [{ type: Schema.Types.ObjectId, ref: "movie"}],
	movieLike: [{ type: String}],
	review: [{ type: Schema.Types.ObjectId, ref: "review"}]

});
UserSchema.pre("save", function () {
	console.log(this);
	next();

})
module.exports = mongoose.model("User", UserSchema);