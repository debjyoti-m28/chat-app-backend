const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken")

const registerUser = asyncHandler(async(req, res) =>{
    const { name, email, password, pic } = req.body;

    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please Enter all the Feilds");
    }

    const userExists = await User.findOne({ email });

    if(userExists){
        res.status(400);
        throw new Error("User already exists");
    }

    //create new user

    const user = await User.create({
        name,
        email,
        password,
        pic,
    });

    if(user){
        res.status(201).json({
            _id: user._id,
            name: user.name,
            eamil: user.email,
            pic: user.pic,
            token: generateToken(user._id), // JWT
        });
    }else{
        throw new Error("Failed to Create the user");
    }
});


const authUser = asyncHandler(async(req,res) =>{
   const { email, password } = req.body;

   const user = await User.findOne({ email });

   if(user ){ // && (await user.matchPassword(password))
    res.status(201).json({
            _id: user._id,
            name: user.name,
            eamil: user.email,
            pic: user.pic,
            token: generateToken(user._id), // JWT
        });
   }else{
     res.status(401);
     throw new Error("Invalid Eamil or Password")
   }
});

// api/user?search=piyush
const allUsers = asyncHandler(async(req, res)=>{
     const keyword = req.query.search ? {
       $or: [
           {name: {$regex: req.query.search, $options: "i" }},
           {email: {$regex: req.query.search, $options: "i"}},
       ]
     } :
     {};

     // except your own name, return all search names
     const users = await User.find(keyword).find({_id: {$ne: req.user._id}});
     res.send(users);
});

module.exports = { registerUser , authUser, allUsers}