const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { connection } = require("mongoose");
const ConnectionRequest = require("../models/ConnectionRequest");

const USER_SAFE_DATA= "firstName lastName email photoUrl about skills";

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;

    const connectionRequest=await ConnectionRequest.find({
      toUserId:LoggedInUser._id,
      status:"interested",
    }).populate("fromUserId", ["firstName", "lastName","photoUrl", "about", "skills"]);

    res.json({
      message: "Data fetched successfully",
      data: connectionRequest,
    });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});


userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;

    const connectionRequest= await ConnectionRequest.find({
      $or:[
        {toUserId:LoggedInUser._id, status:"accepted"},
        {fromUserId:LoggedInUser._id, status:"accepted"},
      ],
    }).populate("fromUserId", USER_SAFE_DATA)
    .populate("toUserId", USER_SAFE_DATA);

const data = connectionRequest.map((row)=>{
  if(row.fromUserId._id.toString() == LoggedInUser._id.toString()){
    return row.toUserId;
  }
  return row.fromUserId;
});
res.json({data});

  }catch (err) {  
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = userRouter;
