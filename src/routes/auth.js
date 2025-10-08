const express = require("express");
const User = require("../models/user");
const { validatesignupdata } = require("../utils/validation");
const bcrypt = require("bcrypt");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    //validate data
    validatesignupdata(req);

    const { firstName, lastName, email, password } = req.body;

    //Encyrpt the password

    const passwordhash = await bcrypt.hash(password, 10);
    // Creating new instance of User model
    const user = new User({
      firstName,
      lastName,
      email,
      password: passwordhash,
    });

    await user.save();
    res.send("User added up successfully");
  } catch (err) {
    //console.log(err);
    res.status(400).send("ERROR:" + err.message);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordvalid = await user.validatePassword(password);

    if (isPasswordvalid) {
      // Create a JWT Token

      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token, {
        expires: new Date(Date.now() + 8 * 3600000),
        httpOnly: true,
        sameSite: "strict",
      });

      res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});


authRouter.post("/logout", (req, res) => {
  res.cookie("token", null,{
    expires: new Date(Date.now()),
  });
  res.send("Logged out successfully");
  });


module.exports = authRouter;
