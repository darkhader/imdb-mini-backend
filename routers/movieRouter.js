const express = require('express');
const MovieRouter = express.Router();
const MovieModel = require('../models/movieModel');
const ActorModel = require('../models/actorModel');
var request = require('request');
// Middleware
var mongoose = require('mongoose');
const userModel = require('../models/userModel');


MovieRouter.get("/", async (req, res) => {
	var perPage = 8
	var page = req.query.page || 1;
	var sort = req.query.sort || 1;
	try {
		if (sort == 1) {
			const movies = await MovieModel.find({ "title": { $ne: "" } })
				.skip(perPage * (page - 1))
				.limit(perPage).sort([['title', 1]]);

			const total = await MovieModel.count({ "title": { $ne: "" } });
			res.json({ success: 1, movies, total });
		} else if (sort == 2) {
			const movies = await MovieModel.find({ "title": { $ne: "" } })
				.skip(perPage * (page - 1))
				.limit(perPage).sort([['year', 1]]);


			const total = await MovieModel.count({ "title": { $ne: "" } });
			res.json({ success: 1, movies, total });
		} else if (sort == 3) {
			const movies = await MovieModel.find({ "title": { $ne: "" } })
				.skip(perPage * (page - 1))
				.limit(perPage).sort([["luotlike", -1]]);


			const total = await MovieModel.count({ "title": { $ne: "" } });
			res.json({ success: 1, movies, total });
		} else if (sort == 4) {
			const movies = await MovieModel.find({ "title": { $ne: "" } })
				.skip(perPage * (page - 1))
				.limit(perPage).sort({ date: -1 });


			const total = await MovieModel.count({ "title": { $ne: "" } });
			res.json({ success: 1, movies, total });
		}
	} catch (error) {
		res.status(500).json({ success: 0, error: error })
	}

});

// get user by id
MovieRouter.get("/:id", async (req, res) => {
	let movieId = req.params.id;
	let movieRecommend1, movieRecommend2;
	try {
		let movieRe = [];

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
			else {
				let movieRe = movieFound.movieLike.filter((item, index, self) =>
					index === self.findIndex((itm) => (
						itm === item
					))
				)
				const shuffled = movieRe.sort(() => 0.5 - Math.random());

				// Get sub-array of first n elements after shuffled
				movieRecommend1 = await MovieModel.find({ "title": { $in: shuffled } }).skip(0)
					.limit(3).sort({ date: -1 })
				let title = `${movieFound.title}(${movieFound.year})`
				if (movieFound.year === null || movieFound.year === '') {

					title = `${movieFound.title}`
				}
				var options = {

					'method': 'POST',
					'url': 'http://ai.imdb-mini.xyz',
					'headers': {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						"title": title
					})

				};
				request(options, async function (error, response) {
					if (error || response.statusCode !== 200) {
						res.json({ success: 1, movie: movieFound, movieRecommend: movieRecommend1 });
					}
					else {
						if (response.body !== "[]") {
							movieRecommend2 = await MovieModel.find({ "title": { $in: JSON.parse(response.body) } }).skip(0)
							.limit(3).sort({ date: -1 })
							
							res.json({ success: 1, movie: movieFound, movieRecommend: movieRecommend2.concat(movieRecommend1) });
						}
						else {
							res.json({ success: 1, movie: movieFound, movieRecommend: movieRecommend1 });
						}

					}
				});
			}
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
	const { actor, like, luotlike, review, listmovie } = req.body;
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
				const [userFound, movieFound] = await Promise.all([
					userModel.findByIdAndUpdate(like, { $push: { movieLike: movieFound1.title } }),
					MovieModel.findByIdAndUpdate(movieId, { $push: { like: like, movieLike: listmovie } })
				]);
				const [movieUpdated, userUpdated] = await Promise.all([
					movieFound.save(),
					userFound.save()
				]);
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