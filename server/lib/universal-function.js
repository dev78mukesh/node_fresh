const joi = require('joi');
var jwt = require('jsonwebtoken');
var config = require('../config/config');
const randomstring = require('randomstring');
const bcrypt = require('bcrypt');
const Handlebars = require('handlebars');
const appConstant = require("../constant");
const appMessages = require("../langs");
const statusCodeList = require("../statusCodes");
const messageList = require("../messages");

const constant = appConstant.constant;
const statusCode = statusCodeList.statusCodes.STATUS_CODE;
const messages = messageList.messages.MESSAGES;

const renderMessageFromTemplateAndVariables=async (templateData, variablesData)=> {
    return Handlebars.compile(templateData)(variablesData);
}
const sendResponse = async ( req, res, code, message, data) => {
    try {
        const lang=req.headers['content-language'] || constant.LANGUAGE_TYPE.ENGLISH
		code = code || statusCode.SUCCESS;
		message = message || messages.SUCCESS;
		data = data || {};
		return res.status(code).send({
			statusCode: code,
			message: appMessages[lang]["APP_MESSAGES"][message],
			data: data
		});
	} catch (error) {
		throw error;
	}
};
const sendResponseCustom = async ( req, res, code, message, data,handleBarObject) => {
    try {
        const lang=req.headers['content-language'] || constant.LANGUAGE_TYPE.ENGLISH
		code = code || statusCode.SUCCESS;
		message = message || messages.SUCCESS;
		message=appMessages[lang]["APP_MESSAGES"][message];
		message=await renderMessageFromTemplateAndVariables(message,handleBarObject);
		data = data || {};
		return res.status(code).send({
			statusCode: code,
			message: message,
			data: data
		});
	} catch (error) {
		throw error;
	}
};
const unauthorizedResponse= async (req,res,message) => {
    try {
        const lang=req.headers['content-language'] || constant.LANGUAGE_TYPE.ENGLISH
		const code = statusCode.UNAUTHORIZED;
	    message = message ||  messages.UNAUTHORIZED;
		return res.status(code).send({
			statusCode: code,
			message: appMessages[lang]["APP_MESSAGES"][message],
			data: {}
		});
	} catch (error) {
		throw error;
	}
};
const forBiddenResponse= async (req,res,message) => {
    try {
        const lang=req.headers['content-language'] || constant.LANGUAGE_TYPE.ENGLISH
		const code = statusCode.FORBIDDEN;
	    message = message ||  messages.FORBIDDEN;
		return res.status(code).send({
			statusCode: code,
			message: appMessages[lang]["APP_MESSAGES"][message],
			data: {}
		});
	} catch (error) {
		throw error;
	}
};
const validateSchema=async (inputs,schema)=>{
	const {error,value} = joi.validate(inputs, schema);
	if(error){
		return error
	}else{
		return false;
	}
}
const validationError = async (res,error) => {
	const code = statusCode.UNPROCESSABLE_ENTITY;
	return res.status(code).send({
		statusCode: code,
		error: error.details?error.details[0].message:'',
		message: error.details?error.details[0].message:''
	});
};
const exceptionError = async (res) => {
	const code = statusCode.INTERNAL_SERVER_ERROR;
	const message=message.INTERNAL_SERVER_ERROR;
	return res.status(code).send({
		statusCode: code,
		error: appMessages[lang]["APP_MESSAGES"][message],
		message:appMessages[lang]["APP_MESSAGES"][message]
	});
};
const authorizationHeader = joi.object({
    authorization: joi.string().required().description('Bearer Token'),
    'content-language': joi.string().required().description('en/ar'),
}).unknown();
/**
 * @function <b> hashPasswordUsingBcrypt </b> <br>
 * Hash Password
 * @param {String} plainTextPassword Unsecured Password
 * @return {String} Secured Password
 */
const hashPasswordUsingBcrypt = async (plainTextPassword) => {
    const saltRounds = 10;
    return bcrypt.hashSync(plainTextPassword, saltRounds);
};
const jwtSign =async (payload) => {
	try {
		return jwt.sign({_id:payload._id},config.jwtOption.jwtSecretKey,{expiresIn:config.jwtOption.expiresIn});
	} catch (error) {
		throw error;
	}
};
const jwtVerify = async(token) => {
	try {
		return jwt.verify(token, config.jwtOption.jwtSecretKey);
	} catch (error) {
		throw error;
	}
};
const jwtDecode = async(token) => {
	try {
		return jwt.decode(token, {
			complete: true
		});
	} catch (error) {
		throw error;
	}
};
/**
 * @function <b>comparePasswordUsingBcrypt</b><br>Verify Password
 * @param {String} plainTextPassword Password to be checked
 * @param {String} passwordhash Hashed Password
 */
const comparePasswordUsingBcrypt = async (plainTextPassword, passwordhash) => {
    return bcrypt.compareSync(plainTextPassword, passwordhash);
};

const generateRandomString = async (noOfChars) => {
    return randomstring.generate(noOfChars);
};
const msToTime = async (duration) => {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}
module.exports = {
	sendResponse :sendResponse,
	sendResponseCustom:sendResponseCustom,
	unauthorizedResponse: unauthorizedResponse,
	forBiddenResponse:forBiddenResponse,
	exceptionError:exceptionError,
	validateSchema:validateSchema,
	validationError:validationError,
	jwtSign:jwtSign,
	jwtVerify:jwtVerify,
	jwtDecode:jwtDecode,
	authorizationHeader: authorizationHeader,
	hashPasswordUsingBcrypt: hashPasswordUsingBcrypt,
	comparePasswordUsingBcrypt: comparePasswordUsingBcrypt,
	generateRandomString: generateRandomString,
	msToTime: msToTime
}