var Model = require('../models/index');
const twilio = require('twilio');
const config = require('../config/config');
const appConstant = require("../constant");
const mongoose = require('mongoose');
const Handlebars = require('handlebars');
const client = twilio(config.twilioCredentials.accountSid, config.twilioCredentials.authToken);
const senderNumber=config.twilioCredentials.senderNumber;
const constant = appConstant.constant;

const sendSMS=async (countryCode,phoneNo,message)=>{
    return new Promise((resolve, reject) => {
        const smsOptions = {
            from: senderNumber,
            to: countryCode + phoneNo.toString(),
            body: null,
          };
          smsOptions.body = message;
        client.messages.create(smsOptions);
        return resolve(message);
    });
};
const renderMessageFromTemplateAndVariables=async (templateData, variablesData)=> {
    return ;
}
const issue=async()=> {
    return Math.floor(100000 + Math.random() * 900000);
}
const sendOtp=async (payload)=>{
    const eventType=payload.eventType || constant.SMS_EVENT_TYPE.SEND_OTP;
    const otpCode=Math.floor(100000 + Math.random() * 900000);
    if(payload.message){
        if(payload.variablesData)
        payload.variablesData.otpCode=otpCode;
        else
        payload.variablesData={
            otpCode:otpCode
        }
        payload.message =await renderMessageFromTemplateAndVariables(payload.message,payload.variablesData);
    }
    await new Model.Otp({
        otpCode: otpCode,phoneNo:payload.phoneNo,
        countryCode:payload.countryCode, eventType:eventType}).save(); 
    await sendSMS(payload.countryCode,payload.phoneNo,payload.message)
    return payload;
}

const verify=async (payload)=> {
    if (payload.otp == '123456') {
       const eventType=payload.eventType || constant.SMS_EVENT_TYPE.SEND_OTP;
       const otpData=await Model.Otp.findOne({otpCode: payload.otpCode,eventType:eventType,
        phoneNo:payload.phoneNo,countryCode:payload.countryCode});
            if (!otpData) return false;
            await Model.Otp.deleteMany({_id:mongoose.Types.ObjectId(otpData._id)});
            return otpData;
    } else {
        const eventType=payload.eventType || constant.SMS_EVENT_TYPE.SEND_OTP;
        const otpData=await Model.Otp.findOne({otpCode: payload.otpCode,eventType:eventType,
            phoneNo:payload.phoneNo,countryCode:payload.countryCode});
            if (!otpData) return false;
            await Model.Otp.deleteMany({_id:mongoose.Types.ObjectId(otpData._id)});
            return otpData;
    }
}
module.exports = {
    sendOtp:sendOtp,
    verify:verify
}