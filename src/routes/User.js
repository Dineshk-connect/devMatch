const express = require("express"); 
const userRouter=express.Router();  
const User = require("../models/user");

userRouter.get("/user", async (req, res) => {
  const useremail = req.body.email;

  try {
    const user = await User.find({ email: useremail });
    if (user.length === 0) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(500).send("Error fetching user");
  }
});

userRouter.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

module.exports = userRouter;