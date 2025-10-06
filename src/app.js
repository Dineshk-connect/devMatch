const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validatesignupdata } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json()); // Middleware to parse JSON bodies

// Get User by email
app.get("/user", async (req, res) => {
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

//Feed API - GET/feed - get all the users from the database
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

app.post("/signup", async (req, res) => {
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

app.delete("/user", async (req, res) => {
  const userid = req.body.userid;

  try {
    const user = await User.findByIdAndDelete(userid);
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send("User deleted successfully");
    }
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.patch("/user/:userid", async (req, res) => {
  const userid = req.params?.userid;
  const data = req.body;

  try {
    const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

    const isUpdateAllowed = Object.keys(data).every((k) =>
      ALLOWED_UPDATES.includes(k)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not Allowed");
    }

    if (data?.skills.length > 10) {
      throw new Error("Skills can not be more than 10");
    }
    await User.findByIdAndUpdate(userid, data, {
      runValidators: true,
    });

    res.send("User details updated successfully");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credentials");
    }

    const isPasswordvalid = await bcrypt.compare(password, user.password);

    if (isPasswordvalid) {
      res.send("Login Successful");
    } else {
      throw new Error("Invalid Credentials");
    }
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});
connectDB()
  .then(() => {
    console.log("Database connected successfully");

    app.listen(3000, () => {
      console.log("Server is running successfully");
    });
  })
  .catch((err) => {
    console.log("Database connection failed", err);
  });
