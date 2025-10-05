const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minimum: 3,
        maximum: 30,
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        
    },
    password: {
        type: String
    },
    age: {
        type: Number,
        min: 18,
        max: 65,
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "other"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        }
    }
    ,
    photoUrl: {
        type: String,
        default: "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png",
    },
    about: {
        type: String,
        default: "This is a default about section",
    },
    skills: {
        type: [String],
    },

},
{
    timestamps: true,
});

const User = mongoose.model("user", userSchema);

module.exports = User;