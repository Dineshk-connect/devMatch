const adminauth=(req,res,next)=>{
 const token="xyz";
 const isAdminAuthorized=token==="xyz";
 if(!isAdminAuthorized)
 {
    res.status(401).send("Unauthorized access");
 }else{
    next();
 }
};

module.exports={adminauth,

};