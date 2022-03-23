const Model = require('../../models/index');
const Service = require('../../services/index');
const Validation = require('../Validations/index');
const universalFunction = require('../../lib/universal-function');
const appConstant = require("../../constant");
const statusCodeList = require("../../statusCodes");
const messageList = require("../../messages");

const constant = appConstant.constant;
const statusCode = statusCodeList.statusCodes.STATUS_CODE;
const messages = messageList.messages.MESSAGES;
const _ = require('lodash');
const mongoose = require('mongoose');
const moment = require('moment');
const request = require('request');
const bluebird= require('bluebird');

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.forgotChangePassword = forgotChangePassword;
exports.deleteAccount=deleteAccount;
exports.uploadFile = uploadFile;
exports.sendOtp = sendOtp
exports.verifyOtp = verifyOtp
exports.getAllNotification = getAllNotification;
exports.clearNotification = clearNotification;
exports.clearAllNotification = clearAllNotification;
exports.getAppVersion = getAppVersion;
exports.addAlgorithem=addAlgorithem;
exports.updateAlgorithem=updateAlgorithem;
exports.deleteAlgorithem=deleteAlgorithem;
exports.getAlgorithem=getAlgorithem;
exports.getAllAlgorithem=getAllAlgorithem;
exports.addSelectedBet=addSelectedBet;
exports.getSelectedBet=getSelectedBet;
exports.deleteSelectedBet=deleteSelectedBet;
exports.getBets=getBets;
exports.getAllBets=getAllBets;
exports.addStraightBets=addStraightBets;
exports.addParlayBets=addParlayBets;
exports.addTeaserBets=addTeaserBets;
exports.updateStraightBet=updateStraightBet;
exports.updateParleyAndTeaserBet=updateParleyAndTeaserBet;
exports.updateTeaserBet=updateTeaserBet;
exports.deleteBet=deleteBet;
exports.getAllStraightBets=getAllStraightBets;
exports.getAllSports=getAllSports;
exports.getEventBySportsDate=getEventBySportsDate;
exports.getEvent=getEvent;
exports.addContactUs=addContactUs;
exports.getallAnalyst=getallAnalyst;
exports.getUserPerformance=getUserPerformance;
exports.getAllPick=getAllPick;
exports.getAllPickBySport=getAllPickBySport;
exports.getAnalystPerformance=getAnalystPerformance;
exports.getAnalystPerformanceBySport=getAnalystPerformanceBySport;
async function delay(){
    setTimeout(() => {
    }, 3000);
}
async function  bulkInsertEvents(data){
    let finalData=[];
    if(data && data.length){
        for(let i=0;i<data.length;i++){
            finalData.push(
                { updateOne: {
                    filter: {url:data[i].url},
                    update: {
                        $set:data[i]
                    },
                    upsert:true }
                })
        }
        await Model.CashControl.bulkWrite(finalData);
    }
    return true;
}
async function customRequest(options){
    console.log("hit..");
    return new Promise((resolve, reject)=>{
    request(options,function (error, response, body) {
        if(error){
            return resolve(null);
        }else{
            if(response && response.statusCode && response.statusCode==statusCode.SUCCESS &&
                typeof JSON.parse(body) =='object'){
                return resolve(JSON.parse(body));
            }else{
                return resolve(null);
            }
        }
    });
});
}
async function requestSend(options){
    let apiName=options.apiName || 0;
    if(options && options.apiName){
        delete options.apiName;
    }
    console.log("API_NAME",apiName)
    let data=null;
    let dateDifference=null;
    let sportsData=null;
    let dateDifferencePast=null;
    let dateDifferenceFuture=null;
    let isDateBetween=false;
    let finalData=[];
    let eventDate=null;
    let isCompleted=false;
    let dataCheck= await Model.CashControl.findOne({url:options.url});
    if(dataCheck && dataCheck.response){
        switch(apiName){
            case constant.RUNDOWN_API_NAME.SPORTS:
                isCompleted=false;
                dateDifference=moment().diff(dataCheck.updatedAt,constant.RUNDOWN_API_TIME_PARAM.HOURS);
                if(dateDifference>constant.RUNDOWN_API_TIME.TIME_SPORT_LIST_API && !dataCheck.isCompleted){
                    data=await customRequest(options);
                    eventDate=null;
                    isCompleted=false;
                    await Model.CashControl.findOneAndUpdate({
                        url:options.url
                    },{response:data,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                }
                break;
            case constant.RUNDOWN_API_NAME.EVENT:
                isCompleted=false;
                dateDifference=moment().diff(dataCheck.updatedAt,constant.RUNDOWN_API_TIME_PARAM.HOURS);
                sportsData =dataCheck.response || null;
                if(sportsData && sportsData.event_date){
                    eventDate=sportsData.event_date;
                }
                dateDifferencePast=moment(eventDate).subtract(constant.RUNDOWN_API_TIME.LIVE_PAST_TIME_EVENT_API,constant.RUNDOWN_API_TIME_PARAM.HOURS);
                dateDifferenceFuture=moment(eventDate).add(constant.RUNDOWN_API_TIME.LIVE_FUTURE_TIME_EVENT_API,constant.RUNDOWN_API_TIME_PARAM.DAYS);
                isDateBetween=moment().isBetween(dateDifferencePast,dateDifferenceFuture) || false;
                if(!dataCheck.isCompleted && isDateBetween){
                data=await customRequest(options);
                isCompleted=false;
                }else if(dateDifference>constant.RUNDOWN_API_TIME.TIME_EVENT_API && !dataCheck.isCompleted){
                    data=await customRequest(options);
                    if(data && data.score
                        && data.score.event_status
                        && data.score.event_status=='STATUS_FINAL'){
                        isCompleted=true;
                    }
                }else if(sportsData && sportsData.score
                    && sportsData.score.event_status
                    && sportsData.score.event_status=='STATUS_FINAL'){
                    isCompleted=true;
                }
                await Model.CashControl.findOneAndUpdate({
                    url:options.url
                },{response:data || dataCheck.response,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            case constant.RUNDOWN_API_NAME.SPORTS_BY_DATE:
                isCompleted=false;
                dateDifference=moment().diff(dataCheck.updatedAt,constant.RUNDOWN_API_TIME_PARAM.HOURS);
                sportsData =dataCheck.response || null;
                finalData=[];
                if(sportsData && sportsData.events){
                    let dates=[];
                    for(let i=0;i<sportsData.events.length;i++){
                        dates.push(sportsData.events[i].event_date);
                        let event_date=sportsData.events[i].event_date || null;
                        let isEventComplete=false;
                        let url=`${constant.RUNDOWN_API_URL}/events/${sportsData.events[i].event_id}?include=all_periods&include=scores`;
                        if(sportsData.events[i].score && sportsData.events[i].score.event_status=='STATUS_FINAL'){
                            isEventComplete=true;
                        }
                        let obj={
                            url:url,
                            eventDate:event_date,
                            isCompleted:isEventComplete,
                            response:sportsData.events[i],
                            isBlocked:false,
                            isDeleted:false,
                            createdAt:new Date(),
                            updatedAt:new Date()
                        }
                        finalData.push(obj);
                    }
                    if(dates && dates.length){
                        eventDate=dates.reduce(function (a, b) {
                            return a < b ? a : b;
                        });
                    }
                }
                dateDifferencePast=moment(eventDate).subtract(constant.RUNDOWN_API_TIME.LIVE_PAST_TIME_EVENT_API,constant.RUNDOWN_API_TIME_PARAM.HOURS);
                dateDifferenceFuture=moment(eventDate).add(constant.RUNDOWN_API_TIME.LIVE_FUTURE_TIME_EVENT_API,constant.RUNDOWN_API_TIME_PARAM.DAYS);
                isDateBetween=moment().isBetween(dateDifferencePast,dateDifferenceFuture) || false;
                if(!dataCheck.isCompleted && isDateBetween){
                    console.log("isDateBetween")
                data=await customRequest(options);
                isCompleted=false;
                }else if(dateDifference>constant.RUNDOWN_API_TIME.TIME_EVENT_API && !dataCheck.isCompleted){
                    data=await customRequest(options);
                    isCompleted=true;
                    if(data && data.events && data.events.length){
                        for(let i=0;i<data.events.length;i++){
                            if(data.events[i].score
                                && data.events[i].score.event_status
                                && data.events[i].score.event_status =='STATUS_FINAL'){
                                console.log("dateDifference");
                            }else{
                                isCompleted=false;
                            }
                        }
                    }else{
                        isCompleted=false;
                    }
                }else if(sportsData && sportsData.events && sportsData.events.length){
                    isCompleted=true;
                    for(let i=0;i<sportsData.events.length;i++){
                        if(sportsData.events[i].score &&
                            sportsData.events[i].score.event_status &&
                            sportsData.events[i].score.event_status =='STATUS_FINAL'){
                                console.log("dateDifference else ");
                        }else{
                            isCompleted=false;
                        }
                    }
                }
                await bulkInsertEvents(finalData);
                await Model.CashControl.findOneAndUpdate({
                    url:options.url
                },{response:data || dataCheck.response,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            default:
                break;
        }
        return data || dataCheck.response;
    }else{
        console.log("else")
        let data=await customRequest(options);
        let eventDate=null;
        let isCompleted=false;
        switch(apiName){
            case constant.RUNDOWN_API_NAME.SPORTS:
                isCompleted=false;
                await Model.CashControl.findOneAndUpdate({
                    url:options.url
                },{response:data,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            case constant.RUNDOWN_API_NAME.EVENT:
                isCompleted=false;
                    if(data && data.score
                            && data.score.event_status
                            && data.score.event_status=='STATUS_FINAL'){
                        isCompleted=true;
                    }
            await Model.CashControl.findOneAndUpdate({
                url:options.url
            },{response:data,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            case constant.RUNDOWN_API_NAME.SPORTS_BY_DATE:
                finalData=[];
                isCompleted=true;
                if(data && data.events && data.events.length){
                    if(data && data.events && data.events.length){
                        let dates=[];
                        for(let i=0;i<data.events.length;i++){
                            dates.push(data.events[i].event_date);
                            let event_date=data.events[i].event_date || null;
                            let isEventComplete=false;
                            let url=`${constant.RUNDOWN_API_URL}/events/${data.events[i].event_id}?include=all_periods&include=scores`;
                            if(data.events[i].score && data.events[i].score.event_status=='STATUS_FINAL'){
                                isEventComplete=true;
                            }else{
                                isCompleted=false;
                            }
                            let obj={
                                url:url,
                                eventDate:event_date,
                                isCompleted:isEventComplete,
                                response:data.events[i],
                                isBlocked:false,
                                isDeleted:false,
                                createdAt:new Date(),
                                updatedAt:new Date()
                            }
                            finalData.push(obj);
                        }
                        eventDate=dates.reduce(function (a, b) {
                            return a < b ? a : b;
                        });
                    }else{
                        isCompleted=false;
                    }
                }else{
                    isCompleted=false;
                }
            await bulkInsertEvents(finalData);
            await Model.CashControl.findOneAndUpdate({
                url:options.url
            },{response:data,url:options.url,eventDate:eventDate,isCompleted:isCompleted},{upsert:true});
                break;
            default:
                break;
        }
        return data;
    }
}
async function registerDevice(body, userId, isUser) {
    if (!body.deviceType || !body.deviceToken)
        return false;
    const device = await Model.Device.findOne({
        userId: userId
    });
    if (device) {
        try {
            await Model.Device.updateOne({
                _id: device._id
            }, {
                deviceToken: body.deviceToken,
                deviceType: body.deviceType
            });
        } catch (error) {
            return false;
        }
    } else {
        let deviceBody;
        if (isUser) deviceBody = {
            userId: userId,
            deviceType: body.deviceType,
            deviceToken: body.deviceToken,
            isUser: true
        };
        else deviceBody = {
            driverId: userId,
            deviceType: body.deviceType,
            deviceToken: body.deviceToken,
            isUser: true
        };
        const Device = new Model.Device(deviceBody);
        try {
            await Device.save();
        } catch (error) {
            return false;
        }
    }
};
async function getEventById(betObj) {
    let dataToSend = {};
    if(betObj && betObj.eventId){
        var options = {
            method: 'GET',
            url: `${constant.RUNDOWN_API_URL}/events/${betObj.eventId}?include=all_periods&include=scores`,
            headers: {
                'x-rapidapi-key': constant.RUNDOWN_API_TOKEN
            },
            apiName:constant.RUNDOWN_API_NAME.EVENT
        };
        dataToSend = await requestSend(options);
        dataToSend.SelectedBet={};
        dataToSend.SelectedBet=betObj;
        if (dataToSend && dataToSend.lines) {
            dataToSend.lines = Object.values(dataToSend.lines)
        }
        if (dataToSend && dataToSend.line_periods) {
            dataToSend.line_periods = Object.values(dataToSend.line_periods)
            let line_periods = dataToSend.line_periods || [];
            let final_line_periods = [];
            for (let i = 0; i < line_periods.length; i++) {
                if (line_periods[i].period_full_game && line_periods[i].period_full_game.affiliate) {
                    let affiliate_id = line_periods[i].period_full_game.affiliate.affiliate_id || 0;
                    switch (affiliate_id) {
                        case constant.AFFILIATED_LIST.DIMES_5:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BOVADA:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.PINNACLE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BET_ONLINE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BOOKMARKER:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                    }
                }
            }
            dataToSend.line_periods = final_line_periods || [];
        }
    }
    return dataToSend;
};
async function getEventByWithOutBindId(betObj) {
    let dataToSend = {};
    if(betObj && betObj.eventId){
        var options = {
            method: 'GET',
            url: `${constant.RUNDOWN_API_URL}/events/${betObj.eventId}?include=all_periods&include=scores`,
            headers: {
                'x-rapidapi-key': constant.RUNDOWN_API_TOKEN
            },
            apiName:constant.RUNDOWN_API_NAME.EVENT
        };
        dataToSend = await requestSend(options);
        if (dataToSend && dataToSend.lines) {
            dataToSend.lines = Object.values(dataToSend.lines)
        }
        if (dataToSend && dataToSend.line_periods) {
            dataToSend.line_periods = Object.values(dataToSend.line_periods)
            let line_periods = dataToSend.line_periods || [];
            let final_line_periods = [];
            for (let i = 0; i < line_periods.length; i++) {
                if (line_periods[i].period_full_game && line_periods[i].period_full_game.affiliate) {
                    let affiliate_id = line_periods[i].period_full_game.affiliate.affiliate_id || 0;
                    switch (affiliate_id) {
                        case constant.AFFILIATED_LIST.DIMES_5:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BOVADA:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.PINNACLE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BET_ONLINE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        case constant.AFFILIATED_LIST.BOOKMARKER:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                    }
                }
            }
            dataToSend.line_periods = final_line_periods || [];
        }
    }
    return dataToSend;
};
async function getAllEventDataById(betData){
    return Promise.all(betData.map(betObj =>
        getEventById(betObj)
    ));
}
async function getAllEventDataByIds(betDataArr){
    return Promise.all(betDataArr.map(el =>
        getEventByWithOutBindId(el)
    ));
}
async function register(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateRegister(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const emailUser = await Model.User.findOne({
            email: req.body.email,
            isDeleted: false
        });
        if (emailUser) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.EMAIL_ALREDAY_EXIT);
        }
        const userNameCheck = await Model.User.findOne({
            userName: req.body.userName,
            isDeleted: false
        });
        if (userNameCheck) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_NAME_ALREADY_EXISTS);
        }
        if(req.body.phoneNo){
            const userData = await Model.User.findOne({
                phoneNo: req.body.phoneNo,
                countryCode: req.body.countryCode,
                isDeleted: false
            });
            if (userData) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.PHONE_NUMBER_ALREADY_EXISTS);
            }
        }
        req.body.image = '';
        if (req.file && req.file.filename) {
            req.body.image = `${Constant.filePath.user}/${req.file.filename}`;
        }
        let coordinates = []
        let location = {}
        if (req.body.latitude && req.body.longitude) {
            coordinates.push(Number(req.body.latitude))
            coordinates.push(Number(req.body.longitude))
            location.type = "Point";
            location.coordinates = coordinates
        }

        req.body.location = location;
        let user = await new Model.User(req.body).save();
        let accessToken = await universalFunction.jwtSign(user);
        user = await Model.User.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(user._id)
        }, {
            $set: {
                accessToken: accessToken
            }
        })
        user.accessToken = accessToken;
        registerDevice(req.body, user._id, true);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_REGISTER_SUCCESSFULLY, user);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function login(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateLogin(req);
        if (valid) {
            return universalFunction.validationError(res,valid);
        }
        let user= await Model.User.findOne({
                $or:[{userName: req.body.userName},{email: req.body.userName}],
                isDeleted: false
            });
            if (!user)
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_USERNAME_EMAIL);
        if (user && user.isBlocked)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ADMIN_BLOCKED);
        let password = await universalFunction.comparePasswordUsingBcrypt(req.body.password, user.password);
        if (!password) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_PASSWORD);
        }
        let accessToken = await universalFunction.jwtSign(user);
        user.accessToken = accessToken;
        await Model.User.findOneAndUpdate({
            _id: user._id
        }, {
            $set: {
                accessToken: accessToken
            }
        });
        registerDevice(req.body, user._id, true);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_LOGIN_SUCCESSFULLY, user);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function logout(req, res) {
    try {
        let accessToken = await universalFunction.jwtSign(req.user);
        await Model.User.findOneAndUpdate({
            _id: req.user._id
        }, {
            accessToken: accessToken
        }, {});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_LOGOUT_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getProfile(req, res) {
    try {
        const userData = await Model.User.findOne({
            _id: req.user._id
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, userData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function updateProfile(req, res) {
    try {
        let message=messages.USER_PROFILE_UPDATED_SUCCESSFULLY;
        const valid = await Validation.isUserValidate.validateUpdateProfile(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let setObj = req.body;
        let user = await Model.User.findOne({
            _id: req.user._id
        });
        if (setObj.password) {
            const userData = await Model.User.findOne({
                _id: req.user._id
            });
            let passwordValid = await universalFunction.comparePasswordUsingBcrypt(req.body.password, userData.password);
            if (passwordValid) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.SAME_PASSWORD_NOT_ALLOWED);
            }
            const password = await universalFunction.hashPasswordUsingBcrypt(req.body.password);
            req.body.password = password;
        }
        if (setObj.email) {
            const userData = await Model.User.findOne({
                _id: {
                    $nin: [req.user._id]
                },
                email: req.body.email,
                isDeleted: false
            });
            if (userData)
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.EMAIL_ALREDAY_EXIT);
        }
        if(setObj.userName){
            const userData = await Model.User.findOne({
                _id: {
                    $nin: [req.user._id]
                },
                userName: req.body.userName,
                isDeleted: false
            });
            if (userData) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_NAME_ALREADY_EXISTS);
            }
        }

        if (setObj.phoneNo && !setObj.countryCode) {
            setObj.countryCode = user.countryCode;
        }
        if (!setObj.phoneNo && setObj.countryCode) {
            setObj.phoneNo = user.phoneNo;
        }
        if (setObj.phoneNo && setObj.countryCode) {
            const userData = await Model.User.findOne({
                _id: {
                    $nin: [req.user._id]
                },
                phoneNo: req.body.phoneNo,
                countryCode: req.body.countryCode,
                isDeleted: false
            });
            if (userData) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.PHONE_NUMBER_ALREADY_EXISTS);
            }
        }

        await Model.User.findOneAndUpdate({
            _id: req.user._id
        }, {
            $set: setObj
        });
        if(req.body.bankRoll){
            message=messages.USER_BANCKROLL_UPDATED_SUCCESSFULLY
        }
        user=await Model.User.findOne({_id: req.user._id});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS,message, user);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function changePassword(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateChangePassword(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let setObj = req.body;
        const userData = await Model.User.findOne({
            _id: req.user._id
        });
        let passwordValid = await universalFunction.comparePasswordUsingBcrypt(req.body.password, userData.password);
        if (!passwordValid) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.OLD_PASSWORD_NOT_MATCH);
        }
        const password = await universalFunction.hashPasswordUsingBcrypt(req.body.newPassword);
        req.body.password = password;
        await Model.User.findOneAndUpdate({
            _id: req.user._id
        }, {
            $set: setObj
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_CHANGED_PASSWORD_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function forgotPassword(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateForgotPassword(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const user = await Model.User.findOne({
            email: req.body.email,
            isDeleted: false,
            isBlocked: false
        });
        if (!user)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.EMAIL_ID_DOES_NOT_EXISTS);

        const passwordResetToken = await universalFunction.generateRandomString(20);
        await Model.User.findOneAndUpdate({
            _id: user._id
        }, {
            $set: {
                passwordResetToken: passwordResetToken,
                passwordResetTokenDate: new Date()
            }
        });
        const payloadData = {
            email: req.body.email,
            passwordResetToken: passwordResetToken
        }
        Service.EmailService.AdminForgotEmail(payloadData);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.PASSWORD_RESET_LINK_SEND_YOUR_EMAIL, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function forgotChangePassword(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateForgotChangePassword(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const user = await Model.User.findOne({
            passwordResetToken: req.body.passwordResetToken
        });
        if (!user)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_PASSWORD_RESET_TOKEN);
        const passwordResetToken = await universalFunction.generateRandomString(20);
        const password = await universalFunction.hashPasswordUsingBcrypt(req.body.password);
        await Model.User.updateOne({
            _id: user._id
        }, {
            $set: {
                password: password,
                passwordResetToken: passwordResetToken
            }
        })
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_CHANGED_PASSWORD_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function deleteAccount(req, res) {
    try {
        let accessToken = await universalFunction.jwtSign(req.user);
        await Model.User.findOneAndUpdate({
            _id: req.user._id
        }, {
            accessToken: accessToken,
            isDeleted:true
        }, {});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_DELETED_ACCOUNT_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
GENRAL API'S
*/
async function uploadFile(req, res) {
    try {
        let data = {};
        if (req.file && req.file.filename) {
            data.orignal = `${constant.FILE_PATH.USER}/${req.file.filename}`;
            data.thumbNail = `${constant.FILE_PATH.USER}/${req.file.filename}`;
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.FILE_UPLOADED_SUCCESSFULLY, data);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function sendOtp(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateSendOtpCode(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const userData = await Model.User.findOne({
            phoneNo: req.body.phoneNo,
            countryCode: req.body.countryCode,
            isDeleted: false
        });
        if (userData) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.PHONE_NUMBER_ALREADY_EXISTS);
        }
        let optData = await Model.Otp.findOne({
            phoneNo: req.body.phoneNo,
            countryCode: req.body.countryCode,
            eventType: constant.SMS_EVENT_TYPE.SEND_OTP
        });
        if (optData)
            await Model.Otp.deleteMany({
                _id: optData._id
            });
        let sendOtpObj = req.body;
        sendOtpObj.eventType = constant.SMS_EVENT_TYPE.SEND_OTP;
        sendOtpObj.message = 'Your otp code is {{otpCode}}'
        otpData = await Service.OtpService.sendOtp(sendOtpObj);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.OTP_CODE_SEND_YOUR_REGISTER_PHONE_NUMBER, otpData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function verifyOtp(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateVerifyOtpCode(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const otpData = await Service.OtpService.verify(req.body);
        if (!otpData) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_OTP);
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.OTP_VERIFIED, otpData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};

/*
NOTIFICATION API'S
*/
async function getAllNotification(req, res) {
    try {
        const skip = parseInt(req.query.skip) || 0;
        const limit = parseInt(req.query.limit) || 10;
        let criteria = {
            isDeleted: false
        }
        let dataToSend = {};
        let pipeline = [{
                $match: {
                    receiverId: req.user._id
                }
            },
            {
                $match: {
                    isDeleted: false
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
            {
                $project: {
                    adminId: 1,
                    userId: 1,
                    userData: 1,
                    message: 1,
                    isRead: 1
                }
            }
        ];
        if (req.query.isRead != undefined) {
            pipeline.push({
                $match: {
                    isRead: false
                }
            });
            criteria.isRead = false;
        }
        const count = await Model.UserNotification.countDocuments(criteria);
        const notificationData = await Model.UserNotification.aggregate(pipeline);
        dataToSend.notificationData = notificationData;
        dataToSend.count = count;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function clearNotification(req, res) {
    try {
        const valid = await Validation.isUserValidate.validateNotificationId(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        await Model.UserNotification.findOneAndUpdate({
            _id: req.body.notificationId
        }, req.body);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_CLEAR_NOTIFICATION, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function clearAllNotification(req, res) {
    try {
        await Model.UserNotification.update({
            receiverId: req.user._id
        }, req.body, {
            multi: true
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_CLEAR_ALL_NOTIFICATION, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
APP VERSIONING API'S
*/
async function getAppVersion(req, res) {
    try {
        const appVersionData = await Model.AppVersion.findOne({});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, appVersionData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
ALGORITHEM API'S
*/
async function addAlgorithem(req, res) {
    try {
        const valid = await Validation.isUserValidate.addAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const algorithemName = await Model.Algorithem.findOne({
            userId: req.user._id,
            name: req.body.name,
            isDeleted: false
        });
        if (algorithemName) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ALGORITHEM_NAME_ALREADY_EXISTS);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1});
        if(userData && userData.userType =='ANALYST'){
            let algorithemCount=await Model.Algorithem.findOne({
                sportId:req.body.sportId,
                userId: req.user._id,
                isDeleted:false
            })
            let objSport={
                sport:req.body.sport || ""
            }
            if(algorithemCount){
                return universalFunction.sendResponseCustom(req, res, statusCode.BAD_REQUEST, messages.YOU_ALREADY_ADDED_THIS_ALGORITHM,{},objSport);
            }
        }
        req.body.userId=req.user._id;
        await new Model.Algorithem(req.body).save();
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_ALGORITHEM_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function updateAlgorithem(req, res) {
    try {
        const valid = await Validation.isUserValidate.updateAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        if(req.body.name){
            const algorithemName = await Model.Algorithem.findOne({
                _id:{$nin:[req.body.algorithemId]},
                userId: req.user._id,
                name: req.body.name,
                isDeleted: false
            });
            if (algorithemName) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ALGORITHEM_NAME_ALREADY_EXISTS);
            }
        }
         if(req.body.sportId !=undefined){
             let userData=await Model.User.findOne({_id:req.user._id},{userType:1});
             if(userData && userData.userType =='ANALYST'){
                 let algorithemCount=await Model.Algorithem.findOne({
                     _id:{$nin:[req.body.algorithemId]},
                     sportId:req.body.sportId,
                     userId: req.user._id,
                     isDeleted:false
                 })
                 let objSport={
                     sport:req.body.sport || ""
                 }
                 if(algorithemCount){
                     return universalFunction.sendResponseCustom(req, res, statusCode.BAD_REQUEST, messages.YOU_ALREADY_ADDED_THIS_ALGORITHM,{},objSport);
                 }
             }
         }
        await Model.Algorithem.findOneAndUpdate({
            _id:req.body.algorithemId,
            userId: req.user._id
        }, {
            $set: req.body
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_UPDATE_ALGORITHEM_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function deleteAlgorithem(req, res) {
    try {
        const valid = await Validation.isUserValidate.deleteAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        await Model.Algorithem.findOneAndUpdate({
            _id:mongoose.Types.ObjectId(req.body.algorithemId),
            userId:mongoose.Types.ObjectId(req.user._id)
        }, {
            $set:{isDeleted:true}
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_DELETED_ALGORITHEM_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getAlgorithem(req, res) {
    try {
        const valid = await Validation.isUserValidate.getAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const algorithemData = await Model.Algorithem.findOne({_id:req.body.algorithemId});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, algorithemData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllAlgorithem(req, res) {
    try {
        const valid = await Validation.isUserValidate.getAllAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.body.pageNo-1) || constant.DEFAULT_SKIP;
        let limit= constant.DEFAULT_LIMIT;
        skip=skip*limit;
        let dataToSend={};
        let criteria={isDeleted:false,isBlocked:false,userId:req.user._id};
        const algorithemCount = await Model.Algorithem.countDocuments(criteria);
        const algorithemData = await Model.Algorithem.find(criteria).limit(limit).skip(skip).sort({createdAt: -1});
        dataToSend.algorithemData=algorithemData ||[];
        dataToSend.totalPages=Math.ceil(algorithemCount/limit) ||0;
        if(algorithemData && algorithemData.length){
            return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
        }else{
            return universalFunction.sendResponse(req, res, statusCode.EMPTY_DATA, messages.DATA_NOT_FOUND, dataToSend);
        }
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
BETS API'S
*/
async function addSelectedBet(req, res) {
    try {
        const valid = await Validation.isUserValidate.addSelectedBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }

        req.body.userId=req.user._id;
        let line='SPREAD';
        if((req.body).hasOwnProperty('isAwaySpreadSelected') ||
        (req.body).hasOwnProperty('isHomeSpreadSelected')){
            line='SPREAD';
        }
        if((req.body).hasOwnProperty('isAwayMoneySelected') ||
        (req.body).hasOwnProperty('isHomeMoneySelected')){
            line='MONEYLINE';
        }
        if((req.body).hasOwnProperty('isAwayTotalSelected') ||
        (req.body).hasOwnProperty('isHomeTotalSelected')){
            line='TOTAL';
        }

        const eventData=await Model.SelectedBet.findOne({
            userId:req.user._id,
            eventId:req.body.eventId,
            line:line
        });
        if(!eventData){
            if(req.body.isAwaySpreadSelected){
                req.body.isAwaySpreadSelected=true;
                req.body.isHomeSpreadSelected=false;
            }else if(req.body.isHomeSpreadSelected){
                req.body.isAwaySpreadSelected=false;
                req.body.isHomeSpreadSelected=true;
            }else{
                req.body.isAwaySpreadSelected=false;
                req.body.isHomeSpreadSelected=false;
            }
            if(req.body.isAwayMoneySelected){
                req.body.isAwayMoneySelected=true;
                req.body.isHomeMoneySelected=false;
            }else if(req.body.isHomeMoneySelected){
                req.body.isAwayMoneySelected=false;
                req.body.isHomeMoneySelected=true;
            }else{
                req.body.isAwayMoneySelected=false;
                req.body.isHomeMoneySelected=false;
            }
            if(req.body.isAwayTotalSelected){
                req.body.isAwayTotalSelected=true;
                req.body.isHomeTotalSelected=false;
            }else if(req.body.isHomeTotalSelected){
                req.body.isAwayTotalSelected=false;
                req.body.isHomeTotalSelected=true;
            }else{
                req.body.isAwayTotalSelected=false;
                req.body.isHomeTotalSelected=false;
            }
        }
        req.body.line=line;
        const eventDataCheck=await Model.SelectedBet.find({
            userId:req.user._id
        });
        if(eventDataCheck && eventDataCheck.length>4){
            const eventDataCheckExistEventId=await Model.SelectedBet.findOne({
                userId:req.user._id,
                eventId:req.body.eventId,
                line:line
            });
            if(!eventDataCheckExistEventId)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_BET_LIMIT);
        }
        await Model.SelectedBet.findOneAndUpdate({
            userId:req.user._id,
            eventId:req.body.eventId,
            line:line
        },{
            $set:req.body
        },{upsert:true});
        const selectedBetData=await Model.SelectedBet.findOne({
            userId:req.user._id,
            eventId:req.body.eventId,
            line:line
        },{},{});
        if(selectedBetData && !selectedBetData.isAwaySpreadSelected &&
            !selectedBetData.isHomeSpreadSelected && !selectedBetData.isAwayMoneySelected &&
            !selectedBetData.isHomeMoneySelected && !selectedBetData.isAwayTotalSelected &&
            !selectedBetData.isHomeTotalSelected){
                await Model.SelectedBet.deleteOne({userId:req.user._id,eventId:req.body.eventId,line:line});
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_SELECTED_BET_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getSelectedBet(req, res) {
    try {

        let dataToSend={};
        let finalBetData=[];
        let riskAmount=constant.DEFAULT_RISK_AMOUNT;
        let userData=await Model.User.findOne({_id:req.user._id},{bankRoll:1});
        let betData=await Model.SelectedBet.find({
            userId:req.user._id
        },{__v:0,createdAt:0,updatedAt:0,isBlocked:0,isDeleted:0},{}).sort({_id:-1});
        finalBetData=await getAllEventDataById(betData);
        let message= messages.USER_NO_SELECTED_BET_SUCCESSFULLY;
        if(betData && betData.length){
            message= messages.USER_SELECTED_BET_SUCCESSFULLY;
        }
        if(userData && userData.bankRoll){
            riskAmount=parseFloat(((1*userData.bankRoll)/100).toFixed(2));
        }
        dataToSend.riskAmount=riskAmount;
        dataToSend.betData=finalBetData ||[];
        if(finalBetData.length){
            return universalFunction.sendResponse(req, res, statusCode.SUCCESS,message,dataToSend);
        }
        else{
            return universalFunction.sendResponse(req, res, statusCode.EMPTY_DATA,message,dataToSend);
        }
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function deleteSelectedBet(req, res) {
    try {
        const valid = await Validation.isUserValidate.deleteSelectedBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        await Model.SelectedBet.deleteOne({_id:mongoose.Types.ObjectId(req.body.selectedBetId)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS,messages.DELETED_SELECTED_BET_SUCCESSFULLY,{});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getBets(req, res) {
    try {
        const valid = await Validation.isUserValidate.getBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let dataToSend={};
        let eventData=[];
        let finalBetData=[];
        let pipeline=[
            {$match:{_id:mongoose.Types.ObjectId(req.query.betId)}},
            {$match:{isDeleted:false,isBlocked:false}}]
        pipeline.push({
                $lookup: {
                    from: 'betevents',
                    localField: '_id',
                    foreignField: 'betId',
                    as: 'bets'
                }
            })
        pipeline.push({
            $project:{
                _id:1,
                odds:1,
                tease:1,
                risk:1,
                toWin:1,
                isWin:1,
                islose:1,
                betType:1,
                userType:1,
                allocation:1,
                bets:1
            }
        })
        const betData = await Model.Bet.aggregate(pipeline);
        if(betData && betData.length && betData[0].bets && betData[0].bets.length){
            eventData=await getAllEventDataByIds(betData[0].bets);
            for(let i=0;i<betData[0].bets.length;i++){
                finalBetData[i]=betData[0].bets[i];
                finalBetData[i].eventObj=_.find(eventData,{event_id:betData[0].bets[i].eventId});
            }
        }
        dataToSend.betData=finalBetData;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, betData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllBets(req, res) {
    try {
        const valid = await Validation.isUserValidate.getAllBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.query.pageNo-1) || constant.DEFAULT_SKIP;
        let limit= constant.DEFAULT_LIMIT;
        skip=skip*limit
        let dataToSend={};
        let criteria={isDeleted:false,isBlocked:false};
        let pipeline=[{
            $match:{isDeleted:false,isBlocked:false}
        }]
        if(req.query.userId){
            criteria.userId=mongoose.Types.ObjectId(req.query.userId)
            pipeline.push({$match:{userId:mongoose.Types.ObjectId(req.query.userId)}})
        }

        if(req.query.startDate && req.query.startDate){
            criteria.betDate= {
                $gte: new Date(moment(req.query.startDate).startOf('day')),
                $lte: new Date(moment(req.query.endDate).endOf('day')),
              };
              pipeline.push({$match:{
                betDate:{
                    $gte: new Date(moment(req.query.startDate).startOf('day')),
                    $lte: new Date(moment(req.query.endDate).endOf('day')),
                  }
              }});
        }
        if(req.query.eventId){
            criteria.eventId=req.query.eventId;
            pipeline.push({
                $match:{eventId:req.query.eventId}
            })
        }
        if(req.query.userType){
            criteria.userType=req.query.userType;
            pipeline.push({
                $match:{userType:req.query.userType}
            })
        }
        pipeline.push({$sort:{_id:-1}});
        pipeline.push({$skip:skip});
        pipeline.push({$limit:limit});
        pipeline.push({
                $lookup: {
                    from: 'bets',
                    localField: 'betId',
                    foreignField: '_id',
                    as: 'bets'
                }
            })
        pipeline.push({
            $project:{
                _id:1,
                userId:1,
                betId:1,
                userType:1,
                betType:1,
                eventId:1,
                sportId:1,
                line:1,
                SelectedBet:1,
                betDate:1,
                isEventComplete:1,
                allocation:{$arrayElemAt:["$bets.allocation",0]},
                total:1,
                spread:1,
                money:1,
                tease:{$arrayElemAt:["$bets.tease",0]},
                odds:{$arrayElemAt:["$bets.odds",0]},
                risk:{$arrayElemAt:["$bets.risk",0]},
                toWin:{$arrayElemAt:["$bets.toWin",0]},
                isWin:{$arrayElemAt:["$bets.isWin",0]},
                islose:{$arrayElemAt:["$bets.islose",0]},
            }
        })
        const betEventCount = await Model.BetEvent.countDocuments(criteria);
        const betEventData = await Model.BetEvent.aggregate(pipeline);
        let eventData=await getAllEventDataByIds(betEventData);
        let finalBetData=[];
        if(req.query.isEventDataGet=='true'){
            for(let i=0;i<betEventData.length;i++){
                finalBetData[i]=betEventData[i];
                finalBetData[i].eventObj=_.find(eventData,{event_id:betEventData[i].eventId});
            }
        }else{
            finalBetData=betEventData;
        }
        dataToSend.betEventData=finalBetData ;
        dataToSend.totalPages=Math.ceil(betEventCount/limit) ||0;
        if(finalBetData && finalBetData.length){
            return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
        }else{
            return universalFunction.sendResponse(req, res, statusCode.EMPTY_DATA, messages.DATA_NOT_FOUND, dataToSend);
        }
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function addStraightBets(req, res) {
    try {
        const valid = await Validation.isUserValidate.addStraightBets(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let bets=req.body.bets ||[];
        let duplicateEventWithLine=false;
        let betEventObjCheck={};
        let lineError=false;
        for(let i=0;i<bets.length;i++){
            let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(betEventObjCheck.hasOwnProperty(bets[i].eventId+"-"+line)){
                duplicateEventWithLine=true;
            }else{
                betEventObjCheck[bets[i].eventId+"-"+line]=bets[i].eventId;
            }
            if(!line){
                lineError=true;
            }
        }

        if(lineError){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        if(duplicateEventWithLine){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_SAME_BET);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1,bankRoll:1});
        if(userData && userData.bankRoll<=0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO);
        }

        for(let i=0;i<bets.length;i++){
            let betObj={};
            betObj.userId=req.user._id;
            betObj.userType=userData.userType;
            betObj.betType='STRAIGHT';
            betObj.betDate=req.body.betDate;
            betObj.odds=bets[i].odds;
            betObj.risk=bets[i].risk;
            betObj.toWin=bets[i].toWin;

            let allocation=0;
            if(userData.bankRoll){
                allocation=parseFloat(((betObj.risk/userData.bankRoll)*100).toFixed(2));
            }
            betObj.allocation=allocation;

            let betEventObj={};
            betEventObj.userId=req.user._id;
            betEventObj.userType=userData.userType;
            betEventObj.betType='STRAIGHT';
            betEventObj.betDate=req.body.betDate;
            betEventObj.eventId=bets[i].eventId;
            betEventObj.sportId=bets[i].sportId;
            betEventObj.total=bets[i].total;
            betEventObj.spread=bets[i].spread;
            betEventObj.money=bets[i].money;
            betEventObj.SelectedBet=bets[i].SelectedBet;
            betEventObj.line=null;
            if(betEventObj.SelectedBet.isHomeTotalSelected || betEventObj.SelectedBet.isAwayTotalSelected){
                betEventObj.line='TOTAL';
            }
            if(betEventObj.SelectedBet.isHomeMoneySelected || betEventObj.SelectedBet.isAwayMoneySelected){
                betEventObj.line='MONEYLINE';
            }
            if(betEventObj.SelectedBet.isHomeSpreadSelected || betEventObj.SelectedBet.isAwaySpreadSelected){
                betEventObj.line='SPREAD';
            }

            let betData=await new Model.Bet(betObj).save();
            process.emit('scheduledBet',betData)
            betEventObj.betId=betData._id;
            let  betEventData=await new Model.BetEvent(betEventObj).save();
            process.emit('scheduledBetEvent',betEventData)
        }
        await Model.SelectedBet.deleteMany({userId:mongoose.Types.ObjectId(req.user._id)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_BET_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function addParlayBets(req, res) {
    try {
        const valid = await Validation.isUserValidate.addParlayBets(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let bets=req.body.bets ||[];
        let duplicateEventWithLine=false;
        let lineError=false;
        let betEventObjCheck={};

        for(let i=0;i<bets.length;i++){
            let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(betEventObjCheck.hasOwnProperty(bets[i].eventId+"-"+line)){
                duplicateEventWithLine=true;
            }else{
                betEventObjCheck[bets[i].eventId+"-"+line]=bets[i].eventId;
            }
            if(!line){
                lineError=true;
            }
        }
        if(lineError){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        if(duplicateEventWithLine){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_SAME_BET);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1,bankRoll:1});
        if(userData && userData.userType =='ANALYST'){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_CREATE_ONLY_STRAIGHT_BET);
        }
        if(userData && userData.bankRoll<=0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO);
        }
        let betObj={};
            betObj.userId=req.user._id;
            betObj.userType=userData.userType;
            betObj.betType='PARLAY';
            betObj.betDate=req.body.betDate;
            betObj.odds=req.body.odds;
            betObj.risk=req.body.risk;
            betObj.toWin=req.body.toWin;

            let allocation=0;
            if(userData.bankRoll){
                allocation=parseFloat(((betObj.risk/userData.bankRoll)*100).toFixed(2));
            }
            betObj.allocation=allocation;

        let betData=await new Model.Bet(betObj).save();
        process.emit('scheduledBet',betData)
        for(let i=0;i<bets.length;i++){
            let betEventObj={};
            betEventObj.userId=req.user._id;
            betEventObj.userType=userData.userType;
            betEventObj.betType='PARLAY';
            betEventObj.betDate=req.body.betDate;
            betEventObj.eventId=bets[i].eventId;
            betEventObj.sportId=bets[i].sportId;
            betEventObj.total=bets[i].total;
            betEventObj.spread=bets[i].spread;
            betEventObj.money=bets[i].money;
            betEventObj.SelectedBet=bets[i].SelectedBet;
            betEventObj.line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                betEventObj.line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                betEventObj.line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                betEventObj.line='SPREAD';
            }

            betEventObj.betId=betData._id;
            let betEventData=await new Model.BetEvent(betEventObj).save();
            process.emit('scheduledBetEvent',betEventData)

        }
        await Model.SelectedBet.deleteMany({userId:mongoose.Types.ObjectId(req.user._id)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_BET_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function addTeaserBets(req, res) {
    try {
        const valid = await Validation.isUserValidate.addTeaserBets(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let bets=req.body.bets ||[];
        let duplicateEventWithLine=false;
        let lineError=false;
        let betEventObjCheck={};

        if(req.body.risk !=undefined && req.body.risk==0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.RISK_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO);
        }
        if(req.body.odds !=undefined && req.body.odds==0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ODDS_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO);
        }
        if(req.body.tease !=undefined && req.body.tease==0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.TEASE_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO);
        }
        for(let i=0;i<bets.length;i++){
            let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(betEventObjCheck.hasOwnProperty(bets[i].eventId+"-"+line)){
                duplicateEventWithLine=true;
            }else{
                betEventObjCheck[bets[i].eventId+"-"+line]=bets[i].eventId;
            }
            if(!line){
                lineError=true;
            }
        }
        if(lineError){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        if(duplicateEventWithLine){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_SAME_BET);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1,bankRoll:1});
        if(userData && userData.userType =='ANALYST'){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_CREATE_ONLY_STRAIGHT_BET);
        }
        if(userData && userData.bankRoll<=0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO);
        }
        let betObj={};
            betObj.userId=req.user._id;
            betObj.userType=userData.userType;
            betObj.betType='TEASER';
            betObj.betDate=req.body.betDate;
            betObj.odds=req.body.odds;
            betObj.risk=req.body.risk;
            betObj.toWin=req.body.toWin;
            betObj.tease=req.body.tease;
            let allocation=0;
            if(userData.bankRoll){
                allocation=parseFloat(((betObj.risk/userData.bankRoll)*100).toFixed(2));
            }
            betObj.allocation=allocation;

            let betData=await new Model.Bet(betObj).save();
            process.emit('scheduledBet',betData)
        for(let i=0;i<bets.length;i++){

            let betEventObj={};
            betEventObj.userId=req.user._id;
            betEventObj.userType=userData.userType;
            betEventObj.betType='TEASER';
            betEventObj.betDate=req.body.betDate;
            betEventObj.eventId=bets[i].eventId;
            betEventObj.sportId=bets[i].sportId;
            betEventObj.total=bets[i].total;
            betEventObj.spread=bets[i].spread;
            betEventObj.money=bets[i].money;
            betEventObj.SelectedBet=bets[i].SelectedBet;
            betEventObj.line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                betEventObj.line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                betEventObj.line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                betEventObj.line='SPREAD';
            }

            betEventObj.betId=betData._id;
            let betEventData=await new Model.BetEvent(betEventObj).save();
            process.emit('scheduledBetEvent',betEventData)

        }
        await Model.SelectedBet.deleteMany({userId:mongoose.Types.ObjectId(req.user._id)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_BET_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function updateStraightBet(req, res) {
    try {
        const valid = await Validation.isUserValidate.updateStraightBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let bankRoll=0;
        let line=null;
        if(req.body.SelectedBet.isHomeTotalSelected || req.body.SelectedBet.isAwayTotalSelected){
            line='TOTAL';
        }
        if(req.body.SelectedBet.isHomeMoneySelected || req.body.SelectedBet.isAwayMoneySelected){
            line='MONEYLINE';
        }
        if(req.body.SelectedBet.isHomeSpreadSelected || req.body.SelectedBet.isAwaySpreadSelected){
            line='SPREAD';
        }
        if(!line){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1,bankRoll:1});
        if(userData && userData.bankRoll<=0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO);
        }


        let betData=await  Model.Bet.findOne({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:req.user._id
        });

        let betObj={};
        let betEventObj={};
        if(betData && betData.isEventComplete){
            betObj.profit=0;
            betObj.loss=0;
            betObj.isDraw=false;
            betObj.isWin=false;
            betObj.islose=false;
            betObj.isEventComplete=false;
            if(betData.isWin){
                bankRoll=-(betData.profit);
            }
            if(betData.islose){
                bankRoll=betData.loss;
            }
        }
        if(req.body.odds !=undefined){
            betObj.odds=req.body.odds;
        }
        if(req.body.risk !=undefined){
            betObj.risk=req.body.risk;

            let allocation=0;
            if(userData.bankRoll){
                allocation=parseFloat(((betObj.risk/userData.bankRoll)*100).toFixed(2));
            }
            betObj.allocation=allocation;
        }
        if(req.body.toWin !=undefined){
            betObj.toWin=req.body.toWin;
        }

        await  Model.Bet.update({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:req.user._id
        },{$set:betObj});
        if(betData.isEventComplete)
        process.emit('scheduledBet',{_id:req.body.betId});

        await Model.User.update({
            userId:req.user._id
        },{$inc:{bankRoll:bankRoll}});
        if(req.body.SelectedBet && req.body.betEventId){
            betEventObj.SelectedBet=req.body.SelectedBet;
            betEventObj.line=line;
            if(betData && betData.isEventComplete){
                betEventObj.isDraw=false;
                betEventObj.isWin=false;
                betEventObj.islose=false;
                betEventObj.isEventComplete=false;
            }
            if(req.body.total !=undefined){
                betEventObj.total=req.body.total;
            }
            if(req.body.spread !=undefined){
                betEventObj.spread=req.body.spread;
            }
            if(req.body.money !=undefined){
                betEventObj.money=req.body.money;
            }
            let betEventData=await  Model.BetEvent.update({
                _id:mongoose.Types.ObjectId(req.body.betEventId),
                userId:req.user._id});
            if(betEventData.isEventComplete)
                process.emit('scheduledBetEvent',{_id:req.body.betEventId});

            await  Model.BetEvent.update({
                _id:mongoose.Types.ObjectId(req.body.betEventId),
                userId:req.user._id
            },{$set:betEventObj});
        }
        await Model.SelectedBet.deleteMany({userId:mongoose.Types.ObjectId(req.user._id)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.BET_UPDATED_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function updateParleyAndTeaserBet(req, res) {
    try {
        const valid = await Validation.isUserValidate.updateParleyAndTeaserBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let bankRoll=0;
        let bets=req.body.bets ||[];
        let duplicateEventWithLine=false;
        let lineError=false;
        let betEventObjCheck={};
        let userData=await Model.User.findOne({
            _id:req.user._id,
            isDeleted:false
        },{userType:1})
        if(userData =='ANALYST'){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        for(let i=0;i<bets.length;i++){
            let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(betEventObjCheck.hasOwnProperty(bets[i].eventId+"-"+line)){
                duplicateEventWithLine=true;
            }else{
                betEventObjCheck[bets[i].eventId+"-"+line]=bets[i].eventId;
            }
            if(!line){
                lineError=true;
            }
        }
        if(lineError){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        if(duplicateEventWithLine){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_SAME_BET);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1,bankRoll:1});
        if(userData && userData.userType =='ANALYST'){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_CREATE_ONLY_STRAIGHT_BET);
        }
        if(userData && userData.bankRoll<=0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO);
        }
        let betData=await  Model.Bet.findOne({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:req.user._id
        });
        let betObj={};
        let betEventObj={};
        if(betData && betData.isEventComplete){
            betObj.profit=0;
            betObj.loss=0;
            betObj.isDraw=false;
            betObj.isWin=false;
            betObj.islose=false;
            betObj.isEventComplete=false;
            if(betData.isWin){
                bankRoll=-(betData.profit);
            }
            if(betData.islose){
                bankRoll=betData.loss;
            }
        }
        if(req.body.odds !=undefined){
            betObj.odds=req.body.odds;
        }
        if(req.body.risk !=undefined){
            betObj.risk=req.body.risk;
            let allocation=0;
            if(userData.bankRoll){
                allocation=parseFloat(((betObj.risk/userData.bankRoll)*100).toFixed(2));
            }
            betObj.allocation=allocation;
        }
        if(req.body.toWin !=undefined){
            betObj.toWin=req.body.toWin;
        }
        await Model.Bet.update({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:req.user._id
        },{$set:betObj});
        await Model.User.update({
            userId:req.user._id
        },{$inc:{bankRoll:bankRoll}});
        if(betData.isEventComplete)
        process.emit('scheduledBet',{_id:req.body.betId})

        if(bets.length){
            for(let i=0;i<bets.length;i++){
                let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(bets[i].total !=undefined){
                betEventObj.total=bets[i].total;
            }
            if(bets[i].spread !=undefined){
                betEventObj.spread=bets[i].spread;
            }
            if(bets[i].money !=undefined){
                betEventObj.money=bets[i].money;
            }
            if(bets[i].SelectedBet){
                betEventObj.SelectedBet=bets[i].SelectedBet;
                betEventObj.line=line;
            }
            if(betData && betData.isEventComplete){
                betEventObj.isDraw=false;
                betEventObj.isWin=false;
                betEventObj.islose=false;
                betEventObj.isEventComplete=false;
            }
            let betEventData=await  Model.BetEvent.update({
                _id:mongoose.Types.ObjectId(req.body.betEventId),
                userId:req.user._id});
            if(betEventData.isEventComplete)
                process.emit('scheduledBetEvent',{_id:req.body.betEventId});

            await  Model.BetEvent.update({
                _id:mongoose.Types.ObjectId(bets[i].betEventId),
                userId:req.user._id
            },{$set:betEventObj});
            }
        }
        await Model.SelectedBet.deleteMany({userId:mongoose.Types.ObjectId(req.user._id)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.BET_UPDATED_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function updateTeaserBet(req, res) {
    try {
        const valid = await Validation.isUserValidate.updateTeaserBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let bankRoll=0;
        let bets=req.body.bets ||[];
        let duplicateEventWithLine=false;
        let lineError=false;
        let betEventObjCheck={};

        if(req.body.risk !=undefined && req.body.risk==0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.RISK_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO);
        }
        if(req.body.odds !=undefined && req.body.odds==0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ODDS_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO);
        }
        if(req.body.tease !=undefined && req.body.tease==0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.TEASE_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO);
        }
        for(let i=0;i<bets.length;i++){
            let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(betEventObjCheck.hasOwnProperty(bets[i].eventId+"-"+line)){
                duplicateEventWithLine=true;
            }else{
                betEventObjCheck[bets[i].eventId+"-"+line]=bets[i].eventId;
            }
            if(!line){
                lineError=true;
            }
        }
        if(lineError){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_ATLEST_ONE_BET);
        }
        if(duplicateEventWithLine){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_SELECTED_SAME_BET);
        }
        let userData=await Model.User.findOne({_id:req.user._id},{userType:1,bankRoll:1});
        if(userData && userData.userType =='ANALYST'){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_CREATE_ONLY_STRAIGHT_BET);
        }
        if(userData && userData.bankRoll<=0){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO);
        }
        let betData=await  Model.Bet.findOne({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:req.user._id
        });
        let betObj={};
        let betEventObj={};
        if(betData && betData.isEventComplete){
            betObj.profit=0;
            betObj.loss=0;
            betObj.isDraw=false;
            betObj.isWin=false;
            betObj.islose=false;
            betObj.isEventComplete=false;
            if(betData.isWin){
                bankRoll=-(betData.profit);
            }
            if(betData.islose){
                bankRoll=betData.loss;
            }
        }
        if(req.body.odds !=undefined){
            betObj.odds=req.body.odds;
        }
        if(req.body.risk !=undefined){
            betObj.risk=req.body.risk;
            let allocation=0;
            if(userData.bankRoll){
                allocation=parseFloat(((betObj.risk/userData.bankRoll)*100).toFixed(2));
            }
            betObj.allocation=allocation;
        }
        if(req.body.toWin !=undefined){
            betObj.toWin=req.body.toWin;
        }
        if(req.body.tease !=undefined){
            betObj.tease=req.body.tease;
        }
        await Model.Bet.update({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:req.user._id
        },{$set:betObj});
        if(betData.isEventComplete)
        process.emit('scheduledBet',{_id:req.body.betId})

        await Model.User.update({
            userId:req.user._id
        },{$inc:{bankRoll:bankRoll}});
        if(bets.length){
            for(let i=0;i<bets.length;i++){
                let line=null;
            if(bets[i].SelectedBet.isHomeTotalSelected || bets[i].SelectedBet.isAwayTotalSelected){
                line='TOTAL';
            }
            if(bets[i].SelectedBet.isHomeMoneySelected || bets[i].SelectedBet.isAwayMoneySelected){
                line='MONEYLINE';
            }
            if(bets[i].SelectedBet.isHomeSpreadSelected || bets[i].SelectedBet.isAwaySpreadSelected){
                line='SPREAD';
            }
            if(bets[i].total !=undefined){
                betEventObj.total=bets[i].total;
            }
            if(bets[i].spread !=undefined){
                betEventObj.spread=bets[i].spread;
            }
            if(bets[i].money !=undefined){
                betEventObj.money=bets[i].money;
            }
            if(bets[i].SelectedBet){
                betEventObj.SelectedBet=bets[i].SelectedBet;
                betEventObj.line=line;
            }
            if(betData && betData.isEventComplete){
                betEventObj.isDraw=false;
                betEventObj.isWin=false;
                betEventObj.islose=false;
                betEventObj.isEventComplete=false;
            }
            let betEventData=await  Model.BetEvent.update({
                _id:mongoose.Types.ObjectId(req.body.betEventId),
                userId:req.user._id});
            if(betEventData.isEventComplete)
                process.emit('scheduledBetEvent',{_id:req.body.betEventId});

            await  Model.BetEvent.update({
                _id:mongoose.Types.ObjectId(bets[i].betEventId),
                userId:req.user._id
            },{$set:betEventObj});
            }
        }
        await Model.SelectedBet.deleteMany({userId:mongoose.Types.ObjectId(req.user._id)});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.BET_UPDATED_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function deleteBet(req, res) {
    try {
        const valid = await Validation.isUserValidate.deleteBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let betData=await Model.Bet.findOne({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:mongoose.Types.ObjectId(req.user._id),isDeleted:false});
        if(!betData){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.BET_ALREADY_DELETED);
        }
        await  Model.Bet.update({
            _id:mongoose.Types.ObjectId(req.body.betId),
            userId:mongoose.Types.ObjectId(req.user._id)
        },{$set:{isDeleted:true}});
        await Model.BetEvent.update({
            betId:mongoose.Types.ObjectId(req.body.betId),
            userId:mongoose.Types.ObjectId(req.user._id)
        },{$set:{isDeleted:true}},{multi:true});

        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.BET_DELETED_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getAllStraightBets(req, res) {
    try {
        const valid = await Validation.isUserValidate.getAllStraightBet(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.query.pageNo-1) || constant.DEFAULT_SKIP;
        let limit= constant.DEFAULT_LIMIT;
        skip=skip*limit
        let dataToSend={};
        let criteria={isDeleted:false,isBlocked:false,betType:'STRAIGHT'};
        let pipeline=[{
            $match:{isDeleted:false,isBlocked:false,betType:'STRAIGHT'}
        }]
        if(req.query.userId){
            criteria.userId=mongoose.Types.ObjectId(req.query.userId)
            pipeline.push({$match:{userId:mongoose.Types.ObjectId(req.query.userId)}})
        }
        if(req.query.startDate && req.query.startDate){
            criteria.betDate= {
                $gte: new Date(moment(req.query.startDate).startOf('day')),
                $lte: new Date(moment(req.query.endDate).endOf('day')),
              };
              pipeline.push({$match:{
                betDate:{
                    $gte: new Date(moment(req.query.startDate).startOf('day')),
                    $lte: new Date(moment(req.query.endDate).endOf('day')),
                  }
              }});
        }
        pipeline.push({$sort:{_id:-1}});
        pipeline.push({$skip:skip});
        pipeline.push({$limit:limit});
        pipeline.push({
                $lookup: {
                    from: 'betevents',
                    localField: '_id',
                    foreignField: 'betId',
                    as: 'bets'
                }
            })
        pipeline.push({
            $project:{
                _id:1,
                total:1,
                spread:1,
                money:1,
                odds:1,
                risk:1,
                toWin:1,
                isWin:1,
                islose:1,
                SelectedBet:{$arrayElemAt:["$bets.SelectedBet",0]},
                SelectedBetId:{$arrayElemAt:["$bets._id",0]},
                eventId:{$arrayElemAt:["$bets.eventId",0]},
                sportId:{$arrayElemAt:["$bets.sportId",0]},
            }
        })
        const betCount = await Model.Bet.countDocuments(criteria);
        const betData = await Model.Bet.aggregate(pipeline);
        let eventData=await getAllEventDataByIds(betData);
        let finalBetData=[];
        for(let i=0;i<betData.length;i++){
            finalBetData[i]=betData[i];
            finalBetData[i].eventObj=_.find(eventData,{event_id:betData[i].eventId});
        }
        dataToSend.betData=finalBetData ;
        dataToSend.totalPages=Math.ceil(betCount/limit) ||0;
        if(finalBetData.length){
            return universalFunction.sendResponse(req, res, statusCode.SUCCESS,message,dataToSend);
        }
        else{
            return universalFunction.sendResponse(req, res, statusCode.EMPTY_DATA,message,dataToSend);
        }
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
/*
RUNDOWN API'S
*/
async function getEventBySportsDate(req, res) {
    try {
        const valid = await Validation.isUserValidate.getEventBySportsDate(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let dataToSend={};
        let selectedBetData=[];
        var options = {
            method: 'GET',
            url: `${constant.RUNDOWN_API_URL}/sports/${req.body.sportId}/events/${req.body.date}?include=all_periods&include=scores`,
            headers: {
                'x-rapidapi-key': constant.RUNDOWN_API_TOKEN
             },
             apiName:constant.RUNDOWN_API_NAME.SPORTS_BY_DATE
            };
            dataToSend =await requestSend(options);
            selectedBetData =await Model.SelectedBet.find({userId:req.user._id},
                {
                    eventId:1,
                    line:1,
                    isHomeTotalSelected:1,
                    isAwayTotalSelected:1,
                    isHomeMoneySelected:1,
                    isAwayMoneySelected:1,
                    isHomeSpreadSelected:1,
                    isAwaySpreadSelected:1
                },
                {isDeleted:false,isBlocked:false})
                var selectObj={};
                for(let i=0;i<selectedBetData.length;i++){
                    if(selectObj.hasOwnProperty(selectedBetData[i].eventId)){
                        selectObj[selectedBetData[i].eventId]=JSON.parse(JSON.stringify(selectedBetData[i]));
                        if(selectedBetData[i].line=='TOTAL'){
                        selectObj[selectedBetData[i].eventId].isHomeTotalSelected=selectedBetData[i].isHomeTotalSelected;
                        selectObj[selectedBetData[i].eventId].isAwayTotalSelected=selectedBetData[i].isAwayTotalSelected;
                        }
                        if(selectedBetData[i].line=='SPREAD'){
                        selectObj[selectedBetData[i].eventId].isHomeSpreadSelected=selectedBetData[i].isHomeSpreadSelected;
                        selectObj[selectedBetData[i].eventId].isAwaySpreadSelected=selectedBetData[i].isAwaySpreadSelected;
                        }
                        if(selectedBetData[i].line=='MONEYLINE'){
                        selectObj[selectedBetData[i].eventId].isHomeMoneySelected=selectedBetData[i].isHomeMoneySelected;
                        selectObj[selectedBetData[i].eventId].isAwayMoneySelected=selectedBetData[i].isAwayMoneySelected;
                        }
                        delete selectObj[selectedBetData[i].eventId].line;
                    }else{
                        selectObj[selectedBetData[i].eventId]=JSON.parse(JSON.stringify(selectedBetData[i]));
                        delete selectObj[selectedBetData[i].eventId].line;
                    }
                }
            if(dataToSend && dataToSend.events && dataToSend && dataToSend.events.length){
                for(let i=0;i<dataToSend.events.length;i++){
                    if(dataToSend.events[i].event_id){
                        let selectObjOwn={
                            isHomeTotalSelected:false,
                            isAwayTotalSelected:false,
                            isHomeMoneySelected:false,
                            isAwayMoneySelected:false,
                            isHomeSpreadSelected:false,
                            isAwaySpreadSelected:false};
                        if(selectObj.hasOwnProperty(dataToSend.events[i].event_id)){
                            selectObjOwn=selectObj[dataToSend.events[i].event_id];
                        }
                        dataToSend.events[i].SelectedBet=selectObjOwn;
                    }else{
                        dataToSend.events[i].SelectedBet={isHomeTotalSelected:false,
                            isAwayTotalSelected:false,
                            isHomeMoneySelected:false,
                            isAwayMoneySelected:false,
                            isHomeSpreadSelected:false,
                            isAwaySpreadSelected:false};
                    }
                    if(dataToSend && dataToSend.events[i].lines){
                        dataToSend.events[i].lines=Object.values(dataToSend.events[i].lines)
                    }
                    if(dataToSend && dataToSend.events[i].line_periods){
                        dataToSend.events[i].line_periods=Object.values(dataToSend.events[i].line_periods)
                    }
                   let lines= dataToSend.events[i].lines || [];
                   let line_periods=dataToSend.events[i].line_periods || [];
                   let final_line_periods=[];
                   let final_line=[];
                   for(let i=0;i<lines.length;i++){
                       if(lines[i] && lines[i].affiliate){
                           let affiliate_id=lines[i].affiliate.affiliate_id || 0;

                           switch(affiliate_id){
                               case constant.AFFILIATED_LIST.DIMES_5:
                               final_line.push(lines[i]);
                               break;
                               case constant.AFFILIATED_LIST.BOVADA:
                                final_line.push(lines[i]);
                               break;
                               case constant.AFFILIATED_LIST.PINNACLE:
                                final_line.push(lines[i]);
                               break;
                               case constant.AFFILIATED_LIST.BET_ONLINE:
                                final_line.push(lines[i]);
                               break;
                               case constant.AFFILIATED_LIST.BOOKMARKER:
                                final_line.push(lines[i]);
                               break;
                               }
                           }
                    }
                    for(let i=0;i<line_periods.length;i++){
                        if(line_periods[i].period_full_game && line_periods[i].period_full_game.affiliate){
                            let affiliate_id=line_periods[i].period_full_game.affiliate.affiliate_id || 0;

                            switch(affiliate_id){
                                case constant.AFFILIATED_LIST.DIMES_5:
                                final_line_periods.push(line_periods[i].period_full_game);
                                break;
                                case constant.AFFILIATED_LIST.BOVADA:
                                final_line_periods.push(line_periods[i].period_full_game);
                                break;
                                case constant.AFFILIATED_LIST.PINNACLE:
                                final_line_periods.push(line_periods[i].period_full_game);
                                break;
                                case constant.AFFILIATED_LIST.BET_ONLINE:
                                final_line_periods.push(line_periods[i].period_full_game);
                                break;
                                case constant.AFFILIATED_LIST.BOOKMARKER:
                                final_line_periods.push(line_periods[i].period_full_game);
                                break;
                            }
                        }
                    }
                    dataToSend.events[i].lines=final_line_periods || [];
                    dataToSend.events[i].line_periods=final_line || []
                 }
            }
            if(!dataToSend){
                return universalFunction.sendResponse(req, res, statusCode.RUNDOWN_ERROR, messages.RUNDOWN_ERROR, {});
            }else{
                return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
            }
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};

async function getEvent(req, res) {
    try {
        const valid = await Validation.isUserValidate.getEvent(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        console.log("getEvent",req.body)
        let dataToSend={};
        var options = {
            method: 'GET',
            url: `${constant.RUNDOWN_API_URL}/events/${req.body.eventId}?include=all_periods&include=scores`,
            headers: {
                'x-rapidapi-key': constant.RUNDOWN_API_TOKEN
             },
             apiName:constant.RUNDOWN_API_NAME.EVENT
            };

            dataToSend =await requestSend(options);
            if(dataToSend && dataToSend.lines){
                dataToSend.lines=Object.values(dataToSend.lines)
            }
            if(dataToSend && dataToSend.line_periods){
                dataToSend.line_periods=Object.values(dataToSend.line_periods)
                let line_periods=dataToSend.line_periods || [];
                let final_line_periods=[];
                let money_line=[];
                let spred_line=[];
                let total_line=[];
                for(let i=0;i<line_periods.length;i++){
                    if(line_periods[i].period_full_game && line_periods[i].period_full_game.affiliate){
                        let affiliate_id=line_periods[i].period_full_game.affiliate.affiliate_id || 0;

                        switch(affiliate_id){
                            case constant.AFFILIATED_LIST.DIMES_5:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                            case constant.AFFILIATED_LIST.BOVADA:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                            case constant.AFFILIATED_LIST.PINNACLE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                            case constant.AFFILIATED_LIST.BET_ONLINE:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                            case constant.AFFILIATED_LIST.BOOKMARKER:
                            final_line_periods.push(line_periods[i].period_full_game);
                            break;
                        }
                    }
                }
                for(let j=0;j<final_line_periods.length;j++){
                    if(final_line_periods[j].moneyline){
                        money_line.push(final_line_periods[j].moneyline.moneyline_away);
                        money_line.push(final_line_periods[j].moneyline.moneyline_home)
                    }
                    if(final_line_periods[j].spread){
                        spred_line.push(final_line_periods[j].spread.point_spread_away);
                        spred_line.push(final_line_periods[j].spread.point_spread_home)
                    }
                    if(final_line_periods[j].total){
                        total_line.push(final_line_periods[j].total.total_over);
                        total_line.push(final_line_periods[j].total.total_under);
                    }
                }

                dataToSend.money_line=money_line || [];
                dataToSend.spred_line=spred_line || [];
                dataToSend.total_line=total_line || [];
                dataToSend.line_periods=final_line_periods || [];
            }
            if(!dataToSend){
                return universalFunction.sendResponse(req, res, statusCode.RUNDOWN_ERROR, messages.RUNDOWN_ERROR, {});
            }else{
                return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
            }

    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getAllSports(req, res) {
    try {
        let dataToSend={};
        let finalSportsData=[];
        var options = {
            method: 'GET',
            url: `${constant.RUNDOWN_API_URL}/sports`,
            headers: {
                'x-rapidapi-key': constant.RUNDOWN_API_TOKEN
             },
             apiName:constant.RUNDOWN_API_NAME.SPORTS
            };

        let sportsData =await requestSend(options);
        if(sportsData && sportsData.sports && sportsData.sports.length){
            for(let i=0;i<sportsData.sports.length;i++){
                let obj={};
                switch(sportsData.sports[i].sport_id){
                    case constant.SPORTS_LIST.NCAAF:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'NCAAF'}
                        finalSportsData.push(obj);
                    break;
                    case constant.SPORTS_LIST.NFL:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'NFL'}
                        finalSportsData.push(obj);
                    break;
                    case constant.SPORTS_LIST.MLB:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'MLB'}
                        finalSportsData.push(obj);
                    break;
                    case constant.SPORTS_LIST.NBA:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'NBA'}
                        finalSportsData.push(obj);
                    break;
                    case constant.SPORTS_LIST.NCAAM:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'NCAAM'}
                        finalSportsData.push(obj);
                    break;
                    case constant.SPORTS_LIST.NHL:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'NHL'}
                        finalSportsData.push(obj);
                    break;
                    case constant.SPORTS_LIST.MLS:
                        obj={sport_id:sportsData.sports[i].sport_id,sport_name:'MLS'}
                        finalSportsData.push(obj);
                    break;

                }
            }
        }
        dataToSend.sports=finalSportsData || [];
        if(!sportsData){
            return universalFunction.sendResponse(req, res, statusCode.RUNDOWN_ERROR, messages.RUNDOWN_ERROR, {});
        }
        else if(finalSportsData.length==0){
            return universalFunction.sendResponse(req, res, statusCode.EMPTY_DATA, messages.DATA_NOT_FOUND, {});
        }else{
            return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
        }
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function addContactUs(req, res) {
    try {
        const valid = await Validation.isUserValidate.addContactUs(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        await Model.ContactUs(req.body).save();
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.QUERY_SUBMITTED, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function totalProfit(lastBets,userId){
 try {
     let dataToSend={
         profit:0,
         netProfit:0,
         netProfitPercentage:0,
         risk:0
     }
     let skip=0;
     let limit=0;
     let pipeline=[
         {$match:{userId:mongoose.Types.ObjectId(userId)}},
         {
             $sort:{
                 createdAt:-1
             }
         }
     ];
     switch(lastBets){
         case constant.LAST_BETS.LAST_10_BETS:
             limit=10;
             break;
         case constant.LAST_BETS.LAST_50_BETS:
            limit=50;
            break;
         case constant.LAST_BETS.LAST_100_BETS:
            limit=100;
            break;
         case constant.LAST_BETS.ALL_BETS:
            break;
         default:
            break;
     };
     pipeline.push({
        $skip:skip
       })
     if(limit){
        pipeline.push({
            $limit:limit
         });
     }
     pipeline.push(
         {
         $group:{
             _id:null,
             profit:{$sum:"$profit"},
             loss:{$sum:"$loss"},
             risk:{$sum:"$risk"},
         }
     });
     let data=await Model.Bet.aggregate(pipeline);
     if(data && data.length){
        dataToSend.profit=data[0].profit ||0;
        dataToSend.loss=data[0].loss || 0;
        dataToSend.risk=data[0].risk ||0;
        dataToSend.netProfit=(dataToSend.profit-dataToSend.loss) || 0;
        if(dataToSend.risk)
        dataToSend.netProfitPercentage=(dataToSend.netProfit/dataToSend.risk)*100;
        else
        dataToSend.netProfitPercentage=0;
    }
     return dataToSend;
 } catch (error) {

 }
};
async function totalProfitBySport(lastBets,userId,sportId,betType){
    try {
        let dataToSend={
            profit:0,
            netProfit:0,
            netProfitPercentage:0,
            risk:0
        };
        let skip=0;
        let limit=0;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };
        pipeline.push({
                $lookup: {
                    from: 'betevents',
                    localField: '_id',
                    foreignField: 'betId',
                    as: 'bets'
                }
        })
        if(betType){
            pipeline.push({
                $match:{
                    'betType':betType
                }
            })
        }
        if(sportId){
            pipeline.push({
                $match:{
                    'bets.sportId':sportId
                }
            })
        }
        pipeline.push({
         $skip:skip
        })
        if(limit){
           pipeline.push({
               $limit:limit
            });
        }
        pipeline.push(
            {
            $group:{
                _id:null,
                profit:{$sum:"$profit"},
                risk:{$sum:"$risk"},
                loss:{$sum:"$loss"}
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        if(data && data.length){
            dataToSend.profit=data[0].profit || 0;
            dataToSend.loss=data[0].loss || 0;
            dataToSend.risk=data[0].risk || 0;
            dataToSend.netProfit=(dataToSend.profit-dataToSend.loss) || 0;
            if(dataToSend.risk)
            dataToSend.netProfitPercentage=(dataToSend.netProfit/dataToSend.risk)*100;
            else
            dataToSend.netProfitPercentage=0;
        }
        return dataToSend;
    } catch (error) {
        console.log(error)
    }
};
async function totalBetRecord(lastBets,userId){
    try {
        let count=0;
        let skip=0;
        let limit=0;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };
        pipeline.push({
            $skip:skip
        })
        if(limit){
            pipeline.push({
                $limit:limit
             });
         }
         pipeline.push({
            $group:{
                _id:null,
                count:{$sum:1}
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        if(data && data.length){
            count=data[0].count || 0
        }
        return count;
    } catch (error) {

    }
};
async function graphForlastBets(lastBets,userId){
    try {
        let finalData=[];
        let skip=0;
        let limit=0;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };

        pipeline.push(
            {$match:{
                isEventComplete:true
            }
            });
            pipeline.push({
                $skip:skip
               })
        if(limit){
            pipeline.push({
                $limit:limit
             });
         }
         pipeline.push({
            $project:{
                _id:1,
                profit:1,
                loss:1
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        if(data && data.length){
            for(let i=0;i<data.length;i++){
                finalData.push(data[i].profit);
                finalData.push(data[i].loss);
            }
        }
        return finalData;
    } catch (error) {

    }
};
async function graphForlastBetsBySportId(lastBets,userId,sportId){
    try {
        let finalData=[];
        let skip=0;
        let limit=0;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };

        pipeline.push(
            {$match:{
                isEventComplete:true
            }
            });
            pipeline.push({
                $lookup: {
                    from: 'betevents',
                    localField: '_id',
                    foreignField: 'betId',
                    as: 'bets'
                }
            })
            if(sportId){
                pipeline.push({
                    $match:{
                        'bets.sportId':sportId
                    }
                })
            }
            pipeline.push({
                $skip:skip
               })
        if(limit){
            pipeline.push({
                $limit:limit
             });
         }
         pipeline.push({
            $project:{
                _id:1,
                profit:1,
                loss:1
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        if(data && data.length){
            for(let i=0;i<data.length;i++){
                finalData.push(data[i].profit);
                finalData.push(data[i].loss);
            }
        }
        return finalData;
    } catch (error) {

    }
};
async function totalBetRecordBySport(lastBets,userId,sportId){
    try {
        let count=0;
        let skip=0;
        let limit=0;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };
        pipeline.push({
            $lookup: {
                from: 'betevents',
                localField: '_id',
                foreignField: 'betId',
                as: 'bets'
            }
        })
        if(sportId){
            pipeline.push({
                $match:{
                    'bets.sportId':sportId
                }
            })
        }
        pipeline.push({
            $skip:skip
           })
        if(limit){
            pipeline.push({
                $limit:limit
             });
         }
         pipeline.push({
            $group:{
                _id:null,
                count:{$sum:1}
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        count= data?data.count:0;
        return count;
    } catch (error) {

    }
};
async function winLoseBetRecord(lastBets,userId,isWin){
    try {
        let count=0;
        let skip=0;
        let limit=0;
        let islose=isWin?false:true;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };

        pipeline.push(
            {$match:{
                isWin:isWin,
                islose:islose,
                isEventComplete:true
            }
            });
            pipeline.push({
                $skip:skip
               })
        if(limit){
            pipeline.push({
                $limit:limit
             });
         }
         pipeline.push({
            $group:{
                _id:null,
                count:{$sum:1}
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        if(data && data.length){
            count=data[0].count ||0;
        }
        return count;
    } catch (error) {

    }
};
async function winLoseBetRecordBySport(lastBets,userId,sportId,betType,isWin){
    try {
        let count=0;
        let skip=0;
        let limit=0;
        let islose=isWin?false:true;
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        switch(lastBets){
            case constant.LAST_BETS.LAST_10_BETS:
                limit=10;
                break;
            case constant.LAST_BETS.LAST_50_BETS:
               limit=50;
               break;
            case constant.LAST_BETS.LAST_100_BETS:
               limit=100;
               break;
            case constant.LAST_BETS.ALL_BETS:
               break;
            default:
               break;
        };
        if(betType){
            pipeline.push({
                $match:{
                    betType:betType
                }
            })
        }
        pipeline.push({
            $lookup: {
                from: 'betevents',
                localField: '_id',
                foreignField: 'betId',
                as: 'bets'
            }
        })
        if(sportId){
            pipeline.push({
                $match:{
                    'bets.sportId':sportId
                }
            })
        }
        pipeline.push(
        {$match:{
            isWin:isWin,
            islose:islose,
            isEventComplete:true
        }
        });
        pipeline.push({
            $skip:skip
           })
        if(limit){
            pipeline.push({
                $limit:limit
             });
         }
         pipeline.push({
            $group:{
                _id:null,
                count:{$sum:1}
            }
        });
        let data=await Model.Bet.aggregate(pipeline);
        if(data && data.length){
            count=data[0].count ||0;
        }
        return count;
    } catch (error) {
        console.log("errr###",error)
    }
};
async function myStraightTrackedPicks(userId,pageNo,limit){
    try {
        let dataToSend={
            betData:[],
            totalPages:0
        };
        let skip=pageNo || constant.DEFAULT_SKIP;
        limit=limit || constant.DEFAULT_LIMIT ;
        skip=skip*limit
        let criteria={
            userId:mongoose.Types.ObjectId(userId)
        }
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            },
            {
               $skip:skip
            },
            {
                $limit:limit
            }
        ];
        pipeline.push({
            $lookup: {
                from: 'betevents',
                localField: '_id',
                foreignField: 'betId',
                as: 'bets'
            }
        })
        pipeline.push({
            $project:{
                _id:1,
                total:1,
                spread:1,
                money:1,
                odds:1,
                risk:1,
                toWin:1,
                isWin:1,
                islose:1,
                SelectedBet:{$arrayElemAt:["$bets.SelectedBet",0]},
                SelectedBetId:{$arrayElemAt:["$bets._id",0]},
                eventId:{$arrayElemAt:["$bets.eventId",0]},
                sportId:{$arrayElemAt:["$bets.sportId",0]},
            }
        })
        const betCount = await Model.Bet.countDocuments(criteria);
        const betData = await Model.Bet.aggregate(pipeline);
        let eventData=await getAllEventDataByIds(betData);
        let finalBetData=[];
        for(let i=0;i<betData.length;i++){
            finalBetData[i]=betData[i];
            finalBetData[i].eventObj=_.find(eventData,{event_id:betData[i].eventId});
        }
        dataToSend.betData=finalBetData ;
        dataToSend.totalPages=Math.ceil(betCount/limit) ||0;
        return dataToSend;
    } catch (error) {

    }
};
async function todayAction(userId,todayDate){
    try {
        let finalBetData=[];
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {$match:{
                createdAt:{
                    $gte: new Date(moment(todayDate).startOf('day')),
                    $lte: new Date(moment(todayDate).endOf('day')),
                }
            }},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        pipeline.push({
            $lookup: {
                from: 'betevents',
                localField: '_id',
                foreignField: 'betId',
                as: 'bets'
            }
        })
        pipeline.push({
            $project:{
                _id:1,
                total:1,
                spread:1,
                money:1,
                odds:1,
                risk:1,
                toWin:1,
                isWin:1,
                islose:1,
                profit:1,
                loss:1,
                isDraw:1,
                bets:"$bets"
            }
        })
        const betData = await Model.Bet.aggregate(pipeline);
        let arrayBetData=[];
        if(betData && betData.length){
            for(let i=0;i<betData.length;i++){
                if(betData[i].bets && betData[i].bets.length){
                    for(let j=0;j<betData[i].bets.length;j++){
                        let obj={
                            eventId:betData[i].bets[j].eventId
                        }
                        arrayBetData.push(obj)
                    }
                }
            }
        }
        let eventData=await getAllEventDataByIds(arrayBetData);
        for(let i=0;i<betData.length;i++){
            finalBetData[i]=betData[i];
            if(betData[i].bets && betData[i].bets.length){
                for(let j=0;j<betData[i].bets.length;j++){
                    finalBetData[i].bets[j].eventObj=_.find(eventData,{event_id:betData[i].bets[j].eventId});
                }
            }
        }
        return finalBetData;
    } catch (error) {

    }
};
async function allPicksBySports(userId,pageNo,limit,sportId,betType){
    try {
        let dataToSend={
            betData:[],
            totalPages:0
        };
        let skip=pageNo !=undefined?pageNo: constant.DEFAULT_SKIP;
        limit=limit !=undefined?limit: constant.DEFAULT_LIMIT ;
        skip=skip*limit
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        if(betType){
            pipeline.push({
                $match:{
                    betType:betType
                }
            })
        }
        pipeline.push({
            $lookup: {
                from: 'betevents',
                localField: '_id',
                foreignField: 'betId',
                as: 'bets'
            }
        })
        if(sportId){
            pipeline.push({
                $match:{'bets.sportId':sportId}
            })
        }

        pipeline.push({
            $project:{
                _id:1,
                total:1,
                spread:1,
                money:1,
                odds:1,
                risk:1,
                toWin:1,
                isWin:1,
                islose:1,
                profit:1,
                loss:1,
                isDraw:1,
                allocation:1,
                bets:{$arrayElemAt:["$bets",0]},
            }
        })

        let betCountData = await Model.Bet.aggregate(pipeline);

        pipeline.push({
            $skip:skip
         },
         {
             $limit:limit
         })
         const betData = await Model.Bet.aggregate(pipeline);
         let betCount=betCountData.length || 0;
        let arrayBetData=[];
        if(betData && betData.length){
            for(let i=0;i<betData.length;i++){
                if(betData[i].bets && betData[i].bets.eventId){
                        let obj={
                            eventId:betData[i].bets.eventId
                        }
                        arrayBetData.push(obj)
                }
            }
        }
        let eventData=await getAllEventDataByIds(arrayBetData);
        let finalBetData=[];
        for(let i=0;i<betData.length;i++){
            finalBetData[i]=betData[i];
            if(betData[i].bets && betData[i].bets.eventId){
                    finalBetData[i].bets.eventObj=_.find(eventData,{event_id:betData[i].bets.eventId});
            }
        }
        dataToSend.betData=finalBetData ;
        dataToSend.totalPages=Math.ceil(betCount/limit) ||0;
        return dataToSend;
    } catch (error) {
        //console.log(error)
    }
};
async function allPicksBySportsByDate(userId,sportId,betType,todayDate){
    try {
        let dataToSend={
            betData:[],
            totalPages:0
        };
        let pipeline=[
            {$match:{userId:mongoose.Types.ObjectId(userId)}},
            {
                $sort:{
                    createdAt:-1
                }
            }
        ];
        pipeline.push({
            $match:{
                createdAt:{
                    $gte: new Date(moment(todayDate).startOf('day')),
                    $lte: new Date(moment(todayDate).endOf('day')),
                }
            }
         })

        if(betType){
            pipeline.push({
                $match:{
                    betType:betType
                }
            })
        }
        pipeline.push({
            $lookup: {
                from: 'betevents',
                localField: '_id',
                foreignField: 'betId',
                as: 'bets'
            }
        })
        if(sportId){
            pipeline.push({
                $match:{'bets.sportId':sportId}
            })
        }

        pipeline.push({
            $project:{
                _id:1,
                total:1,
                spread:1,
                money:1,
                odds:1,
                risk:1,
                toWin:1,
                isWin:1,
                islose:1,
                profit:1,
                loss:1,
                isDraw:1,
                allocation:1,
                bets:{$arrayElemAt:["$bets",0]}
            }
        })

        const betData = await Model.Bet.aggregate(pipeline);
        let arrayBetData=[];
        if(betData && betData.length){
            for(let i=0;i<betData.length;i++){
                if(betData[i].bets && betData[i].bets.eventId){
                        let obj={
                            eventId:betData[i].bets.eventId
                        }
                        arrayBetData.push(obj)
                }
            }
        }
        let eventData=await getAllEventDataByIds(arrayBetData);
        let finalBetData=[];
        for(let i=0;i<betData.length;i++){
            finalBetData[i]=betData[i];
                if(betData[i].bets && betData[i].bets.eventId){
                    finalBetData[i].bets.eventObj=_.find(eventData,{event_id:betData[i].bets.eventId});
            }
        }
        dataToSend.betData=finalBetData ;
        return dataToSend;
    } catch (error) {

    }
};
async function getallAnalyst(req, res) {
    try {
        let dataToSend={};
        let criteria={isDeleted:false};
        let finalUserData=[];
        const valid = await Validation.isUserValidate.validategetAllAnalyst(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        criteria.userType='ANALYST';
        let skip=parseInt(req.body.pageNo-1) || constant.DEFAULT_SKIP;
        let limit=100 || constant.DEFAULT_LIMIT;
        skip=skip*limit;
        const count = await Model.User.countDocuments(criteria);
        const userData = await Model.User.find(criteria,{
            _id:1,
            firstName:1,
            lastName:1,
            userName:1
        }).limit(limit).skip(skip).sort({createdAt: -1});
        let data=null;
        if(userData && userData.length){
            finalUserData=await Promise.all(
                userData.map(async ur => {
                let percentageData=await totalProfitBySport(0,ur._id,null,null);
                let obj={
                    _id:ur._id,
                    firstName:ur.firstName,
                    lastName:ur.lastName,
                    userName:ur.userName,
                    percentage:percentageData.netProfitPercentage
                }
                return obj;
            }));
        }
        dataToSend.userData=finalUserData || [];
        dataToSend.totalPages =Math.ceil(count/limit) || 0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getUserPerformance(req, res) {
    try {
        let dataToSend={};
        let criteria={isDeleted:false};
        const valid = await Validation.isUserValidate.validategetUserPerformance(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let lastBet=req.body.lastBet || 10;
        let userId=req.user._id;
        let todayDate=req.body.todayDate;
        let analystData=await Model.User.findOne({
            _id:mongoose.Types.ObjectId(req.body.userId),isDeleted:false},
            {firstName:1,
            lastName:1,
            userName:1,
            description:1
        });
        dataToSend.analystData=analystData || {};
        let profitData=await totalProfit(lastBet,userId);
        let profit=profitData.profit ;
        let risk = profitData.risk ;
        dataToSend.profit=profit || 0;
        let profitPercentage=risk?((profit/risk)*100):0;
        dataToSend.profitPercentage=profitPercentage || 0;

        let graphData=await graphForlastBets(lastBet,userId);
        dataToSend.graphData=graphData || [];
        let winRecordData=await winLoseBetRecord(lastBet,userId,true);
        let winCount=winRecordData;
        dataToSend.winCount=winCount;
        let loseRecordData=await winLoseBetRecord(lastBet,userId,false);
        let loseCount=loseRecordData;
        dataToSend.loseCount=loseCount;
        let totalBetRecorCount=await totalBetRecord(lastBet,userId);
        let recordPercentage=totalBetRecorCount?((winCount/totalBetRecorCount)*100):0;
        dataToSend.recordPercentage=recordPercentage || 0;

        let todayActionData=await todayAction(userId,todayDate);
        dataToSend.todayActionData=todayActionData || [];

        let pickData=await allPicksBySports(userId,0,5,null,null);
        dataToSend.pickData=pickData.betData || [];
        let data=await Promise.all([
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NCAAF,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NCAAF,null,false),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NFL,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NFL,null,false),

            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.MLB,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.MLB,null,false),

            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NBA,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NBA,null,false),

            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NCAAM,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NCAAM,null,false),

            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NHL,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.NHL,null,false),

            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.MLS,null,true),
            winLoseBetRecordBySport(lastBet,userId,constant.SPORTS_LIST.MLS,null,false),

            winLoseBetRecordBySport(lastBet,userId,null,'PARLAY',true),
            winLoseBetRecordBySport(lastBet,userId,null,'PARLAY',false),

            winLoseBetRecordBySport(lastBet,userId,null,'TEASER',true),
            winLoseBetRecordBySport(lastBet,userId,null,'TEASER',false)
           ]);
        dataToSend.sports=[
            {
                sportName:"NCAAF",
                sportId:constant.SPORTS_LIST.NCAAF,
                win:data[0],
                lose:data[1]
            },
            {
                sportName:"NFL",
                sportId:constant.SPORTS_LIST.NFL,
                win:data[2],
                lose:data[3]
            },
            {
                sportName:"MLB",
                sportId:constant.SPORTS_LIST.MLB,
                win:data[4],
                lose:data[5]
            },
            {
                sportName:"NBA",
                sportId:constant.SPORTS_LIST.NBA,
                win:data[6],
                lose:data[7]
            },
            {
                sportName:"NCAAM",
                sportId:constant.SPORTS_LIST.NCAAM,
                win:data[8],
                lose:data[9]
            },
            {
                sportName:"NHL",
                sportId:constant.SPORTS_LIST.NHL,
                win:data[10],
                lose:data[11]
            },
            {
                sportName:"MLS",
                sportId:constant.SPORTS_LIST.MLS,
                win:data[12],
                lose:data[13]
            },
            {
                sportName:"Paralys",
                sportId:0,
                win:data[14],
                lose:data[15]
            },
            {
                sportName:"Teasers",
                sportId:0,
                win:data[16],
                lose:data[17]
            }
        ];

        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getAllPick(req, res) {
    try {
        let dataToSend={};
        const valid = await Validation.isUserValidate.validategetAllPick(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.query.pageNo-1) || constant.DEFAULT_SKIP;
        let limit=100 || constant.DEFAULT_LIMIT;
        skip=skip*limit;
        let userId=req.body.userId;
        let betType=req.body.betType || null;
        let sportId=req.body.sportId || null;

        let pickData=await allPicksBySports(userId,skip,limit,sportId,betType);
        dataToSend.pickData=pickData.betData || [];
        dataToSend.totalPages=pickData.totalPages || 0;

        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllPickBySport(req, res) {
    try {
        let dataToSend={};
        const valid = await Validation.isUserValidate.validategetAllPick(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.query.pageNo-1) || constant.DEFAULT_SKIP;
        let limit=100 || constant.DEFAULT_LIMIT;
        skip=skip*limit;
        let userId=req.body.userId;
        let betType=req.body.betType || null;
        let sportId=req.body.sportId || null;
        let pickData=await allPicksBySports(userId,skip,limit,sportId,betType);
        dataToSend.pickData=pickData.betData || [];
        dataToSend.totalPages=pickData.totalPages || 0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};

async function getAnalystPerformance(req, res) {
    try {
        let dataToSend={};
        const valid = await Validation.isUserValidate.validategetAnalystPerformance(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let lastBet=req.body.lastBet || 10;
        let userId=req.body.userId;
        let betType=req.body.betType || null;
        let sportId=req.body.sportId || null;
        let profitData=await totalProfit(lastBet,userId);
        let profit=profitData.profit ;
        let risk = profitData.risk ;
        dataToSend.profit=profit || 0;
        let profitPercentage=risk?((profit/risk)*100):0;
        dataToSend.profitPercentage=profitPercentage;
        let graphData=await graphForlastBets(lastBet,userId);
        dataToSend.graphData=graphData;

        let winRecordData=await winLoseBetRecord(lastBet,userId,true);
        let winCount=winRecordData;
        dataToSend.winCount=winCount;
        let loseRecordData=await winLoseBetRecord(lastBet,userId,false);
        let loseCount=loseRecordData;
        dataToSend.loseCount=loseCount;
        let totalBetRecordData=await totalBetRecord(lastBet,userId);
        let recordPercentage=totalBetRecordData?((winCount/totalBetRecordData)*100):0;
        dataToSend.recordPercentage=recordPercentage;

        let pickData=await allPicksBySports(userId,0,5,null,betType);
        dataToSend.pickData=pickData.betData || [];
        let algorithemData=await Model.Algorithem.find({
            userId:req.body.userId,
            isDeleted:false,
            isBlocked:false
        })
        let finalAlgorithemData=[];
        if(algorithemData && algorithemData.length){
            finalAlgorithemData=await Promise.all(
            algorithemData.map(async al => {
                let percentageData=await totalProfitBySport(50,userId,null,betType);
                return {algorithem:al,percentage:percentageData.netProfitPercentage};
            }));
        }

        dataToSend.algorithemData=finalAlgorithemData || [];

        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};

async function getAnalystPerformanceBySport(req, res) {
    try {
        let dataToSend={};
        const valid = await Validation.isUserValidate.validategetAnalystPerformanceBySport(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let finalAlgorithemData=[];
        let lastBet=req.body.lastBet || 10;
        let userId=req.body.userId;
        let todayDate=req.body.todayDate ;
        let sportId=req.body.sportId;
        let betType=req.body.betType || null;

        let profitData=await totalProfitBySport(lastBet,userId,sportId,betType);
        let profit=profitData.profit ;
        let risk = profitData.risk ;
        dataToSend.profit=profit || 0;
        let profitPercentage=risk?((profit/risk)*100):0;
        dataToSend.profitPercentage=profitPercentage;

        let winRecordData=await winLoseBetRecordBySport(lastBet,userId,sportId,null,true);
        let winCount=winRecordData;
        dataToSend.winCount=winCount;
        let loseRecordData=await winLoseBetRecordBySport(lastBet,userId,sportId,null,false);
        let loseCount=loseRecordData;
        dataToSend.loseCount=loseCount;
        let totalBetRecord=await totalBetRecordBySport(lastBet,userId,sportId);
        let recordPercentage=totalBetRecord?((winCount/totalBetRecord)*100):0;
        dataToSend.recordPercentage=recordPercentage;

        let graphData=await graphForlastBetsBySportId(lastBet,userId,sportId);
        dataToSend.graphData=graphData;


        let pickData=await allPicksBySportsByDate(userId,sportId,null,todayDate);
        dataToSend.pickData=pickData.betData || [];
        let algorithemData=await Model.Algorithem.find({
            userId:req.body.userId,
            _id:req.body.algorithemId,
            isDeleted:false,
            isBlocked:false
        })
        if(algorithemData && algorithemData.length){
            for(let i=0;i<algorithemData.length;i++){
                let obj={
                    _id:algorithemData[i]._id,
                    userId:algorithemData[i].userId,
                    name:algorithemData[i].name,
                    sport:algorithemData[i].sport,
                    sportId:algorithemData[i].sportId,
                    description:algorithemData[i].description
                }
                finalAlgorithemData.push(obj);
            }
        }
        dataToSend.algorithemData=finalAlgorithemData || [];

        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
