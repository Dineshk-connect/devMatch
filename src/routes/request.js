const express = require("express");

const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/ConnectionRequest");
const User = require("../models/user");

requestRouter.post(
  "/request/send/:status/:toUserdId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserdId;
      const status = req.params.status;

      const allowedStatus = ["intrested", "ignored"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).send("ERROR: Invalid status");
      }

      const toUser= await User.findById(toUserId);
      if(!toUser){
        return res.status(404).send("ERROR: The user you are trying to connect with does not exist");
      }

  
      // Check if a request already exists between the two users
      const existingRequest = await ConnectionRequest.findOne({
        $or:[
          {fromUserId, toUserId},
          {fromUserId:toUserId, toUserId:fromUserId}
        ],
      });

      if(existingRequest){
        return res.status(400).send("ERROR: A connection request already exists between these users");
      }

      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();
      res.json({ message: req.user.firstName +" is"+ status + " in " +toUser.firstName, data });
    } catch (err) {
      res.status(400).send("ERROR:" + err.message);
    }
  }
);

module.exports = requestRouter;
