"use strict";
const MESSAGES={
	SUCCESS: "SUCCESS",
	RUNDOWN_ERROR:"RUNDOWN_ERROR",
	UNAUTHORIZED:"UNAUTHORIZED",
	FORBIDDEN:"FORBIDDEN",
	ADMIN_BLOCKED:"ADMIN_BLOCKED",
	ADMIN_NOT_FOUND:"ADMIN_NOT_FOUND",
	SUCCESSFULLY_REGISTERD:"SUCCESSFULLY_REGISTERD",
	SUCCESSFULLY_SEND_RESET_LINK:"SUCCESSFULLY_SEND_RESET_LINK",
	SUCCESSFULLY_UPDATED_PASSWORD: "SUCCESSFULLY_UPDATED_PASSWORD",
	PROFILE_SUCCESSFULLY_UPDATED:"PROFILE_SUCCESSFULLY_UPDATED",
	DATABASE_ERROR:"DATABASE_ERROR",
	EMAIL_ALREDAY_VERIFIED: "EMAIL_ALREDAY_VERIFIED",
	PLEASE_TRY_AGAIN: "PLEASE_TRY_AGAIN",
	EMAIL_ALREDAY_EXIT: "EMAIL_ALREDAY_EXIT",
	USERNAME_ALREDAY_EXIT: "USERNAME_ALREDAY_EXIT",
	SECRET_KEY_ALREDAY_EXIT: "SECRET_KEY_ALREDAY_EXIT",
	INVALID_CONTENT_LANGUAGE: "INVALID_CONTENT_LANGUAGE",
	IMPLEMENTATION_ERROR: "IMPLEMENTATION_ERROR",
	DUPLICATE_IS_NOT_ALLOWED: "DUPLICATE_IS_NOT_ALLOWED",
	INVALID_OBJECT_ID_FROMATE: "INVALID_OBJECT_ID_FROMATE",
	INVALID_IMAGE_FORMAT: "INVALID_IMAGE_FORMAT",
	INVALID_EMAIL_PASSWORD: "INVALID_EMAIL_PASSWORD",
	INVALID_PASSWORD:"INVALID_PASSWORD",
	EMAIL_OR_USERNAME_REQUIRED:"EMAIL_OR_USERNAME_REQUIRED",
	RESET_LINK_EXPIRED: "RESET_LINK_EXPIRED",
	RESET_TOKEN_EXPIRED: "RESET_TOKEN_EXPIRED",
	INVALID_EMAIL_ID: "INVALID_EMAIL_ID",
	EMAIL_ID_DOES_NOT_EXISTS: "EMAIL_ID_DOES_NOT_EXISTS",
	INVALID_USERNAME_PASSWORD: "INVALID_USERNAME_PASSWORD",
	INVALID_USERNAME: "INVALID_USERNAME",
	INVALID_ADMIN_ID: "INVALID_ADMIN_ID",
	INVALID_INPUT_PARAMETER:"INVALID_INPUT_PARAMETER",
	INVALID_TOKEN:"INVALID_TOKEN",
	IMP_ERROR: "IMP_ERROR",
	TOKEN_ALREADY_EXPIRED: "TOKEN_ALREADY_EXPIRED",
	TOKEN_NOT_GENRATED_CORRECTLY: "TOKEN_NOT_GENRATED_CORRECTLY",
	SAME_PASSWORD_NOT_ALLOWED:"SAME_PASSWORD_NOT_ALLOWED",
	OLD_PASSWORD_NOT_MATCH:"OLD_PASSWORD_NOT_MATCH",
	PASSWORD_RESET_LINK_SEND_YOUR_EMAIL:"PASSWORD_RESET_LINK_SEND_YOUR_EMAIL",
	INVALID_PASSWORD_RESET_TOKEN:"INVALID_PASSWORD_RESET_TOKEN",
	PASSWORD_CHANGED_SUCCESSFULLY:"PASSWORD_CHANGED_SUCCESSFULLY",
	INVALID_OTP:'INVALID_OTP',
	OTP_CODE_SEND_YOUR_REGISTER_PHONE_NUMBER:"OTP_CODE_SEND_YOUR_REGISTER_PHONE_NUMBER",
	PHONE_NUMBER_ALREADY_EXISTS:"PHONE_NUMBER_ALREADY_EXISTS",
	LATEST_VERSION_LESS_THEN_CRITICAL_VERSION:"LATEST_VERSION_LESS_THEN_CRITICAL_VERSION",
	USER_NAME_ALREADY_EXISTS:"USER_NAME_ALREADY_EXISTS",
	INVALID_USERNAME_EMAIL:"INVALID_USERNAME_EMAIL",
	USER_NOT_FOUND:"USER_NOT_FOUND",
	USER_BLOCKED: "USER_BLOCKED",
	USER_UN_BLOCKED:"USER_UN_BLOCKED",
	USER_ACTIVE: "USER_ACTIVE",
	USER_UN_ACTIVE:"USER_UN_ACTIVE",
	USER_DELETED:"USER_DELETED",
	ALGORITHEM_NAME_ALREADY_EXISTS:"ALGORITHEM_NAME_ALREADY_EXISTS",
	USER_REGISTER_SUCCESSFULLY:"USER_REGISTER_SUCCESSFULLY",
	USER_LOGIN_SUCCESSFULLY:"USER_LOGIN_SUCCESSFULLY",
	USER_LOGOUT_SUCCESSFULLY:"USER_LOGOUT_SUCCESSFULLY",
	USER_PROFILE_UPDATED_SUCCESSFULLY:"USER_PROFILE_UPDATED_SUCCESSFULLY",
	USER_BANCKROLL_UPDATED_SUCCESSFULLY:"USER_BANCKROLL_UPDATED_SUCCESSFULLY",
	USER_CHANGED_PASSWORD_SUCCESSFULLY:"USER_CHANGED_PASSWORD_SUCCESSFULLY",
	USER_DELETED_ACCOUNT_SUCCESSFULLY:"USER_DELETED_ACCOUNT_SUCCESSFULLY",
	FILE_UPLOADED_SUCCESSFULLY:"FILE_UPLOADED_SUCCESSFULLY",
	OTP_VERIFIED:"OTP_VERIFIED",
	USER_CLEAR_NOTIFICATION:"USER_CLEAR_NOTIFICATION",
	USER_CLEAR_ALL_NOTIFICATION:"USER_CLEAR_ALL_NOTIFICATION",
	USER_ADD_ALGORITHEM_SUCCESSFULLY:"USER_ADD_ALGORITHEM_SUCCESSFULLY",
	USER_UPDATE_ALGORITHEM_SUCCESSFULLY:"USER_UPDATE_ALGORITHEM_SUCCESSFULLY",
	USER_DELETED_ALGORITHEM_SUCCESSFULLY:"USER_DELETED_ALGORITHEM_SUCCESSFULLY",
	USER_ADD_SUCCESSFULLY:"USER_ADD_SUCCESSFULLY",
	USER_PROFILE_UPDATED_SUCCESSFULLY:"USER_PROFILE_UPDATED_SUCCESSFULLY",
	USER_DELETED_ACCOUNT_SUCCESSFULLY:"USER_DELETED_ACCOUNT_SUCCESSFULLY",
	ADMIN_REGISTER_SUCCESSFULLY:"ADMIN_REGISTER_SUCCESSFULLY",
	ADMIN_LOGIN_SUCCESSFULLY:"ADMIN_LOGIN_SUCCESSFULLY",
	ADMIN_LOGOUT_SUCCESSFULLY:"ADMIN_LOGOUT_SUCCESSFULLY",
	ADMIN_PROFILE_UPDATED_SUCCESSFULLY:"ADMIN_PROFILE_UPDATED_SUCCESSFULLY",
	ADMIN_CHANGED_PASSWORD_SUCCESSFULLY:"ADMIN_CHANGED_PASSWORD_SUCCESSFULLY",
	ADMIN_DELETED_ACCOUNT_SUCCESSFULLY:"ADMIN_DELETED_ACCOUNT_SUCCESSFULLY",
	FILE_UPLOADED_SUCCESSFULLY:"FILE_UPLOADED_SUCCESSFULLY",
	ADMIN_CLEAR_NOTIFICATION:"ADMIN_CLEAR_NOTIFICATION",
	ADMIN_CLEAR_ALL_NOTIFICATION:"ADMIN_CLEAR_ALL_NOTIFICATION",
	ADMIN_ADD_ALGORITHEM_SUCCESSFULLY:"ADMIN_ADD_ALGORITHEM_SUCCESSFULLY",
	ADMIN_UPDATE_ALGORITHEM_SUCCESSFULLY:"ADMIN_UPDATE_ALGORITHEM_SUCCESSFULLY",
	ADMIN_DELETED_ALGORITHEM_SUCCESSFULLY:"ADMIN_DELETED_ALGORITHEM_SUCCESSFULLY",
	APP_VERSION_ADDSUCCESFULLY:"APP_VERSION_ADDSUCCESFULLY",
	USER_ADD_SELECTED_BET_SUCCESSFULLY:"USER_ADD_SELECTED_BET_SUCCESSFULLY",
	USER_SELECTED_BET_SUCCESSFULLY:"USER_SELECTED_BET_SUCCESSFULLY",
	USER_NO_SELECTED_BET_SUCCESSFULLY:"USER_NO_SELECTED_BET_SUCCESSFULLY",
	USER_ADD_BET_SUCCESSFULLY:"USER_ADD_BET_SUCCESSFULLY",
	USER_UPDATE_BET_SUCCESSFULLY:"USER_UPDATE_BET_SUCCESSFULLY",
	USER_SELECTED_BET_LIMIT:"USER_SELECTED_BET_LIMIT",
	USER_SELECTED_ATLEST_ONE_BET:"USER_SELECTED_ATLEST_ONE_BET",
	USER_SELECTED_SAME_BET:"USER_SELECTED_SAME_BET",
	BET_ALREADY_DELETED:"BET_ALREADY_DELETED",
	BET_DELETED_SUCCESSFULLY:"BET_DELETED_SUCCESSFULLY",
	BET_UPDATED_SUCCESSFULLY:"BET_UPDATED_SUCCESSFULLY",
	DATA_NOT_FOUND:"DATA_NOT_FOUND",
	NOTIFICATION_SEND_TO_USER:"NOTIFICATION_SEND_TO_USER",
	DELETED_SELECTED_BET_SUCCESSFULLY: "DELETED_SELECTED_BET_SUCCESSFULLY",
	ODDS_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO:"ODDS_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO",
	RISK_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO:"RISK_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO",
	TEASE_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO:"TEASE_VALUE_SHOULD_BE_GRETER_THAN_OR_LESS_THAN_ZERO",
	YOU_ALREADY_ADDED_THIS_ALGORITHM:"YOU_ALREADY_ADDED_THIS_ALGORITHM",
	QUERY_SUBMITTED:"QUERY_SUBMITTED",
	USER_CREATE_ONLY_STRAIGHT_BET:"USER_CREATE_ONLY_STRAIGHT_BET",
	BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO:"BANKROLL_AMOUNT_SHOULD_BE_GREATER_THEN_ZERO"
};
module.exports = {
	MESSAGES:MESSAGES
};