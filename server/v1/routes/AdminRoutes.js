const Controller = require('../controllers/index');
const Authorization = require('../../polices/index');
const Upload = require('../../services/FileUploadService');
const express = require('express');
const router = express.Router();

/*
ADMIN API'S
*/
router.post('/register', Controller.AdminController.register);
router.post('/login', Controller.AdminController.login);
router.post('/logout', Authorization.isAdminAuth, Controller.AdminController.logout);
router.post('/getProfile', Authorization.isAdminAuth, Controller.AdminController.getProfile);
router.post('/updateAdminProfile', Authorization.isAdminAuth, Controller.AdminController.updateAdminProfile);
router.post('/changePassword', Authorization.isAdminAuth, Controller.AdminController.changePassword);
router.post('/forgotPassword', Controller.AdminController.forgotPassword);
router.post('/forgotChangePassword', Controller.AdminController.forgotChangePassword);
router.post('/uploadFile', Authorization.isAdminAuth,Upload.admin.single('image'), Controller.AdminController.uploadFile);
/*
NOTIFICATION API'S
*/
router.get('/getAllNotification',Authorization.isAdminAuth,Controller.AdminController.getAllNotification);
router.post('/clearNotification',Authorization.isAdminAuth,Controller.AdminController.clearNotification);
router.post('/clearAllNotification',Authorization.isAdminAuth,Controller.AdminController.clearAllNotification);
/*
APPVERSION API'S
*/
router.post('/setAppVersion',Authorization.isAdminAuth,Controller.AdminController.setAppVersion);
router.get('/getAppVersion',Controller.AdminController.getAppVersion);

/* 

USER API'S
*/
router.post('/addUser',Authorization.isAdminAuth,Upload.user.single('image'), Controller.AdminController.addUser);
router.post('/updateUserProfile',Authorization.isAdminAuth,Upload.user.single('image'),Controller.AdminController.updateUserProfile)
router.post('/deleteBlockUnBlockDeactivateUserProfile', Authorization.isAdminAuth, Controller.AdminController.deleteBlockUnBlockDeactivateUserProfile);
router.post('/getUserProfile', Authorization.isAdminAuth, Controller.AdminController.getUserProfile);
router.post('/getAllUserProfile', Authorization.isAdminAuth, Controller.AdminController.getAllUserProfile);
/*
ALGORITHEM API'S
*/
router.post('/addAlgorithem',Authorization.isAdminAuth,Controller.AdminController.addAlgorithem);
router.post('/updateAlgorithem',Authorization.isAdminAuth,Controller.AdminController.updateAlgorithem);
router.post('/deleteAlgorithem',Authorization.isAdminAuth,Controller.AdminController.deleteAlgorithem);
router.post('/getAlgorithem',Authorization.isAdminAuth,Controller.AdminController.getAlgorithem);
router.post('/getAllAlgorithem',Authorization.isAdminAuth,Controller.AdminController.getAllAlgorithem);

/*
GET BETS API'S
*/
router.post('/getBets',Authorization.isAdminAuth,Controller.AdminController.getBets);
router.post('/getAllBets',Authorization.isAdminAuth,Controller.AdminController.getAllBets);
router.post('/getAllContacts',Authorization.isAdminAuth,Controller.AdminController.getAllContacts);
/*
DASHBOARD API'S
*/
router.get('/getDashboardCount', Authorization.isAdminAuth, Controller.AdminController.getDashboardCount);
router.post('/getDashboardGraph', Authorization.isAdminAuth, Controller.AdminController.getDashboardGraph);
router.post('/getDashboardAlgorithemGraph', Authorization.isAdminAuth, Controller.AdminController.getDashboardAlgorithemGraph);
router.post('/sendBulkNotification', Authorization.isAdminAuth, Controller.AdminController.sendBulkNotification);

module.exports = router;
