const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');


app.post("/signup", async (req, res) => {
    const user = new User({
        firstName: "Dinesh",
        lastName: "K",
        email: "dinesh@gmail.com",
        password: "9742",
        age: 22
    });
    try {
        await user.save();
        res.send("User signed up successfully");
    } catch (err) {
        res.status(500).send("Error signing up user");
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


