const constant = require('../constant');
const Model = require('../models/index');
module.exports =  (io,socket)=>{
  socket.on("adminSocketInitiated", function(data) {
    if(data && data.adminId){
        socket.join(data.adminId);
    }
  })
} 