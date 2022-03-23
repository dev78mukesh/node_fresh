const mongoose = require('mongoose');
const _ = require('lodash');
const randomstring = require('randomstring');
const moment = require('moment');
const bcrypt = require('bcrypt');

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

exports.register = register;
exports.login = login;
exports.logout = logout;
exports.getProfile = getProfile;
exports.updateAdminProfile = updateAdminProfile;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.uploadFile = uploadFile;
exports.forgotChangePassword = forgotChangePassword;
exports.getAllNotification = getAllNotification;
exports.clearNotification = clearNotification;
exports.clearAllNotification = clearAllNotification;
exports.setAppVersion = setAppVersion;
exports.getAppVersion = getAppVersion;
exports.addUser=addUser;
exports.updateUserProfile=updateUserProfile;
exports.deleteBlockUnBlockDeactivateUserProfile=deleteBlockUnBlockDeactivateUserProfile;
exports.getUserProfile=getUserProfile;
exports.getAllUserProfile=getAllUserProfile;
exports.addAlgorithem=addAlgorithem;
exports.updateAlgorithem=updateAlgorithem;
exports.deleteAlgorithem=deleteAlgorithem;
exports.getAlgorithem=getAlgorithem;
exports.getAllAlgorithem=getAllAlgorithem;
exports.getBets=getBets;
exports.getAllBets=getAllBets;
exports.getAllContacts=getAllContacts;
exports.getDashboardCount=getDashboardCount;
exports.getDashboardGraph=getDashboardGraph;
exports.getDashboardAlgorithemGraph=getDashboardAlgorithemGraph;
exports.sendBulkNotification=sendBulkNotification;
/*
ADMIN API'S
*/
async function register(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateRegister(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let adminData = await Model.Admin.findOne({
            email: req.body.email,
            isDeleted: false
        });
        if (adminData)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.EMAIL_ALREDAY_EXIT);
        const password = await universalFunction.hashPasswordUsingBcrypt(req.body.password);
        req.body.password = password;
        let admin = await Model.Admin(req.body).save();
        let accessToken = await universalFunction.jwtSign(admin);
        admin = await Model.Admin.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(admin._id)
        }, {
            $set: {
                accessToken: accessToken
            }
        })
        admin.accessToken = accessToken;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_REGISTER_SUCCESSFULLY, admin);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function login(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateLogin(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const admin = await Model.Admin.findOne({
            email: req.body.email,
            isDeleted: false
        });
        if (!admin)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_EMAIL_PASSWORD);
        if (admin && admin.isBlocked)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ADMIN_BLOCKED);
        let password = await universalFunction.comparePasswordUsingBcrypt(req.body.password, admin.password);
        if (!password) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_PASSWORD);
        }
        let accessToken = await universalFunction.jwtSign(admin);
        admin.accessToken = accessToken;
        await Model.Admin.findOneAndUpdate({
            _id: admin._id
        }, {
            $set: {
                accessToken: accessToken
            }
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_LOGIN_SUCCESSFULLY, admin);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function logout(req, res) {
    try {
        let accessToken = await universalFunction.jwtSign(req.user);
        await Model.Admin.findOneAndUpdate({
            _id: req.user._id
        }, {
            accessToken: accessToken
        }, {});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_LOGOUT_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getProfile(req, res) {
    try {
        const adminData = await Model.Admin.findOne({
            _id: req.user._id
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, adminData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function updateAdminProfile(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateUpdateProfile(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let setObj = req.body;
        if (setObj.password) {
            const adminData = await Model.Admin.findOne({
                _id: req.user._id
            });
            let passwordValid = await universalFunction.comparePasswordUsingBcrypt(req.body.password, adminData.password);
            if (passwordValid) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.SAME_PASSWORD_NOT_ALLOWED);
            }
            const password = await universalFunction.hashPasswordUsingBcrypt(req.body.password);
            req.body.password = password;

        }
        if (setObj.email) {
            const adminData = await Model.Admin.findOne({
                _id: {
                    $nin: [req.user._id]
                },
                email: req.body.email,
                isDeleted: false
            });
            if (adminData)
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.EMAIL_ALREDAY_EXIT);
        }
        await Model.Admin.findOneAndUpdate({
            _id: req.user._id
        }, {
            $set: setObj
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_PROFILE_UPDATED_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function changePassword(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateChangePassword(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let setObj = req.body;
        const adminData = await Model.Admin.findOne({
            _id: req.user._id
        });
        let passwordValid = await universalFunction.comparePasswordUsingBcrypt(req.body.password, adminData.password);
        if (!passwordValid) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.OLD_PASSWORD_NOT_MATCH);
        }
        const password = await universalFunction.hashPasswordUsingBcrypt(req.body.newPassword);
        req.body.password = password;
        await Model.Admin.findOneAndUpdate({
            _id: req.user._id
        }, {
            $set: setObj
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_CHANGED_PASSWORD_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function forgotPassword(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateForgotPassword(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const admin = await Model.Admin.findOne({
            email: req.body.email,
            isDeleted: false,
            isBlocked: false
        });
        if (!admin)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.EMAIL_ID_DOES_NOT_EXISTS);

        const passwordResetToken = await universalFunction.generateRandomString(20);
        await Model.Admin.findOneAndUpdate({
            _id: admin._id
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
        const admin = await Model.Admin.findOne({
            passwordResetToken: req.body.passwordResetToken
        });
        if (!admin)
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.INVALID_PASSWORD_RESET_TOKEN);
        const passwordResetToken = await universalFunction.generateRandomString(20);
        const password = await universalFunction.hashPasswordUsingBcrypt(req.body.password);
        await Model.Admin.updateOne({
            _id: admin._id
        }, {
            $set: {
                password: password,
                passwordResetToken: passwordResetToken
            }
        })
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.PASSWORD_CHANGED_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function uploadFile(req, res) {
    try {
        let data = {};
        if (req.file && req.file.filename) {
            data.orignal = `${constant.FILE_PATH.ADMIN}/${req.file.filename}`;
            data.thumbNail = `${constant.FILE_PATH.ADMIN}/${req.file.filename}`;
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.FILE_UPLOADED_SUCCESSFULLY, data);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
NOTIFICATION API'S
*/
async function getAllNotification(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateNotificationIdWithPageNo(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip = parseInt(req.query.pageNo-1) || 0;
        let limit = constant.DEFAULT_LIMIT;
        skip=skip*limit
        
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
        if (req.query.notificationId != undefined) {
            pipeline.push({
                $match: {
                    _id: req.query.notificationId
                }
            });
            criteria._id =  req.query.notificationId;
        }
        const count = await Model.AdminNotification.countDocuments(criteria);
        const notificationData = await Model.AdminNotification.aggregate(pipeline);
        dataToSend.notificationData = notificationData;
        dataToSend.totalPages = Math.ceil(count/limit) || 0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function clearNotification(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateNotificationId(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        await Model.AdminNotification.findOneAndUpdate({
            _id: req.body.notificationId
        }, req.body);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_CLEAR_NOTIFICATION, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function clearAllNotification(req, res) {
    try {
        await Model.AdminNotification.update({
            receiverId: req.user._id
        }, req.body, {
            multi: true
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.ADMIN_CLEAR_ALL_NOTIFICATION, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};

/*
APP VERSIONING API'S
*/
async function setAppVersion(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateSetAppversion(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const query = {};
        const options = {
            new: true,
            upsert: true,
        };
        if (req.body.latestIOSVersion <= req.body.criticalIOSVersion ||
            req.body.latestAndroidVersion <= req.body.criticalAndroidVersion ||
            req.body.latestWebID <= req.body.criticalWebID) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.LATEST_VERSION_LESS_THEN_CRITICAL_VERSION);
        }
        await Model.AppVersion.findOneAndUpdate(query, req.body, options);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.APP_VERSION_ADDSUCCESFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAppVersion(req, res) {
    try {
        const appVersionData = await Model.AppVersion.findOne({});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, appVersionData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
USER API'S
*/
async function addUser(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateAddUser(req);
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
            req.body.image = `${constant.FILE_PATH.USER}/${req.file.filename}`;
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
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_SUCCESSFULLY, user);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function updateUserProfile(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateUpdateUserProfile(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let setObj = req.body;
        const user = await Model.User.findOne({
            _id: req.body.userId
        });
        if (setObj.password) {
            const userData = await Model.User.findOne({
                _id: req.body.userId
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
                    $nin: [req.body.userId]
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
                    $nin: [req.body.userId]
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
                    $nin: [req.body.userId]
                },
                phoneNo: req.body.phoneNo,
                countryCode: req.body.countryCode,
                isDeleted: false
            });
            if (userData) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.PHONE_NUMBER_ALREADY_EXISTS);
            }
        }
        
        if (req.file && req.file.filename) {
            setObj.image = `${constant.FILE_PATH.USER}/${req.file.filename}`;
        }
        await Model.User.findOneAndUpdate({
            _id: req.body.userId
        }, {
            $set: setObj
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_PROFILE_UPDATED_SUCCESSFULLY, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function deleteBlockUnBlockDeactivateUserProfile(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validateDeleteBlockUbBlockDeactivateUser(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let setObj ={};
        let message=null;
        if(req.body.isBlocked !=undefined){
            setObj.isBlocked=req.body.isBlocked;
            message=req.body.isBlocked?messages.USER_BLOCKED:messages.USER_UN_BLOCKED;
        }
        if(req.body.isDeleted !=undefined){
            setObj.isDeleted=req.body.isDeleted;
            message=messages.USER_DELETED;
        }
        if(req.body.isActive !=undefined){
            setObj.isActive=req.body.isActive;
            message=req.body.isActive?messages.USER_ACTIVE:messages.USER_UN_ACTIVE;
        }
        const userData = await Model.User.findOne({
            _id: req.body.userId,
            isDeleted:false
        });
        if(!userData){
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.USER_NOT_FOUND);
        }
        await Model.User.findOneAndUpdate({
            _id: req.body.userId
        }, {
            $set: setObj
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, message, {});
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getUserProfile(req, res) {
    try {
        const valid = await Validation.isAdminValidate.validategetUserProfile(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const userData = await Model.User.findOne({
            _id: req.body.userId
        });
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, userData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllUserProfile(req, res) {
    try {
        let dataToSend={};
        let criteria={isDeleted:false};
        const valid = await Validation.isAdminValidate.validategetAllUserProfile(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        if(req.body.userType !=undefined){
            criteria.userType=req.body.userType;
        }
        let skip=parseInt(req.body.pageNo-1) || constant.DEFAULT_SKIP;
        let limit=constant.DEFAULT_LIMIT;
        skip=skip*limit;
        if(req.body.search !=undefined){
            criteria.$or = [
                {
                    firstName: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                    lastName: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                    userName: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                  email: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
              ];
        }
        const count = await Model.User.countDocuments(criteria);
        const userData = await Model.User.find(criteria).limit(limit).skip(skip).sort({createdAt: -1});
        dataToSend.userData=userData || [];
        dataToSend.totalPages =Math.ceil(count/limit) || 0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
ALGORITHEM API'S
*/
async function addAlgorithem(req, res) {
    try {
        const valid = await Validation.isAdminValidate.addAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const algorithemName = await Model.Algorithem.findOne({
            userId: req.body.userId,
            name: req.body.name,
            isDeleted: false
        });
        if (algorithemName) {
            return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ALGORITHEM_NAME_ALREADY_EXISTS);
        }
            let userData=await Model.User.findOne({_id:req.body.userId},{userType:1});
            if(userData && userData.userType =='ANALYST'){
                let algorithemCount=await Model.Algorithem.findOne({
                    sportId:req.body.sportId,
                    userId: req.body.userId,
                    isDeleted:false
                })
                let objSport={
                    sport:req.body.sport || ""
                }
                if(algorithemCount){
                    return universalFunction.sendResponseCustom(req, res, statusCode.BAD_REQUEST, messages.YOU_ALREADY_ADDED_THIS_ALGORITHM,{},objSport);
                }
        }
        req.body.userId=req.body.userId;
        await new Model.Algorithem(req.body).save();
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.USER_ADD_ALGORITHEM_SUCCESSFULLY, {});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function updateAlgorithem(req, res) {
    try {
        const valid = await Validation.isAdminValidate.updateAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        if(req.body.name){
            const algorithemName = await Model.Algorithem.findOne({
                _id:{$nin:[req.body.algorithemId]},
                userId: req.body.userId,
                name: req.body.name,
                isDeleted: false
            });
            if (algorithemName) {
                return universalFunction.sendResponse(req, res, statusCode.BAD_REQUEST, messages.ALGORITHEM_NAME_ALREADY_EXISTS);
            }
        }
        if(req.body.sportId !=undefined){
            let userData=await Model.User.findOne({_id:req.body.userId},{userType:1});
            if(userData && userData.userType =='ANALYST'){
                let algorithemCount=await Model.Algorithem.findOne({
                    _id:{$nin:[req.body.algorithemId]},
                    sportId:req.body.sportId,
                    userId: req.body.userId,
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
            userId: req.body.userId
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
        const valid = await Validation.isAdminValidate.deleteAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        await Model.Algorithem.findOneAndUpdate({
            _id:req.body.algorithemId
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
        const valid = await Validation.isAdminValidate.getAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let pipeline=[
            {
            $match:{
                _id:mongoose.Types.ObjectId(req.body.algorithemId),
                isDeleted:false
            }
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
                    _id: 1,
                    userId: 1,
                    name:1,
                    sport:1,
                    description:1,
                    isBlocked:1,
                    sportId:1,
                    userName: {$arrayElemAt:["$userData.userName",0]},
                    firstName: {$arrayElemAt:["$userData.firstName",0]},
                    lastName: {$arrayElemAt:["$userData.lastName",0]},
                    email: {$arrayElemAt:["$userData.email",0]},
                    phoneNo: {$arrayElemAt:["$userData.phoneNo",0]},
                    countryCode: {$arrayElemAt:["$userData.countryCode",0]},
                    userType: {$arrayElemAt:["$userData.userType",0]},
                    bankRoll: {$arrayElemAt:["$userData.bankRoll",0]},
                    createdAt:1
                }
        }];
        let algorithemData = await Model.Algorithem.aggregate(pipeline);
        if(algorithemData && algorithemData.length){
            algorithemData=algorithemData[0];
        }else{
            algorithemData={};
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, algorithemData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllAlgorithem(req, res) {
    try {
        const valid = await Validation.isAdminValidate.getAllAlgorithem(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.body.pageNo-1) || constant.DEFAULT_SKIP;
        let limit= constant.DEFAULT_LIMIT;
        skip=skip*limit
        let dataToSend={};
        let pipeline=[{
            $match:{isDeleted:false}
        }]
        let criteria={isDeleted:false};
        if(req.body.userId){
            criteria.userId=mongoose.Types.ObjectId(req.body.userId);
            pipeline.push({$match:{userId:mongoose.Types.ObjectId(req.body.userId)}})
        }
        if(req.body.search !=undefined){
            criteria.$or = [
                {
                    name: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                    description: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                }
              ];
              
        }
        const algorithemCount = await Model.Algorithem.countDocuments(criteria);
        pipeline.push(
            {$sort:{_id:-1}},
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
            });
            if(req.body.search !=undefined){
                pipeline.push({
                    $match: {
                      '$or': [
                        {'name': {'$regex': '.*' + req.body.search + '.*', '$options': 'i'}},
                        {'description': {'$regex': '.*' + req.body.search + '.*', '$options': 'i'}}]
                    }
                  })
            }
            //{'$userData.userName': {'$regex': '.*' + req.body.search + '.*', '$options': 'i'}}
            pipeline.push(
            {
                $project: {
                    _id: 1,
                    userId: 1,
                    name:1,
                    sport:1,
                    description:1,
                    isBlocked:1,
                    sportId:1,
                    userName: {$arrayElemAt:["$userData.userName",0]},
                    firstName: {$arrayElemAt:["$userData.firstName",0]},
                    lastName: {$arrayElemAt:["$userData.lastName",0]},
                    email: {$arrayElemAt:["$userData.email",0]},
                    phoneNo: {$arrayElemAt:["$userData.phoneNo",0]},
                    countryCode: {$arrayElemAt:["$userData.countryCode",0]},
                    userType: {$arrayElemAt:["$userData.userType",0]},
                    bankRoll: {$arrayElemAt:["$userData.bankRoll",0]},
                    createdAt :1
                }
            })
        const algorithemData = await Model.Algorithem.aggregate(pipeline);
        dataToSend.algorithemData=algorithemData ||[];
        dataToSend.totalPages=Math.ceil(algorithemCount/limit) ||0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
/*
GET BETS API'S
*/
async function getBets(req, res) {
    try {
        const valid = await Validation.isAdminValidate.getBets(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const betData = await Model.Bet.findOne({_id:req.body.betId});
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, betData);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllBets(req, res) {
    try {
        const valid = await Validation.isAdminValidate.getAllBets(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.body.pageNo-1) || constant.DEFAULT_SKIP;
        let limit= constant.DEFAULT_LIMIT;
        skip=skip*limit
        let dataToSend={};
        let criteria={isDeleted:false,isBlocked:false};
        if(req.body.userId){
            criteria.userId=mongoose.Types.ObjectId(req.body.userId)
        }
        const betCount = await Model.Bet.countDocuments(criteria);
        const betData = await Model.Bet.find(criteria).limit(limit).skip(skip).sort({createdAt: -1});
        dataToSend.betData=betData ||[];
        dataToSend.totalPages=Math.ceil(betCount/limit) ||0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getAllContacts(req, res) {
    try {
        const valid = await Validation.isAdminValidate.getAllContactUs(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let skip=parseInt(req.body.pageNo-1) || constant.DEFAULT_SKIP;
        let limit= constant.DEFAULT_LIMIT;
        skip=skip*limit
        let dataToSend={};
        let criteria={isDeleted:false,isBlocked:false};
        if(req.body.search){
            req.body.search=req.body.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            criteria.$or = [
                {
                    name: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                    email: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                    subject: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                },
                {
                    message: {
                    $regex: req.body.search,
                    $options: 'i',
                  },
                }
              ];
        }
        const contactUsCount = await Model.ContactUs.countDocuments(criteria);
        const contactUsData = await Model.ContactUs.find(criteria).limit(limit).skip(skip).sort({createdAt: -1});
        dataToSend.contactUsData=contactUsData ||[];
        dataToSend.totalPages=Math.ceil(contactUsCount/limit) ||0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};

/*
DASHBOARD COUNT API'S
*/
async function getDashboardCount(req, res) {
    try{
        let criteria = {isDeleted:false};
        let dataToSend={};
        const countAlgorithem = await Model.Algorithem.countDocuments(criteria);
        criteria.createdAt={
            $gte: new Date(moment().subtract(48, "hours")),
            $lte: new Date()
        }
        const countAlgorithemLastFourtyEightHours = await Model.Algorithem.countDocuments(criteria);

        criteria = {isDeleted:false};
        criteria.userType='ANALYST';
        const countAnalyst = await Model.User.countDocuments(criteria);
        criteria.createdAt={
            $gte: new Date(moment().subtract(48, "hours")),
            $lte: new Date()
        }
        const countAnalystLastFourtyEightHours = await Model.User.countDocuments(criteria);

        criteria = {isDeleted:false};
        criteria.userType='ENTHUSIAST';
        const countEnthusiast = await Model.User.countDocuments(criteria);
        criteria.createdAt={
            $gte: new Date(moment().subtract(48, "hours")),
            $lte: new Date()
        }
        const countEnthusiastLastFourtyEightHours = await Model.User.countDocuments(criteria);

        criteria = {isDeleted:false};
        const countUser = await Model.User.countDocuments(criteria);
        criteria.createdAt={
            $gte: new Date(moment().subtract(48, "hours")),
            $lte: new Date()
        }
        const countUserLastFourtyEightHours = await Model.User.countDocuments(criteria);

        dataToSend.countUser=countUser || 0;
        dataToSend.countUserLastFourtyEightHours=countUserLastFourtyEightHours || 0;
        dataToSend.countAnalyst=countAnalyst || 0;
        dataToSend.countAnalystLastFourtyEightHours=countAnalystLastFourtyEightHours || 0;
        dataToSend.countEnthusiast=countEnthusiast || 0;
        dataToSend.countEnthusiastLastFourtyEightHours=countEnthusiastLastFourtyEightHours || 0;
        dataToSend.countAlgorithem=countAlgorithem || 0;
        dataToSend.countAlgorithemLastFourtyEightHours=countAlgorithemLastFourtyEightHours || 0;
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, dataToSend);
    } catch (error) {
        universalFunction.exceptionError(res);
    }
};
async function getDashboardGraph(req, res) {
    try{
        const valid = await Validation.isAdminValidate.getDashboardGraph(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let pipeline =[];
        if(req.body.userType){
            pipeline.push({$match:{userType:req.body.userType}})
        }
        
        if(req.body.startDate && req.body.endDate){
            pipeline.push({
                $match:{
                    createdAt: {
                        $gte: new Date(moment(req.body.startDate).startOf('day')),
                        $lte: new Date(moment(req.body.endDate).endOf('day')),
                      },
                }
            })
        }
        pipeline.push(
            { $group: {
                _id:{"$dateToString": { format: "%d", date: "$createdAt" }},
                createdAt:{$first:"$createdAt"},
                count: { "$sum": 1 }
                }
            },
            {
                $sort:{createdAt:-1}
            });
        const  userData= await Model.User.aggregate(pipeline);
        let data=[];
        for(let i=0;i<userData.length;i++){
        data.push([moment(userData[i].createdAt).format("DD-MMMM-YY"),(userData[i].count)])
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, data);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function getDashboardAlgorithemGraph(req, res) {
    try{
        const valid = await Validation.isAdminValidate.getDashboardAlgorithemGraph(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        let pipeline =[];
        
        if(req.body.startDate && req.body.endDate){
            pipeline.push({
                $match:{
                    createdAt: {
                        $gte: new Date(moment(req.body.startDate).startOf('day')),
                        $lte: new Date(moment(req.body.endDate).endOf('day')),
                      },
                }
            })
        }
        pipeline.push(
            { $group: {
                _id:{"$dateToString": { format: "%d", date: "$createdAt" }},
                createdAt:{$first:"$createdAt"},
                count: { "$sum": 1 }
                }
            },{
                $sort:{createdAt:-1}
            });
        const  algorithemData= await Model.Algorithem.aggregate(pipeline);
        let data=[];
        for(let i=0;i<algorithemData.length;i++){
        data.push([moment(algorithemData[i].createdAt).format("DD-MMMM-YY"),(algorithemData[i].count)])
        }
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.SUCCESS, data);
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};
async function sendChatBulkPushToUserDelayTime(userIds,skip,limit,payload,userType){
    setTimeout(async function () {
        console.log("delay chat 10 second");
        skip=skip+limit;
        userIds=[];
        let userData=await Model.User.find({isDeleted:false,userType:userType},{_id:1}).skip(skip).limit(limit);
        for(let i=0;i<userData.length;i++){
            userIds.push(mongoose.Types.ObjectId(userData[i]._id));
        }
        await sendBulkPushToUser(userIds,skip,limit,payload,userType);
      }, 5000);
};
async function sendBulkPushToUser(userIds,skip,limit,payload,userType){
    try {
            if(userIds && userIds.length){
                const userDeviceData=await Model.Device.find({userId:{$in:userIds}});
                if(userDeviceData && userDeviceData.length){
                for(let i=0;i<userDeviceData.length;i++){
                    if(userDeviceData[i].deviceType=='IOS'){
                       Service.PushNotificationService.sendIosPushNotification(payload);
                    }
                    else if(userDeviceData[i].deviceType=='ANDROID'){
                        Service.PushNotificationService.sendAndroidPushNotifiction(payload);
                    }
                    payload.receiverId=userDeviceData[i].userId;
                    payload.deviceToken=userDeviceData[i].deviceToken;
                }
                await sendChatBulkPushToUserDelayTime([],skip,limit,payload,userType);
                }else{
                    return true;
                }
            }else{
                return true
            }
    } catch (error) {
        return true;
    }
}
async function sendBulkNotification(req, res) {
    try{
        const valid = await Validation.isAdminValidate.sendBulkNotification(req);
        if (valid) {
            return universalFunction.validationError(res, valid);
        }
        const skip=0;
        const limit=10;
        let payload={
            title:req.body.title,
            message:req.body.message,
            body:req.body.message,
            eventType:'',
            socketType:'',
            adminId:req.user._id,
            isUserNotification:true,
            isNotificationSave:false
        }
        let userIds=[];
        let userData=await Model.User.find({isDeleted:false,
            userType:req.body.userType},{_id:1}).skip(skip).limit(limit);

        for(let i=0;i<userData.length;i++){
            userIds.push(mongoose.Types.ObjectId(userData[i]._id));
        }
        sendBulkPushToUser(userIds,skip,limit,payload,req.body.userType);
        return universalFunction.sendResponse(req, res, statusCode.SUCCESS, messages.NOTIFICATION_SEND_TO_USER,{});
    } catch (error) {
        console.log(error)
        universalFunction.exceptionError(res);
    }
};