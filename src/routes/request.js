const express=require("express");

const requestRouter=express.Router();
const {userAuth}=require("../middlewares/auth");




requestRouter.post("/SendConnectionRequest",userAuth, async (req, res) => {
  const user=req.user;

  res.send( user.firstName +" Sent you an connection");
});

module.exports=requestRouter;