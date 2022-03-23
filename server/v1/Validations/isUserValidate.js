const joi = require('joi');
const universalFunction=require('../../lib/universal-function');

const validateLogin=async (req)=> {
    
        let loginUserNameSchema = joi.object().keys({
            userName: joi.string().required(),
            password: joi.string().required(),
            deviceType: joi.string().required().valid(['ANDROID','IOS','WEB']),
            deviceToken: joi.string().required(),
        });
        return await universalFunction.validateSchema(req.body,loginUserNameSchema);
};
const validateRegister=async (req)=> {
    let registerSchema = joi.object().keys({
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
        email: joi.string().required(),
        userName: joi.string().required(),
        password: joi.string().required(),
        deviceType: joi.string().required().valid(['ANDROID','IOS','WEB']),
        deviceToken: joi.string().required(),
    });
    return await universalFunction.validateSchema(req.body,registerSchema);
};
const validateUpdateProfile=async (req)=> {
    let updateProfileSchema = joi.object().keys({
        firstName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        lastName:joi.string().regex(/^[a-zA-Z ]+$/).trim().optional(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).optional(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).optional(),
        description:joi.string().allow('').optional(),
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
const validateSendOtpCode=async (req)=> {
    let verifyOtpCodeSchema = joi.object().keys({
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).required(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).required()
    });
    return await universalFunction.validateSchema(req.body,verifyOtpCodeSchema);
};
const validateVerifyOtpCode=async (req)=> {
    let verifyOtpCodeSchema = joi.object().keys({
        otpCode: joi.string().required(),
        phoneNo:joi.string().regex(/^[0-9]+$/).min(5).required(),
        countryCode:joi.string().regex(/^[0-9,+]+$/).trim().min(2).required(),
        eventType:joi.string().optional().valid(['SEND_OTP']),
    });
    return await universalFunction.validateSchema(req.body,verifyOtpCodeSchema);
};
const addAlgorithem=async (req)=> {
    let addAlgorithemSchema = joi.object().keys({
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
        name:joi.string().optional().description('Algorithem name'),
        sport:joi.string().optional().description('Algorithem sport'),
        sportId:joi.number().optional(),
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
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.body,getAllAlgorithemSchema);
};
const addSelectedBet=async (req)=> {
    let addSelectedBetSchema = joi.object().keys({
        eventId:joi.string().required().description('Event id'),
        isHomeTotalSelected:joi.boolean().optional(),
        isAwayTotalSelected:joi.boolean().optional(),
        isHomeMoneySelected:joi.boolean().optional(),
        isAwayMoneySelected:joi.boolean().optional(),
        isHomeSpreadSelected:joi.boolean().optional(),
        isAwaySpreadSelected:joi.boolean().optional(),
    });
    return await universalFunction.validateSchema(req.body,addSelectedBetSchema);
};
const getSelectedBet=async (req)=> {
    let getSelectedBetSchema = joi.object().keys({
        eventId:joi.string().required().description('Event id')
    });
    return await universalFunction.validateSchema(req.body,getSelectedBetSchema);
};
const deleteSelectedBet=async (req)=> {
    let deleteSelectedBetSchema = joi.object().keys({
        selectedBetId:joi.string().length(24).required().description('Selected bet id')
    });
    return await universalFunction.validateSchema(req.body,deleteSelectedBetSchema);
};
const getBet=async (req)=> {
    let getBetSchema = joi.object().keys({
        betId:joi.string().length(24).required().description('Bet id')
    });
    return await universalFunction.validateSchema(req.query,getBetSchema);
};
const getAllBet=async (req)=> {
    let getAllBetSchema = joi.object().keys({
        startDate:joi.date().optional(),
        endDate:joi.date().optional(),
        userId:joi.string().length(24).optional(),
        userType:joi.string().valid(['ANALYST','ENTHUSIAST']).optional(),
        eventId:joi.string().optional(),
        isEventDataGet:joi.boolean().optional(),
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.query,getAllBetSchema);
};
const addStraightBets=async (req)=> {
    let addStraightBetSchema =joi.object().keys({
        betDate:joi.date().required(),
        bets:joi.array().items(
            joi.object().keys({
                eventId:joi.string().required().description('Event id'),
                sportId:joi.number().required(),
                SelectedBet:joi.object().keys({
                    isHomeTotalSelected:joi.boolean().optional(),
                    isAwayTotalSelected:joi.boolean().optional(),
                    isHomeMoneySelected:joi.boolean().optional(),
                    isAwayMoneySelected:joi.boolean().optional(),
                    isHomeSpreadSelected:joi.boolean().optional(),
                    isAwaySpreadSelected:joi.boolean().optional(),
                }),
                total:joi.number().min(0).max(500).optional(),
                spread:joi.number().min(-100).max(100).optional(),
                money:joi.number().min(-99999).max(99999).optional(),
                odds:joi.number().min(-99999).max(99999).optional(),
                risk:joi.number().min(0).max(25000).optional(),
                toWin:joi.number().min(0).optional(),
            }))
    });
    return await universalFunction.validateSchema(req.body,addStraightBetSchema);
};
const addParlayBets=async (req)=> {
    let addParlayBetsSchema =joi.object().keys({
        betDate:joi.date().required(),
        total:joi.number().min(0).max(500).optional(),
        spread:joi.number().min(-100).max(100).optional(),
        money:joi.number().min(-99999).max(99999).optional(),
        odds:joi.number().min(-99999).max(99999).optional(),
        risk:joi.number().min(0).max(25000).optional(),
        toWin:joi.number().min(0).optional(),
        bets:joi.array().items(
            joi.object().keys({
                eventId:joi.string().required().description('Event id'),
                sportId:joi.number().required(),
                total:joi.number().min(0).max(500).optional(),
                spread:joi.number().min(-100).max(100).optional(),
                money:joi.number().min(-99999).max(99999).optional(),
                SelectedBet:joi.object().keys({
                    isHomeTotalSelected:joi.boolean().optional(),
                    isAwayTotalSelected:joi.boolean().optional(),
                    isHomeMoneySelected:joi.boolean().optional(),
                    isAwayMoneySelected:joi.boolean().optional(),
                    isHomeSpreadSelected:joi.boolean().optional(),
                    isAwaySpreadSelected:joi.boolean().optional(),
                })
            }))
    });
    return await universalFunction.validateSchema(req.body,addParlayBetsSchema);
};
const addTeaserBets=async (req)=> {
    let addTeaserBetsSchema =joi.object().keys({
        betDate:joi.date().required(),
        odds:joi.number().min(-99999).max(99999).optional(),
        risk:joi.number().min(1).max(25000).optional(),
        toWin:joi.number().min(1).optional(),
        tease:joi.number().min(-10).max(10).required(),
        bets:joi.array().items(
            joi.object().keys({
                eventId:joi.string().required().description('Event id'),
                sportId:joi.number().required(),
                total:joi.number().min(0).max(500).optional(),
                spread:joi.number().min(-100).max(100).optional(),
                money:joi.number().min(-99999).max(99999).optional(),
                SelectedBet:joi.object().keys({
                    isHomeTotalSelected:joi.boolean().optional(),
                    isAwayTotalSelected:joi.boolean().optional(),
                    isHomeMoneySelected:joi.boolean().optional(),
                    isAwayMoneySelected:joi.boolean().optional(),
                    isHomeSpreadSelected:joi.boolean().optional(),
                    isAwaySpreadSelected:joi.boolean().optional(),
                })
            }))
    });
    return await universalFunction.validateSchema(req.body,addTeaserBetsSchema);
};
const updateStraightBet=async (req)=> {
    let updateStraightBetSchema = joi.object().keys({
        betId: joi.string().length(24).required(),
        betEventId:joi.string().length(24).required(),
        SelectedBet:joi.object().keys({
            isHomeTotalSelected:joi.boolean().optional(),
            isAwayTotalSelected:joi.boolean().optional(),
            isHomeMoneySelected:joi.boolean().optional(),
            isAwayMoneySelected:joi.boolean().optional(),
            isHomeSpreadSelected:joi.boolean().optional(),
            isAwaySpreadSelected:joi.boolean().optional(),
        }).optional(), 
        total:joi.number().min(0).max(500).optional(),
        spread:joi.number().min(-100).max(100).optional(),
        money:joi.number().min(-99999).max(99999).optional(),
        odds:joi.number().min(-99999).max(99999).optional(),
        risk:joi.number().min(0).max(25000).optional(),
        toWin:joi.number().min(0).optional(),
    });
    return await universalFunction.validateSchema(req.body,updateStraightBetSchema);
};
const updateParleyAndTeaserBet=async (req)=> {
    let updateParleyAndTeaserBetSchema = joi.object().keys({
        betId: joi.string().length(24).required(),
        odds:joi.number().min(-99999).max(99999).optional(),
        risk:joi.number().min(0).max(25000).optional(),
        toWin:joi.number().min(0).optional(),
        bets:joi.array().items(
            joi.object().keys({
                eventId:joi.string().required().description('Event id'),
                betEventId:joi.string().length(24).required(),
                total:joi.number().min(0).max(500).optional(),
                spread:joi.number().min(-100).max(100).optional(),
                money:joi.number().min(-99999).max(99999).optional(),
                SelectedBet:joi.object().keys({
                    isHomeTotalSelected:joi.boolean().optional(),
                    isAwayTotalSelected:joi.boolean().optional(),
                    isHomeMoneySelected:joi.boolean().optional(),
                    isAwayMoneySelected:joi.boolean().optional(),
                    isHomeSpreadSelected:joi.boolean().optional(),
                    isAwaySpreadSelected:joi.boolean().optional(),
                })
            })).optional()
    });
    return await universalFunction.validateSchema(req.body,updateParleyAndTeaserBetSchema);
};
const updateTeaserBet=async (req)=> {
    let updateTeaserBetSchema = joi.object().keys({
        betId: joi.string().length(24).required(),
        odds:joi.number().min(-99999).max(99999).optional(),
        risk:joi.number().min(0).max(25000).optional(),
        toWin:joi.number().min(0).optional(),
        tease:joi.number().min(-10).max(10).required(),
        bets:joi.array().items(
            joi.object().keys({
                eventId:joi.string().required().description('Event id'),
                betEventId:joi.string().length(24).required(),
                total:joi.number().min(0).max(500).optional(),
                spread:joi.number().min(-100).max(100).optional(),
                money:joi.number().min(-99999).max(99999).optional(),
                SelectedBet:joi.object().keys({
                    isHomeTotalSelected:joi.boolean().optional(),
                    isAwayTotalSelected:joi.boolean().optional(),
                    isHomeMoneySelected:joi.boolean().optional(),
                    isAwayMoneySelected:joi.boolean().optional(),
                    isHomeSpreadSelected:joi.boolean().optional(),
                    isAwaySpreadSelected:joi.boolean().optional(),
                })
            })).optional()
    });
    return await universalFunction.validateSchema(req.body,updateTeaserBetSchema);
};
const deleteBet=async (req)=> {
    let deleteBetSchema = joi.object().keys({
        betId: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,deleteBetSchema);
};
const getAllStraightBet=async (req)=> {
    let getAllStraightBetSchema = joi.object().keys({
        startDate:joi.date().optional(),
        endDate:joi.date().optional(),
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.query,getAllStraightBetSchema);
};
const getEventBySportsDate=async (req)=> {
    let getEventBySportsDateSchema = joi.object().keys({
        date:joi.date().required(),
        sportId: joi.number().min(1).required()
    });
    return await universalFunction.validateSchema(req.body,getEventBySportsDateSchema);
};
const getEvent=async (req)=> {
    let getEventSchema = joi.object().keys({
        eventId: joi.string().required()
    });
    return await universalFunction.validateSchema(req.body,getEventSchema);
};
const addContactUs=async (req)=> {
    let addContactUsSchema = joi.object().keys({
        name:joi.string().required().description('Name'),
        email:joi.string().required().description('Email'),
        message:joi.string().required(),
        subject:joi.string().required().description('Subject')
    });
    return await universalFunction.validateSchema(req.body,addContactUsSchema);
};
const validategetAllAnalyst=async (req)=> {
    let validategetAllAnalystSchema = joi.object().keys({
        pageNo: joi.number().min(1).optional()
    });
    return await universalFunction.validateSchema(req.body,validategetAllAnalystSchema);
};
const validategetUserPerformance=async (req)=> {
    let validategetUserPerformanceSchema = joi.object().keys({
        lastBet:joi.number().valid([10,50,100,0]).required(),
        todayDate:joi.date().required()
    });
    return await universalFunction.validateSchema(req.body,validategetUserPerformanceSchema);
};
const validategetAllPick=async (req)=> {
    let validategetAllPickSchema = joi.object().keys({
        pageNo: joi.number().min(1).optional(),
        betType: joi.string().optional().valid(['STRAIGHT','PARLAY','TEASER']),
        userId:joi.string().length(24).required(),
        sportId:joi.number().valid([1,2,3,4,5,6,10]).optional()
    });
    return await universalFunction.validateSchema(req.body,validategetAllPickSchema);
};
const validategetAnalystPerformance=async (req)=> {
    let validategetAnalystPerformanceSchema = joi.object().keys({
        lastBet:joi.number().valid([10,50,100,0]).required(),
        betType: joi.string().optional().valid(['STRAIGHT','PARLAY','TEASER']),
        todayDate:joi.date().required(),
        userId:joi.string().length(24).required()
    });
    return await universalFunction.validateSchema(req.body,validategetAnalystPerformanceSchema);
};
const validategetAnalystPerformanceBySport=async (req)=> {
    let validategetAnalystPerformanceBySportSchema = joi.object().keys({
        lastBet:joi.number().valid([10,50,100,0]).required(),
        algorithemId:joi.string().length(24).required(),
        betType: joi.string().optional().valid(['STRAIGHT','PARLAY','TEASER']),
        sportId:joi.number().valid([1,2,3,4,5,6,10]).required(),
        userId:joi.string().length(24).required(),
        todayDate:joi.date().required()
    });
    return await universalFunction.validateSchema(req.body,validategetAnalystPerformanceBySportSchema);
};
module.exports = {
    validateLogin:validateLogin,
    validateRegister:validateRegister,
    validateUpdateProfile:validateUpdateProfile,
    validateChangePassword:validateChangePassword,
    validateForgotPassword:validateForgotPassword,
    validateSendOtpCode:validateSendOtpCode,
    validateVerifyOtpCode:validateVerifyOtpCode,
    validateForgotChangePassword:validateForgotChangePassword,
    validateNotificationId:validateNotificationId,
    addAlgorithem:addAlgorithem,
    updateAlgorithem:updateAlgorithem,
    deleteAlgorithem:deleteAlgorithem,
    getAlgorithem:getAlgorithem,
    getAllAlgorithem:getAllAlgorithem,
    addSelectedBet:addSelectedBet,
    getSelectedBet:getSelectedBet,
    deleteSelectedBet:deleteSelectedBet,
    getBet:getBet,
    getAllBet:getAllBet,
    addStraightBets:addStraightBets,
    addParlayBets:addParlayBets,
    addTeaserBets:addTeaserBets,
    updateStraightBet:updateStraightBet,
    updateParleyAndTeaserBet:updateParleyAndTeaserBet,
    updateTeaserBet:updateTeaserBet,
    deleteBet:deleteBet,
    getAllStraightBet:getAllStraightBet,
    getEventBySportsDate:getEventBySportsDate,
    getEvent:getEvent,
    addContactUs:addContactUs,
    validategetAllAnalyst:validategetAllAnalyst,
    validategetUserPerformance:validategetUserPerformance,
    validategetAllPick:validategetAllPick,
    validategetAnalystPerformance:validategetAnalystPerformance,
    validategetAnalystPerformanceBySport:validategetAnalystPerformanceBySport
};
