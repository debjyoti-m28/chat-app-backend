const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const accessChat = asyncHandler(async(req, res)=>{
  const { userId } = req.body;

  if(!userId){
    console.log("   UserId param not sent with request");
    return res.sendStatus(400);
  }

  var isChat = await Chat.find({
    isGroupChat: false,
    $and: [
        {users: {$elemMatch: {$eq: req.user._id}}},
        {users: {$elemMatch: {$eq: userId}}}
    ],
  }).populate("users", "-password").populate("latestMessage");

  isChat = await User.populate(isChat,{
    path: 'latestMessage.sender',
    select: "name pic email",
  });

  if(isChat.length>0){
    res.send(isChat[0]);
  }else{
    var chatData = {
        chatName: "sender",
        isGroupChat: false,
        users: [req.user._id, userId],
    };

    try{
        const createdChat = await Chat.create(chatData);
        const fullChat= await Chat.findOne({ _id: createdChat._id }).populate(
            "users",
            "-password"
            );

        res.status(200).send(fullChat);
    }catch(err){
        res.status(400);
        throw new Error(err.message);
    }
  }
});

const fetchChats = asyncHandler(async(req, res)=>{
   try{
      Chat.find({users: {$elemMatch: {$eq: req.user._id}}})
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (results)=>{
        results = await User.populate(results, {
            path: "latestMessage.sender",
            select: "name pic email",
        });

        res.status(200).send(results);
      });
   }catch(err){
     res.status(400);
     throw new Error(err.message);
   }
});

const createGroupChat = asyncHandler(async(req,res)=>{
    if(!req.body.users || !req.body.name){
        return res.status(400).send({message: "please fill all the feilds"});
    }

    var users = JSON.parse(req.body.users); // can't take the array of users directly from thr frontend, so will stringyfy from frontend and do pasre in backend
    
    if(users.length<2){
        return res.status(400).send("More then 2 users required");
    }

    users.push(req.user); // pushing the current user as well in the array for creating group
    
    // query for database
    try{
       const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user,
       });

       const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat);
    }catch(err){
        res.status(400);
        throw new Error(err.message);
    }
});

const renameGroup = asyncHandler(async(req,res)=>{
     const { chatId, chatName } = req.body;

     const updatedChat = await Chat.findByIdAndUpdate(
        chatId, // find the chat by id
        {
            chatName: chatName  // update the chat name
        },
        {
            new: true // return the new chat name
        },
     ).populate("users", "-password")
     .populate("groupAdmin", "-password");

     if(!updatedChat){
        res.status(404);
        throw new Error("Chat Not Found");
     }else{
        res.json(updatedChat);
     }
});

const addToGroup = asyncHandler(async(req,res)=>{
    const { chatId, userId } = req.body;

    const addedUser = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true
      }
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!addedUser){
      res.status(404);
      throw new Error("Chat not found");
    }else{
      res.json(addedUser);
    }
});

const removeFromGroup = asyncHandler(async(req, res)=>{
    const { chatId, userId } = req.body;

    const removedUser = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true
      }
    ).populate("users", "-password")
    .populate("groupAdmin", "-password");

    if(!removedUser){
      res.status(404);
      throw new Error("Chat not found");
    }else{
      res.json(removedUser);
    }  
});

module.exports= { accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup};