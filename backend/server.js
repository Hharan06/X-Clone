// const express = require("express")
import express from "express"
import dotenv from "dotenv"
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import postRoute from "./routes/post.route.js"
import notificationRoute from "./routes/notification.route.js"
import connectDB from "./db/connectDB.js";
import cookieParser from "cookie-parser";
import cloudinary from "cloudinary";
import cors from "cors";

const app = express();
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret_key: process.env.CLOUDINARY_API_SECRET_KEY
})

const PORT = process.env.PORT;

app.use(cors({
    origin : "http://localhost:3000",
    credentials : true
}))
app.use(express.urlencoded({
    extended : true
}))
app.use(express.json());            
app.use(cookieParser());


// Routes should come last
app.use("/api/auth", authRoute);            
app.use("/api/user",userRoute);
app.use("/api/post",postRoute);
app.use("/api/notification",notificationRoute);

app.get("/", (req, res)=> {
    res.send("Vanakkam da");
})

app.listen(PORT, ()=> {
    console.log(`Server listening on port ${PORT}`);
    connectDB();
})