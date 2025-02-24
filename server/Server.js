const http = require("http");
const express = require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app=express();
const port =process.env.PORT || 5000;

const users = {}

app.use(cors());
app.get("/",(req,res)=>{
    res.send("my server is running......")
})


const server = http.createServer(app);
const io=socketIO(server,{
    cors: {
        origin: "*", // Allow all origins (You can restrict it)
        methods: ["GET", "POST"]
    }
});

io.on("connection",(socket)=>{
    console.log("new user connected");
  
    socket.on('joined' , ({user})=>{
        users[socket.id]=user;
        console.log(`${user} has joined`);
        socket.broadcast.emit('userJoined',{user:"Admin",message:` ${users[socket.id]} has joined`});
        socket.emit('welcome',{user:"Admin",message:`Welcome to the chat ${users[socket.id]} `})
        
    });
socket.on('message',({message,id})=>{
    if (users[id]) {
        io.emit('sendMessage' , {user:users[id],message,id});
    }
})

socket.on('disconnected',()=>{
    if (users[socket.id]) {
        socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
        console.log(`${users[socket.id]} left `);   
        delete users[socket.id]; // ✅ Remove user when they disconnect

    }

})
});

server.listen(port,()=>{
    console.log(`server is working in http://localhost:${port}`);
    
})