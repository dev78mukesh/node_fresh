const joi = require('joi');
const universalFunction=require('../../lib/universal-function');

const validateLogin=async (req)=> {
    let loginSchema = joi.object().keys({
        email: joi.string().required(),
        password: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,loginSchema);
};
const validateRegister=async (req)=> {
    let registerSchema = joi.object().keys({
        firstName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        lastName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).optional(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).optional(),
        city: joi.string().optional().description('admin address city'),
        address: joi.string().optional().description('admin address city'),
        state: joi.string().optional().description('admin address state'),
        zipCode: joi.string().optional().description('zipcode of user address'),    
        email: joi.string().required(),
        password: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,registerSchema);
};
const validateUpdateProfile=async (req)=> {
    let updateProfileSchema = joi.object().keys({
        firstName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        lastName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).optional(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).optional(),
        city: joi.string().optional().description('admin address city'),
        address: joi.string().optional().description('admin address city'),
        state: joi.string().optional().description('admin address state'),
        zipCode: joi.string().optional().description('zipcode of user address'),    
        email: joi.string().optional(),
        password: joi.string().optional()
    });
    return await universalFunction.validateSchema(req.body,updateProfileSchema);
};
const validateChangePassword=async (req)=> {
    let changePasswordSchema = joi.object().keys({
        password: joi.string().required(),
        newPassword: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,changePasswordSchema);
};
const validateForgotPassword=async (req)=> {
    let forgotPasswordSchema = joi.object().keys({
        email: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,forgotPasswordSchema);
};
const validateForgotChangePassword=async (req)=> {
    let forgotChangePasswordSchema = joi.object().keys({
        passwordResetToken: joi.string().required(),
        password: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,forgotChangePasswordSchema);
};
const validateNotificationId=async (req)=> {
    let notificationSchema = joi.object().keys({
        notificationId: joi.string().length(24).required()
    });
    return await universalFunction.validateSchema(req.body,notificationSchema);
};
const validateNotificationIdWithPageNo=async (req)=> {
    let notificationSchema = joi.object().keys({
        notificationId: joi.string().length(24).optional(),
        pageNo:joi.number().min(1).optional(),
        isRead:joi.boolean().optional()
    });
    return await universalFunction.validateSchema(req.query,notificationSchema);
};
const validateVerifyOtpCode=async (req)=> {
    let verifyOtpCodeSchema = joi.object().keys({
        otpCode: joi.string().required(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).required(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).required()
    });
    return await universalFunction.validateSchema(req.body,verifyOtpCodeSchema);
};
const validateSetAppversion=async (req)=> {
    let validateSetAppversionSchema = joi.object().keys({
        latestIOSVersion: joi.number().required().description('Latest IOS version'),
        latestAndroidVersion: joi.number().required().description('Latest Android Version'),
        latestWebID: joi.number().optional().required('Latest Web Id'),
        criticalAndroidVersion: joi.number().required().description('Critical Android Version'),
        criticalIOSVersion: joi.number().required().description('Critical IOS Version'),
        criticalWebID: joi.number().required().description('Critical Web Id'),
        updateMessageAtPopup: joi.string().required().description('Update message to be shown in Popup'),
        updateTitleAtPopup: joi.string().required().description('Email of the person'),
        contactUs:joi.string().optional(),
        termsAndConditions:joi.string().optional(),
        privacyPolicy:joi.string().optional(),
    });
    return await universalFunction.validateSchema(req.body,validateSetAppversionSchema);
};

const validateAddUser=async (req)=> {
    let addUserSchema = joi.object().keys({
        firstName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        lastName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        description:joi.string().optional(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).optional(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).optional(),
        city: joi.string().optional().description('admin address city'),
        address: joi.string().optional().description('admin address city'),
        state: joi.string().optional().description('admin address state'),
        zipCode: joi.string().optional().description('zipcode of user address'),    
        bankRoll: joi.number().optional(),
        userType: joi.string().required().valid(['ANALYST','ENTHUSIAST']),
        email: joi.string().required(),
        userName: joi.string().required(),
        password: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,addUserSchema);
};
const validateUpdateUserProfile=async (req)=> {
    let updateUserProfileSchema = joi.object().keys({
        userId:joi.string().length(24).required().description('user id'),
        firstName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        lastName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).optional(),
        description:joi.string().optional(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).optional(),
        city: joi.string().optional().description('admin address city'),
        address: joi.string().optional().description('admin address city'),
        state: joi.string().optional().description('admin address state'),
        zipCode: joi.string().optional().description('zipcode of user address'),   
        bankRoll: joi.number().optional(),
        userType:joi.string().optional().valid(['SPECIAL','NORMAL']),
        gender:joi.string().optional().valid(['MALE','FEMALE','NO_PREFRENCE']),
        email: joi.string().optional(),
        userName: joi.string().optional(),
        password: joi.string().optional()
    });
    return await universalFunction.validateSchema(req.body,updateUserProfileSchema);
};
const validateDeleteBlockUbBlockDeactivateUser=async (req)=> {
    let deleteBlockUnBlockUserSchema = joi.object().keys({
        userId:joi.string().length(24).required().description('user id'),
        isBlocked: joi.boolean().optional(),
        isDeleted: joi.boolean().optional(),
        isActive: joi.boolean().optional(),
    });
    return await universalFunction.validateSchema(req.body,deleteBlockUnBlockUserSchema);
};
const validategetUserProfile=async (req)=> {
    let getUserProfileSchema = joi.object().keys({
        userId:joi.string().length(24).required().description('user id')
    });
    return await universalFunction.validateSchema(req.body,getUserProfileSchema);
};
const validategetAllUserProfile=async (req)=> {
    let getAllUserProfileSchema = joi.object().keys({
        pageNo: joi.number().min(1).optional(),
        search:joi.string().optional(),
        userType:joi.string().valid(['ANALYST','ENTHUSIAST']).optional(),
    });
    return await universalFunction.validateSchema(req.body,getAllUserProfileSchema);
};
const addAlgorithem=async (req)=> {
    let addAlgorithemSchema = joi.object().keys({
        userId:joi.string().length(24).required().description('user id'),
        name:joi.string().required().description('Algorithem name'),
        sport:joi.string().required().description('Algorithem sport'),
        sportId:joi.number().required(),
        description:joi.string().optional().description('Algorithem description')
    });
    return await universalFunction.validateSchema(req.body,addAlgorithemSchema);
};
const updateAlgorithem=async (req)=> {
    let updateAlgorithemSchema = joi.object().keys({
        algorithemId:joi.string().length(24).required().description('Algorithem id'),
        userId:joi.string().length(24).required().description('user id'),
        sportId:joi.number().optional(),
        name:joi.string().optional().description('Algorithem name'),
        sport:joi.string().optional().description('Algorithem sport'),
        description:joi.string().optional().description('Algorithem description')
    });
    return await universalFunction.validateSchema(req.body,updateAlgorithemSchema);
};
const deleteAlgorithem=async (req)=> {
    let deleteAlgorithemSchema = joi.object().keys({
        algorithemId:joi.string().length(24).required().description('Algorithem id')
    });
    return await universalFunction.validateSchema(req.body,deleteAlgorithemSchema);
};
const getAlgorithem=async (req)=> {
    let getAlgorithemSchema = joi.object().keys({
        algorithemId:joi.string().length(24).required().description('Algorithem id')
    });
    return await universalFunction.validateSchema(req.body,getAlgorithemSchema);
};
const getAllAlgorithem=async (req)=> {
    let getAllAlgorithemSchema = joi.object().keys({
        userId:joi.string().length(24).optional().description('user id'),
        search:joi.string().optional(),
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.body,getAllAlgorithemSchema);
};
/*
BETS API'S
*/
const getBets=async (req)=> {
    let getBetsSchema = joi.object().keys({
        betId:joi.string().length(24).required().description('Bets id')
    });
    return await universalFunction.validateSchema(req.body,getBetsSchema);
};
const getAllBets=async (req)=> {
    let getAllBetsSchema = joi.object().keys({
        userId:joi.string().length(24).optional().description('user id'),
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.body,getAllBetsSchema);
};
const getAllContactUs=async (req)=> {
    let getAllContactUsSchema = joi.object().keys({
        search:joi.string().optional(),
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.body,getAllContactUsSchema);
};
const getDashboardGraph=async (req)=> {
    let getDashboardGraphSchema = joi.object().keys({
        startDate:joi.date().optional(),
        endDate:joi.date().optional(),
        userType:joi.string().valid(['ANALYST','ENTHUSIAST']).optional(),
    });
    return await universalFunction.validateSchema(req.body,getDashboardGraphSchema);
};
const getDashboardAlgorithemGraph=async (req)=> {
    let getDashboardAlgorithemGraphSchema = joi.object().keys({
        startDate:joi.date().optional(),
        endDate:joi.date().optional(),
    });
    return await universalFunction.validateSchema(req.body,getDashboardAlgorithemGraphSchema);
};
const sendBulkNotification=async (req)=> {
    let sendBulkNotificationSchema = joi.object().keys({
        userType:joi.string().valid(['ANALYST','ENTHUSIAST']).required(),
        title:joi.string().required().description('Title'),
        message: joi.string().required().description('Message'),
    });
    return await universalFunction.validateSchema(req.body,sendBulkNotificationSchema);
};
module.exports = {
    validateLogin:validateLogin,
    validateRegister:validateRegister,
    validateUpdateProfile:validateUpdateProfile,
    validateChangePassword:validateChangePassword,
    validateForgotPassword:validateForgotPassword,
    validateForgotChangePassword:validateForgotChangePassword,
    validateVerifyOtpCode:validateVerifyOtpCode,
    validateNotificationId:validateNotificationId,
    validateNotificationIdWithPageNo:validateNotificationIdWithPageNo,
    validateSetAppversion:validateSetAppversion,
    validateAddUser:validateAddUser,
    validateUpdateUserProfile:validateUpdateUserProfile,
    validateDeleteBlockUbBlockDeactivateUser:validateDeleteBlockUbBlockDeactivateUser,
    validategetUserProfile:validategetUserProfile,
    validategetAllUserProfile:validategetAllUserProfile,
    addAlgorithem:addAlgorithem,
    updateAlgorithem:updateAlgorithem,
    deleteAlgorithem:deleteAlgorithem,
    getAlgorithem:getAlgorithem,
    getAllAlgorithem:getAllAlgorithem,
    getBets:getBets,
    getAllBets:getAllBets,
    getDashboardGraph:getDashboardGraph,
    getDashboardAlgorithemGraph:getDashboardAlgorithemGraph,
    sendBulkNotification:sendBulkNotification,
    getAllContactUs:getAllContactUs
};
