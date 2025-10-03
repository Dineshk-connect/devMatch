const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect("mongodb+srv://gittogether:kendrickmate@gittogether.s2ifqtt.mongodb.net/devMatch");
};

module.exports = connectDB;
