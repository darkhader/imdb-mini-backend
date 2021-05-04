const express = require('express');
const UserRouter = express.Router();

const UserModel = require('../models/userModel');
const bcrypt = require('bcrypt-nodejs')

// Middleware
UserRouter.use((req, res, next) => {
	console.log("User middleware");
	next();
});
UserRouter.post("/", async (req, res) => {
	console.log(req.body)
	const { name, email, password, avatar, intro } = req.body;
	const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync())
	try {
		const userCreated = await UserModel.create({ name, email, hashPassword, avatar, intro });
		res.status(201).json({ success: 1, user: userCreated });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}

});


// UserRouter.use((req,res,next)=> {
// 	const{userInfo}=req.session;
// 	if(userInfo && userInfo.role >=1){
// 		next();
// 	} else res.status(404).json({ success: 0, message: "Ko du tuoi" });
// })



// "/api/users" => get all
UserRouter.get("/", async (req, res) => {
	console.log("Get all user");
	try {
		const users = await UserModel.find({}, "name email avatar intro posts password hashPassword").populate("posts");
		res.json({ success: 1, users });
	} catch (error) {
		res.status(500).json({ success: 0, error: error })
	}

});

// get user by id
UserRouter.get("/:id", async (req, res) => {
	let userId = req.params.id;
	try {
		const userFound = await UserModel.findById(userId);
		if (!userFound) res.status(404).json({ success: 0, message: "Not found!" })
		else res.json({ success: 1, user: userFound });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

// Create user


// Edit user
UserRouter.put("/:id", async (req, res) => {
	const userId = req.params.id;
	const { name, password, avatar, intro, posts } = req.body;

	try {
		const userFound = await UserModel.findById(userId);
		if (!userFound) {
			res.status(404).json({ success: 0, message: "Not found!" });
		} else {
			for (key in { name, password, avatar, intro, posts }) {
				if (userFound["hashPassword"] && req.body["password"]) {
					const plainPassword = req.body["password"];
					const hashPassword = userFound["hashPassword"];
					if (!bcrypt.compareSync(plainPassword, hashPassword)) {
						userFound["hashPassword"] = bcrypt.hashSync(plainPassword, bcrypt.genSaltSync())
					}
				}
				else if (userFound[key] && req.body[key]) userFound[key] = req.body[key];
			}
			let userUpdated = await userFound.save();
			res.json({ success: 1, user: userUpdated });
		}
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

// Delete user => BTVN
UserRouter.delete("/:id", async (req, res) => {
	const userId = req.params.id;
	try {
		UserModel.remove({ _id: userId });
		res.json({ success: 1 });
	} catch (error) {
		res.status(500).json({ success: 0, message: error })
	}
});

module.exports = UserRouter;