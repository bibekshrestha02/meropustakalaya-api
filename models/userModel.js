const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bycript = require('bcrypt');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },
  email: {
    type: String,
    required: true,
    maxlength: 50,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 400,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  isVerfied: {
    type: Boolean,
    default: false,
    required: true,
  },
  subscriptionDetail: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'membership',
  },
  join_at: {
    type: Date,
    default: Date.now,
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  saveBook: {
    type: [mongoose.Schema.Types.ObjectId],
  },
});
userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, role: this.role },
    process.env.JWT_KEY
  );
  return token;
};
userSchema.pre('save', async function (next) {
  const saltRound = await bycript.genSalt(10);
  this.password = await bycript.hash(this.password, saltRound);
  next();
});
userSchema.methods.comparePassword = function (password) {
  return bycript.compare(password, this.password);
};
const User = mongoose.model('users', userSchema);

const validateUser = (userData) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    name: Joi.string().min(4).max(50).required(),
    password: Joi.string().min(4).max(400).required(),
    role: Joi.string().valid('user', 'admin'),
  });
  return Schema.validate(userData);
};
const validateName = (name) => {
  const Schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
  });
  return Schema.validate(name);
};
const validateLogin = (userData) => {
  const Schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(4).max(100).required(),
  });
  return Schema.validate(userData);
};
exports.validateUserName = validateName;
exports.User = User;
exports.validateUser = validateUser;
exports.validateLogin = validateLogin;
