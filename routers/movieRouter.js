const express = require('express');
const MovieRouter = express.Router();
const MovieModel = require('../models/movieModel');
const ActorModel = require('../models/actorModel');
// Middleware
var mongoose = require('mongoose');



MovieRouter.get("/", async (req, res) => {
	console.log("Get all movies");
	var perPage = 8
	var page = req.query.page || 1;
	var sort = req.query.sort || 1;
	try {

		if (sort == 1) {
			const movies = await MovieModel.find({ "title" : { $ne : "" }})
				.skip(perPage * (page - 1))
				.limit(perPage).sort([['title', 1]]);

			const total = await MovieModel.count({ "title" : { $ne : "" }});
			res.json({ success: 1, movies, total });
		} else if (sort == 2) {
			const movies = await MovieModel.find({ "title" : { $ne : "" }})
				.skip(perPage * (page - 1))
				.limit(perPage).sort([['year', 1]]);


			const total = await MovieModel.count({ "title" : { $ne : "" }});
			res.json({ success: 1, movies, total });
		} else if (sort == 3) {
			const movies = await MovieModel.find({ "title" : { $ne : "" }})
				.skip(perPage * (page - 1))
				.limit(perPage).sort([["luotlike", -1]]);


			const total = await MovieModel.count({ "title" : { $ne : "" }});
			res.json({ success: 1, movies, total });
		} else if (sort == 4) {
			const movies = await MovieModel.find({ "title" : { $ne : "" }})
				.skip(perPage * (page - 1))
				.limit(perPage).sort({ date: -1 });


			const total = await MovieModel.count({ "title" : { $ne : "" }});
			res.json({ success: 1, movies, total });
		}
	} catch (error) {
		res.status(500).json({ success: 0, error: error })
	}

});

// get user by id
MovieRouter.get("/:id", async (req, res) => {
	let movieId = req.params.id;
	try {
		if (mongoose.Types.ObjectId.isValid(movieId)) {
			const movieFound = await MovieModel.findById(movieId)
				.populate("actor", "name image")
				.populate("User", "name")
				.populate({
					path: "review",
					select: "content user",
					populate: {
						path: "user",
						model: "User"
					}
				});
			if (!movieFound) res.status(404).json({ success: 0, message: "Not found!" })
			else res.json({ success: 1, movie: movieFound });
		}

	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});


MovieRouter.use((req, res, next) => {
	const { userFound } = req.session;

	if (userFound && userFound.role >= 1) {


		next();


	} else res.status(401).json({ success: 0, message: userFound });
})
// Create user

MovieRouter.post("/", async (req, res) => {

	const { title, description, image, duration, year, review, actor, luotlike } = req.body;
	try {
		const movieCreated = await MovieModel.create({ title, description, image, duration, year, review, actor, luotlike });
		res.status(201).json({ success: 1, movie: movieCreated, movieId: movieCreated._id });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}

});
// Edit user
MovieRouter.put("/:id", async (req, res) => {
	const movieId = req.params.id;
	const { actor, like, luotlike, review } = req.body;
	const movieFound1 = await MovieModel.findById(movieId);
	const m = 0;
	const n = 0;
	try {
		if (actor) {
			if (movieFound1.actor.length > 0) {
				for (let i = 0; i < movieFound1.actor.length; i++) {
					if (actor == movieFound1.actor[i]) {
						m = 1;
					}
				}
			} else if (m == 0) {
				const movieFound = await MovieModel.findByIdAndUpdate(movieId, { $push: { actor: actor } })
				let movieUpdated = await movieFound.save();
				res.json({ success: 1, user: movieUpdated });
			}

		}
		if (like) {
			for (let i = 0; i < movieFound1.like.length; i++) {

				if (like == movieFound1.like[i]) {

					n = 1;

				}

			}
			if (n == 0) {
				const movieFound = await MovieModel.findByIdAndUpdate(movieId, { $push: { like: like } })
				let movieUpdated = await movieFound.save();
				res.json({ success: 1, user: movieUpdated });
			}

		}
		if (luotlike) {
			const movieFound = await MovieModel.findByIdAndUpdate(movieId, { luotlike })
			let movieUpdated = await movieFound.save();
			res.json({ success: 1, user: movieUpdated });
		}
		if (review) {
			const movieFound = await MovieModel.findByIdAndUpdate(movieId, { $push: { review: review } })
			let movieUpdated = await movieFound.save();
			res.json({ success: 1, user: movieUpdated });
		}




	} catch (error) {
		res.status(500).json({ success: 0, messageloi: error })
	}
});





MovieRouter.delete("/:id", (req, res) => {
	const movieId = req.params.id;
	MovieRouter.remove({ _id: movieId }, (err) => {
		if (err) res.status(500).json({ success: 0, message: err })
		else res.json({ success: 1 });
	});
});

module.exports = MovieRouter;