const express = require('express');
const connectDB = require('./config/database');
const app = express();
const User = require('./models/user');

app.use(express.json()); // Middleware to parse JSON bodies


app.post("/signup", async (req, res) => {
    // Creating new instance of User model
    const user = new User(req.body);
    try {
        await user.save();
        res.send("User added up successfully");
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


