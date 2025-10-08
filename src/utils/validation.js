const validator=require("validator");

const validatesignupdata=(req)=>{

    const{firstName,lastName,email,password}=req.body;

    if(!firstName || !lastName){
        throw new Error("Enter valid name");
    }else if(!validator.isEmail(email)){
        throw new Error("Email is not valid");
    }else if(!validator.isStrongPassword(password)){
        throw new Error("Enter strong password");
    }
};

const validateEditProfileData=(req)=>{

    const allowedEditFields=["photoUrl","about","age","skills"];

   const isEditAllowed= Object.keys(req.body).every(field=>allowedEditFields.includes(field));
     
    return isEditAllowed;
};

module.exports={
    validatesignupdata,
    validateEditProfileData,
};