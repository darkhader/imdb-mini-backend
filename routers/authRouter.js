const express = require('express');
const bcrypt = require('bcrypt-nodejs');
const AuthRouter = express.Router();

const UserModel = require('../models/userModel');
AuthRouter.get("/", (req, res) => {
	const { userFound } = req.session || {};
	if (userFound) {
		res.json({ success: 1, userFound, message: "Login successful" });
	} else {
		res.status(401).json({ success: 0 });
	}
})
AuthRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;
	try {
		let userFound = await UserModel.findOne({ email });
        console.log(userFound)
		if(!userFound || !userFound._id) {
			res.status(404).json({ success: 0, message: "No such user" });
		} else {
			if(!bcrypt.compareSync(password, userFound.hashPassword)) {
				res.status(401).json({ success: 0, message: "Wrong password" });
			} else {
				req.session.userFound = {
					id: userFound._id,
					name: userFound.name,
                    email: userFound.email,
                    role:1
				}
				res.json({ success: 1,userFound, message: "Login successful"});
			}
		}
	} catch (error) {
		res.status(500).json({ success: 0, error })
	}
});
AuthRouter.delete("/logout",(req, res) => {
    
    req.session.userInfo=undefined;
    req.session.destroy();
    res.json({success:1, message:"cut"})
} )
module.exports = AuthRouter;