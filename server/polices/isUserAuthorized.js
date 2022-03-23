const mongoose = require('mongoose');
const Services = require('../services/index');
const Model = require('../models/index');
const universalFunction=require('../lib/universal-function');
const appConstant = require("../constant");
const appMessages = require("../langs");
const statusCodeList = require("../statusCodes");
const messageList = require("../messages");

const constant = appConstant.constant;
const statusCode = statusCodeList.statusCodes;
const messages = messageList.messages;

module.exports = async(req, res, next) => {
    try {
        if (req.headers && req.headers.authorization) {
            const accessToken= req.headers.authorization;
            const decodeData=await universalFunction.jwtVerify(accessToken);
                if (!decodeData) 
                return universalFunction.forBiddenResponse(req,res);
                let userData = await Model.User.findOne({_id:mongoose.Types.ObjectId(decodeData._id),
                    accessToken:accessToken,
                    isDeleted:false,isBlocked:false});
                if(userData){
                    req.user = userData;
                    next();
                }else{
                    return universalFunction.unauthorizedResponse(req,res);
                }
        } else {
            return universalFunction.unauthorizedResponse(req,res,messages.MESSAGES.INVALID_TOKEN);
        }  
    } catch (error) {
        return universalFunction.unauthorizedResponse(req,res);
    }
    
};