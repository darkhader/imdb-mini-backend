const express = require('express');
const ReviewRouter = express.Router();
const ReviewModel = require('../models/reviewModel');
const MovieModel = require('../models/movieModel');
const UserModel = require('../models/userModel')
const ActorModel = require('../models/actorModel');
ReviewRouter.get("/", async (req, res) => {
	console.log();
	
	try {
		const reviews = await ReviewModel.find({}).sort([['createdAt', -1]]);
		res.json({ success: 1, reviews });
	} catch (error) {
		res.status(500).json({ success: 0, error: error })
	}

});

// get user by id
ReviewRouter.get("/:id", async (req, res) => {
	let reviewId = req.params.id;
	try {
		const reviewFound = await reviewModel.findById(reviewId);
		if (!reviewFound) res.status(404).json({ success: 0, message: "Not found!" })
		else res.json({ success: 1, review: reviewFound });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

ReviewRouter.post("/", async (req, res) => {
	

	const { content , movie, user,actor, username,actorname,movietitle} = req.body;
	console.log(content, actor)
	
	try {
		if(movie){
			const reviewCreated = await ReviewModel.create({content, movie, user,  username,actorname,movietitle });
			await MovieModel.findByIdAndUpdate(movie, {$push: {review: reviewCreated._id }})
			await UserModel.findByIdAndUpdate(user, {$set: {user: reviewCreated._id }})
			res.status(201).json({ success: 1, review: reviewCreated, reviewId:reviewCreated._id  });
		}
		if(actor){
			const reviewCreated = await ReviewModel.create({content, actor, user,  username,actorname,movietitle});
			await ActorModel.findByIdAndUpdate(actor, {$push: {review: reviewCreated._id }})
			await UserModel.findByIdAndUpdate(user, {$set: {user: reviewCreated._id }})
			res.status(201).json({ success: 1, review: reviewCreated, reviewId:reviewCreated._id  });
		}
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}

});

ReviewRouter.put("/:id", async (req, res) => {
	const citizenId = req.params.id;
	const { name, password, dob, address, job } = req.body;

	try {
		const citizenFound = await ReviewModel.findById(citizenId);
		if (!citizenFound) {
			res.status(404).json({ success: 0, message: "Not found!" });
		} else {
			for (key in { name, password, dob, address, job }) {
				if (citizenFound["hashPassword"] && req.body["password"]) {
					const plainPassword = req.body["password"];
					const hashPassword = citizenFound["hashPassword"];
					if (!bcrypt.compareSync(plainPassword, hashPassword)) {
						citizenFound["hashPassword"] = bcrypt.hashSync(plainPassword, bcrypt.genSaltSync())
					}
				}
				if (citizenFound[key] && req.body[key]) citizenFound[key] = req.body[key];
			}
			let citizenUpdated = await citizenFound.save();
			res.json({ success: 1, user: citizenUpdated });
		}
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

// Delete user => BTVN
ReviewRouter.delete("/:id", async (req, res) => {
	const citizenId = req.params.id;
	try {
		ReviewModel.remove({ _id: citizenId });
		res.json({ success: 1 });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

module.exports = ReviewRouter;