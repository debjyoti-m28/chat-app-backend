const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");


const app = express();
dotenv.config();
connectDB();
app.use(express.json());

app.use("/api/user", userRoutes);

app.listen(5001, ()=>{
      console.log("Backend server is running...");
});