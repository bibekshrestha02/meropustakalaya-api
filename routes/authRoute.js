const express = require('express');
const Route = express.Router();
const {
  autologin,
  signUp,
  login,
  sendToken,
  updatePassword,
  verifyEmail,
  findAccount,
  forgetPasswordSendOTP,
  forgetVerifyCode,
  forgetResetPassword,
} = require('../controllers/authController');
const { verifyToken } = require('../middlerware/authMiddleware');
Route.get('/autologin', verifyToken, autologin);
Route.post('/signUp', signUp, sendToken);
Route.post('/', login);
Route.put('/password/', verifyToken, updatePassword);

Route.post('/email/sendToken', sendToken);
Route.get('/email/verifyEmail/:email/:otp', verifyEmail);

Route.get('/resetPassword/email/:email', findAccount);
Route.post('/resetPassword/sendOtp', forgetPasswordSendOTP);
Route.get('/resetPassword/forgetVerifyCode/:email/:otp', forgetVerifyCode);
Route.put('/resetPassword/reset', forgetResetPassword);

module.exports = Route;
