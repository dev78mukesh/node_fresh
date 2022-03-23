const Constaconstantnt = require('../constant');
const Model = require('../models/index');
const UserController = require('../v1/controllers/UserController')
module.exports =  (io,socket)=>{
  socket.on("userSocketInitiated", function(data) {
    if(data && data.userId){
        socket.join(data.userId);
    }
  })
}