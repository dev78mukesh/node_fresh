const Controller = require('../controllers/index');
const Authorization = require('../../polices/index');
const Upload = require('../../services/FileUploadService');
const express = require('express');
const router = express.Router();


router.post('/register',Upload.admin.single('image'), Controller.UserController.register);
router.post('/login',Controller.UserController.login);
router.post('/logout',Authorization.isUserAuth,Controller.UserController.logout);
router.get('/getProfile', Authorization.isUserAuth, Controller.UserController.getProfile);
router.post('/verifyOtp', Controller.UserController.verifyOtp);
router.post('/updateProfile',Authorization.isUserAuth,Upload.user.single('image'),Controller.UserController.updateProfile)
router.post('/changePassword', Authorization.isUserAuth, Controller.UserController.changePassword);
router.post('/forgotPassword',Controller.UserController.forgotPassword);
router.post('/forgotChangePassword', Controller.UserController.forgotChangePassword);
router.post('/deleteAccount',Authorization.isUserAuth, Controller.UserController.deleteAccount);

router.post('/uploadFile', Authorization.isUserAuth, Upload.user.single('image'), Controller.UserController.uploadFile);
router.post('/sendOtp', Controller.UserController.sendOtp);
module.exports = router;
