import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messagesRoutes.js";
import {Server } from "socket.io";
import console from "console";

//vreate express aaapp and http server
const app=express();
const server =http.createServer(app)
//initialoizw socket.io
export const io= new Server(server,{
  cors:{
    origin :"*"
  }
});
   

export const userSocketMap ={};//{userid: socketid}

//socket.io connection handler

io.on("connection",(socket)=>{
  const userId =socket.handshake.query.userId;
  console.log("user connected",userId);
  if(userId)userSocketMap[userId]=socket.id;
  //emit online users to all connected clients
  io.emit("getOnlineUsers",Object.keys(userSocketMap));

  socket.on("disconnect",()=>{
    console.log("User Disconnected",userId)
    delete userSocketMap[userId];
    io.emit("getOnlineUsers",Object.keys(userSocketMap));
  })

})


//middleawaresserver(basically creating a server)

app.use(express.json({limit:"4mb"}));
app.use(cors());
app.use("/api/status",(req,res)=>res.send("server is live"));
app.use("/api/auth", userRouter);
app.use("/api/messages",messageRouter)


//connect to MONGODB
await connectDB();
const PORT =process.env.PORT|| 5003;
server.listen(PORT,()=>console.log("server is running on PORT:"+ PORT));
