const jwt = require('jsonwebtoken');
const User = require("../models/userModel.js");
const asyncHandler = require("express-async-handler");

//middleware has 3 params (req, res, next), next=move on to the other operatiobn
const protect = asyncHandler(async (req, res, next)=>{
    let token;

    if(
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ){
        try{
            token = req.headers.authorization.split(" ")[1];

            //decodes token id
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user =await User.findById(decoded.id).select("-password");

            next();
        }catch(err){
           res.status(401);
           throw new Error("Not authorized, token failed");
        }
    }

    if(!token){
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

module.exports = { protect };