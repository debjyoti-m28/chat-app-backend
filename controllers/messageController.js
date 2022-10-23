const asyncHandler = require("express-async-handler");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

const sendMessage = asyncHandler(async(req, res)=>{
   const { content, chatId } = req.body;

   if(!content || !chatId){
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
   }

   var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
   };

   try{
      var message = await Message.create(newMessage);

      message = await message.populate("sender", "name pic");
      message = await message.populate("chat");
      message = await User.populate(message,{
          path: 'chat.users',
          select: 'name pic email',
      });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });

      res.json(message).status(200);
   }catch(err){
      res.status(400);
      throw new Error(err.message);
   }

});

const allMessages = asyncHandler((req, res)=>{
    
})

module.exports = { sendMessage, allMessages }