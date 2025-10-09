const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minimum: 3,
      maximum: 30,
    },
    lastName: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Address:" + value);
        }
      },
    },
    password: {
      type: String,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password");
        }
      },
    },
    age: {
      type: Number,
      min: 18,
      max: 65,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: `{VALUE} is not supported`,
      },
      //     validate(value) {
      //         if (!["male", "female", "other"].includes(value)) {
      //             throw new Error("Gender data is not valid");
      //         }
      //     }
      // }
    },
    photoUrl: {
      type: String,
      default:
        "https://www.pngall.com/wp-content/uploads/5/Profile-PNG-File.png",
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
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;

  const token = await jwt.sign({ _id: user._id }, "DEVMATCH$i190", {
    expiresIn: "1d",
  });

  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordhash = user.password;

  const isPasswordvalid = await bcrypt.compare(
    passwordInputByUser,
    passwordhash
  );

  return isPasswordvalid;
};

module.exports = mongoose.model("User", userSchema);
