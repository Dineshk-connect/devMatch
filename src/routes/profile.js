const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }
    const LoggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (LoggedInUser[key] = req.body[key]));

    await LoggedInUser.save();

    res.json({
      message: `${LoggedInUser.firstName}, your profile updated successfully`,
      data: LoggedInUser,
    });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

profileRouter.post("/profile/password/change", userAuth, async (req, res) => {
  try {
    const LoggedInUser = req.user;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      throw new Error("Both old and new passwords are required");
    }
    const isMatch = await LoggedInUser.validatePassword(oldPassword);
    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }
    if (oldPassword === newPassword) {
      throw new Error("New password must be different from old password");
    }
    const passwordhash = await bcrypt.hash(newPassword, 10);
    LoggedInUser.password = passwordhash;

    await LoggedInUser.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

module.exports = profileRouter;
