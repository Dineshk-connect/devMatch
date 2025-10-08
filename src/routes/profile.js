const express = require("express");
const profileRouter = express.Router();
const {userAuth}=require("../middlewares/auth");
const {validateEditProfileData}=require("../utils/validation");


profileRouter.get("/profile",userAuth, async (req, res) => {
  try {
    const user=req.user; 

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {

    if(!validateEditProfileData(req)){

      throw new Error("Invalid Edit Request");

    }
    const LoggedInUser=req.user;

    Object.keys(req.body).forEach((key)=>(LoggedInUser[key]=req.body[key]));

   await LoggedInUser.save();
      console.log(LoggedInUser);

      res.json({message: `${LoggedInUser.firstName}, your profile updated successfully`,data:LoggedInUser,});
  }catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = profileRouter;