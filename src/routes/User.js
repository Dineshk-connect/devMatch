const express = require("express");
const userRouter = express.Router();
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { connection, set } = require("mongoose");
const ConnectionRequest = require("../models/ConnectionRequest");

const USER_SAFE_DATA = "firstName lastName email photoUrl about skills";

userRouter.get("/user/requests/recieved", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;

    const connectionRequest = await ConnectionRequest.find({
      toUserId: LoggedInUser._id,
      status: "interested",
    }).populate("fromUserId", [
      "firstName",
      "lastName",
      "photoUrl",
      "about",
      "skills",
    ]);

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

    const connectionRequest = await ConnectionRequest.find({
      $or: [
        { toUserId: LoggedInUser._id, status: "accepted" },
        { fromUserId: LoggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    const data = connectionRequest.map((row) => {
      if (row.fromUserId._id.toString() == LoggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });
    res.json({ data });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

// Get a specific user's profile (by ID) with connection status
userRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const { id: targetUserId } = req.params;
    const currentUserId = req.user._id.toString();

    // Fetch the target user info (exclude password)
    const user = await User.findById(targetUserId).select(USER_SAFE_DATA + " about");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if there's an existing connection or request
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: currentUserId, toUserId: targetUserId },
        { fromUserId: targetUserId, toUserId: currentUserId },
      ],
    });

    let connectionStatus = "not_connected"; // default

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        connectionStatus = "connected";
      } else {
        connectionStatus = "pending"; // 'interested' or other pending status
      }
    }

    return res.status(200).json({
      success: true,
      user,
      connectionStatus,
    });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching user profile",
    });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;

    const skip = (page - 1) * limit;

    // Get all existing connection requests for the logged-in user
    const existingConnections = await ConnectionRequest.find({
      $or: [
        { fromUserId: LoggedInUser._id },
        { toUserId: LoggedInUser._id },
      ],
    }).select("fromUserId toUserId");

    const excludedUserIds = new Set();
    existingConnections.forEach((request) => {
      excludedUserIds.add(request.fromUserId.toString());
      excludedUserIds.add(request.toUserId.toString());
    });

    // Also exclude the logged-in user themselves
    excludedUserIds.add(LoggedInUser._id.toString());

    const users = await User.find({
      _id: { $nin: [...excludedUserIds] },
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = userRouter;
