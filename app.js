const express=require("express");
const socket = require("socket.io")
const http= require("http");
const {Chess} =require("chess.js");
const path = require('path')

const app=express();//routing,middleware etc perform

const server= http.createServer(app);//ek server create karega(yaha prr http aur express ka server link kiya hai)
const io = socket(server);//(due to socket real time connection will take place)

const chess=new Chess();

let players={};
let currentPlayer="W";

app.set("view engine" , "ejs");
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"});
})

io.on("connection",(uniquesocket)=>{
   console.log("connected");
//    uniquesocket.on("churan",()=>{ // server nai data liya
//     io.emit("churan pap")// backend nai sabke liyai send it.
//    })

// uniquesocket.on("disconnect",()=>{ //disconnection kai liyai
//     console.log("disconnected");
// });
if(!players.white){
    players.white=uniquesocket.id;
    uniquesocket.emit("playerRole","w");
}
else if(!players.black){
    players.black=uniquesocket.id;
    uniquesocket.emit("playerRole","b");
}
else{
    uniquesocket.emit("spectatorRole");
}
uniquesocket.on("disconnect",()=>{
    if(uniquesocket.id==players.white){
       delete players.white;
    }

    else if(uniquesocket.id==players.black){
       delete players.black;
    }
    
})
uniquesocket.on("move",(move)=>{
    try{
      if(chess.turn=='w' && uniquesocket.id!==players.white) return ;
      if(chess.turn=='b' && uniquesocket.id!==players.black) return ;

      const result=chess.move(move);
      if(result){
        currentPlayer=chess.turn();
        io.emit("move",move);//io sai koi bhi chezz hmm sabko bhejtai hai
        io.emit("boardState",chess.fen());//fen ek equation hoti hai jo current state find out kare sai
      }

      else{
        console.log("Invalid move",move);
        uniquesocket.emit("invalid Move",move)//uniquesocket .emit sai sirf dosrai user ko request jaigi spectators ko kuch nahi hoga...

      }
    }
    catch(err){
        console.log(err);
        uniquesocket.emit("Invalid Move: ",move);
    }
})
})  
server.listen(3000)
