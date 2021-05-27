const { User, validateLogin, validateUser } = require('../models/userModel');
const asyncMiddleware = require('../middlerware/asyncMiddleware');
const emailHanlder = require('../utils/email');
const Joi = require('joi');
const _ = require('lodash');
const { generateOTP, createOTPToken } = require('../helpers/helperFn');
const emailVerficationModel = require('../models/emailVerficationModel');
const crypto = require('crypto');
exports.autologin = asyncMiddleware(async (req, res, next) => {
  const { _id } = req.user;
  let user = await User.findById(_id)
    .populate('subscriptionDetail')
    .select('-password');
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
exports.signUp = asyncMiddleware(async (req, res, next) => {
  const { error } = validateUser(req.body);
  const { email, name, password } = req.body;
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const isEmail = await User.findOne({ email });
  if (isEmail) {
    return res.status(400).json({
      validation: 'field',
      field: 'email',
      message: 'Email already exits',
    });
  }
  let userData = new User({
    name,
    email,
    password,
  });
  userData = await userData.save();
  req.user = userData;
  next();
});
exports.login = asyncMiddleware(async (req, res, next) => {
  const { email, password } = req.body;
  const { error } = validateLogin(req.body);
  if (error) {
    let path = error.details[0].path[0];
    let message = error.details[0].message;
    return res.status(400).json({ validation: 'field', field: path, message });
  }
  let userData = await User.findOne({ email: email }).populate(
    'subscriptionDetail'
  );
  if (!userData) {
    return res
      .status(400)
      .json({ validation: 'field', field: 'email', message: 'Invalid Email' });
  }
  if (!(await userData.comparePassword(password))) {
    return res.status(400).json({
      validation: 'field',
      field: 'password',
      message: 'Invalid Password',
    });
  }
  if (!userData.isVerfied) {
    return res.status(400).json({
      isVerfied: false,
      message: 'Your account is not verified.',
      email: userData.email,
    });
  }
  const token = userData.generateAuthToken();
  userData.password = undefined;

  res.status(200).json({
    status: 200,
    token,
    data: userData,
  });
});
exports.sendToken = asyncMiddleware(async (req, res) => {
  let email, name;
  if (req.user) {
    email = req.user.email;
    name = req.user.name;
  } else {
    email = req.body.email;
  }
  if (!email) {
    return res
      .status(400)
      .json({ type: 'email', message: 'Email is required' });
  }
  let user = await User.findOne({ email: email });

  if (!user) {
    return res.status(400).json({ type: 'email', message: 'Invalid Email' });
  }
  if (user.isVerfied) {
    return res.status(400).json({ type: 'user', message: 'User is Verified' });
  }
  let otp = generateOTP();
  if (await emailVerficationModel.findOne({ email: email })) {
    await emailVerficationModel.findOneAndUpdate(
      { email: email },
      { OTPtoken: createOTPToken(otp), createAt: Date.now() }
    );
  } else {
    await emailVerficationModel.create({
      email: email,
      OTPtoken: createOTPToken(otp),
    });
  }

  let subject = `${otp} is your Meropustakalaya email verfication code`;
  let message = `${name},welcome to Meropustakalaya. Don't share this code with others. Your activation code is ${otp}. `;
  try {
    await emailHanlder({ email, subject, message });
    res.status(201).json({
      status: 'success',
      message: 'activation Code sends to your email',
      email: email,
      isVerfied: false,
    });
  } catch (error) {
    await emailVerficationModel.findOneAndDelete({ user: user._id });
    res.status(500).send('something went wrong');
  }
});

exports.verifyEmail = asyncMiddleware(async (req, res) => {
  const { email, otp } = req.params;
  if (!email || !otp) {
    return res.status(400).send('Otp and email are requied');
  }
  let user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({
      type: 'email',
      message: 'Invalid Email',
    });
  }
  if (user.isVerfied) {
    return res
      .status(400)
      .json({ type: 'email', message: 'You are already Verified' });
  }
  let emailVerfication = await emailVerficationModel.findOne({ email });
  if (!emailVerfication) {
    return res.status(400).json({
      type: 'otp',
      message: 'OTP expires, Resend it again',
    });
  }
  if (emailVerfication.OTPtoken !== createOTPToken(otp)) {
    return res.status(400).json({
      type: 'otp',
      message: 'Invalid OTP',
    });
  }
  user = await User.findOneAndUpdate({ email: email }, { isVerfied: true });
  const token = user.generateAuthToken();
  await emailVerficationModel.findOneAndDelete({ email: email });
  const data = _.pick(user, [
    'name',
    'email',
    'role',
    'isSubsribe',
    'subscriptionDetail',
    'isVerfied',
  ]);
  res.status(200).json({
    status: 'verfied',
    token,
    data,
  });
});
exports.updatePassword = asyncMiddleware(async (req, res, next) => {
  const { password, newPassword } = req.body;
  const joiSchema = Joi.object({
    password: Joi.string().min(4).max(50).required(),
    newPassword: Joi.string().min(4).max(50).required(),
  });
  const { error } = joiSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let user = await User.findById(req.user._id);
  if (!(await user.comparePassword(password))) {
    return res
      .status(400)
      .json({ name: 'password', message: 'Invalid Current Password' });
  }
  if (password === newPassword) {
    return res
      .status(400)
      .json({ name: 'newPassword', message: 'Similar To Current Password' });
  }
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: 'success',
  });
});
exports.findAccount = asyncMiddleware(async (req, res, next) => {
  const { email } = req.params;
  let user = await User.findOne({ email: email }).select('name email _id role');
  if (!user) {
    return res
      .status(400)
      .json({ email: false, message: 'Accout with Email not found' });
  }
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
exports.forgetPasswordSendOTP = asyncMiddleware(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ email: false, message: 'Invalid email' });
  }
  let user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ email: false, message: 'Invalid email' });
  }
  let otp = generateOTP();
  const hashOtp = crypto.createHash('sha256').update(otp).digest('hex');
  user.passwordResetToken = hashOtp;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user = await user.save();
  const subject = `${otp} is your Meropustakalaya recovery code`;
  const message = `We received a request to reset your MeroPustakalaya password. Enter the following password reset code:\n ${otp}`;
  try {
    await emailHanlder({ email, subject, message });
    res.status(200).json({
      status: 'sucess',
      message: 'Code sends to your gmail',
      email: user.email,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.status(500).send('something went wrong');
  }
});
exports.forgetVerifyCode = asyncMiddleware(async (req, res) => {
  const { otp, email } = req.params;
  if (!otp || !email) {
    return res.status(400).send('otp and  email is required');
  }
  if (otp.length > 4) {
    return res.status(500).send('Otp must be less than 4');
  }
  const hashOtp = crypto.createHash('sha256').update(otp).digest('hex');
  let isEmail = await User.findOne({ email: email });
  if (!isEmail) {
    return res.status(400).json({
      email: 'invalid',
      message: 'Invalid Email',
    });
  }
  let isValidOTP = await User.findOne({
    email: email,
    passwordResetToken: hashOtp,
  });
  if (!isValidOTP) {
    return res.status(400).json({
      otp: 'invalid',
      type: 'otp',
      message: 'Invalid OTP',
    });
  }
  let user = await User.findOne({
    email: email,
    passwordResetToken: hashOtp,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json({
      time: 'expired',
      type: 'otp',
      message: 'OTP expires. Resend it again',
    });
  }
  res.status(200).json({
    status: 'success',
    message: 'code verified',
  });
});
exports.forgetResetPassword = asyncMiddleware(async (req, res) => {
  const { otp, email, newPassword } = req.body;

  if (!otp || !email || !newPassword) {
    return res.status(400).send('otp,password,  email is required');
  }
  let user = await User.findOne({
    email: email,
    passwordResetToken: crypto.createHash('sha256').update(otp).digest('hex'),
  });
  if (!user) {
    return res.status(400).json({ message: 'client not found' });
  }
  if (newPassword.length < 4) {
    return res.status(400).send('passord must be more than 4 character');
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'Password change',
  });
});
