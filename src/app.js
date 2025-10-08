const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");  

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cookieParser());


const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");


app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);   
 

// app.patch("/user/:userid", async (req, res) => {
//   const userid = req.params?.userid;
//   const data = req.body;

//   try {
//     const ALLOWED_UPDATES = ["photoUrl", "about", "gender", "age", "skills"];

//     const isUpdateAllowed = Object.keys(data).every((k) =>
//       ALLOWED_UPDATES.includes(k)
//     );
//     if (!isUpdateAllowed) {
//       throw new Error("Update not Allowed");
//     }

//     if (data?.skills.length > 10) {
//       throw new Error("Skills can not be more than 10");
//     }
//     await User.findByIdAndUpdate(userid, data, {
//       runValidators: true,
//     });

//     res.send("User details updated successfully");
//   } catch (err) {
//     res.status(500).send("Something went wrong");
//   }
// });

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
