const express = require('express');
const ActorRouter = express.Router();
const ActorModel = require('../models/actorModel');

// Middleware


// ActorRouter.use((req, res, next) => {
// 	const { ActorInfo } = req.session;
// 	if (ActorInfo && ActorInfo.role >= 1) {
// 		next();
// 	} else res.status(404).json({ success: 0, message: "access deni" });
// })
// "/api/users" => get all
ActorRouter.get("/", async (req, res) => {

	var perPage = 8
	var page = req.query.page || 1;
	var sort = req.query.sort || 1;



	try {
		if (!req.query.page && !req.query.sort) {
			const actors = await ActorModel.find({})
			res.json({ success: 1, actors });
		} else if (sort == 1) {
			const actors = await ActorModel.find({})
				.skip(perPage * (page - 1))
				.limit(perPage).sort([['name', 1]]);


			const total = await ActorModel.count({});
			res.json({ success: 1, actors, total });
		} else if (sort == 2) {
			const actors = await ActorModel.find({})
				.skip(perPage * (page - 1))
				.limit(perPage).sort([['dob', -1]]);


			const total = await ActorModel.count({});
			res.json({ success: 1, actors, total });
		} else if (sort == 3) {
			const actors = await ActorModel.find({})
				.skip(perPage * (page - 1))
				.limit(perPage).sort([["luotlike", -1]]);


			const total = await ActorModel.count({});
			res.json({ success: 1, actors, total });
		} else if (sort == 4) {
			const actors = await ActorModel.find({})
				.skip(perPage * (page - 1))
				.limit(perPage).sort({ date: -1 });


			const total = await ActorModel.count({});
			res.json({ success: 1, actors, total });
		}
	} catch (error) {
		res.status(500).json({ success: 0, error: error })
	}

});

// get user by id
ActorRouter.get("/:id", async (req, res) => {
	let actorId = req.params.id;
	try {
		const actorFound = await ActorModel.findById(actorId)
			.populate("User", "name")
			.populate("movie", "name image")
			.populate({
				path: "review",
				select: "content user",
				populate: {
					path: "user",
					model: "User"
				}
			});
		if (!actorFound) res.status(404).json({ success: 0, message: "Not found!" })
		else res.json({ success: 1, actor: actorFound });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});



ActorRouter.use((req, res, next) => {
	const { userFound } = req.session;
	console.log("req1", req.session);
	if (userFound && userFound.role >= 1) {


		next();


	} else res.status(401).json({ success: 0, message: userFound });
})
// Create user
ActorRouter.post("/", async (req, res) => {

	const { name, dob, image, nationality, review, movie } = req.body;
	try {
		const actorCreated = await ActorModel.create({ name, dob, image, nationality, review, movie });
		res.status(201).json({ success: 1, actor: actorCreated, actorId: actorCreated._id });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}

});

// Edit user
ActorRouter.put("/:id", async (req, res) => {
	const actorId = req.params.id;

	const { movie, like, luotlike, review } = req.body;


	try {
		if (movie) {
			const actorFound = await ActorModel.findByIdAndUpdate(actorId, { $push: { movie: movie } })
			let actorUpDated = await actorFound.save();
			res.json({ success: 1, actor: actorUpDated });
		}
		if (like) {
			const actorFound = await ActorModel.findByIdAndUpdate(actorId, { $push: { like: like } })
			let actorUpDated = await actorFound.save();
			res.json({ success: 1, actor: actorUpDated });
		}
		if (luotlike) {
			const actorFound = await ActorModel.findByIdAndUpdate(actorId, { luotlike })
			let actorUpDated = await actorFound.save();
			res.json({ success: 1, actor: actorUpDated });
		}
		if (review) {
			const actorFound = await ActorModel.findByIdAndUpdate(actorId, { $push: { review: review } })
			let actorUpDated = await actorFound.save();
			res.json({ success: 1, actor: actorUpDated });
		}

	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

// Delete user => BTVN
ActorRouter.delete("/:id", async (req, res) => {
	const actorId = req.params.id;
	try {
		ActorModel.remove({ _id: actorId });
		res.json({ success: 1 });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

module.exports = ActorRouter;