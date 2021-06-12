const jwt = require('jsonwebtoken');
const { User } = require('../models/userModel');
const { Membership } = require('../models/membershipModel');
exports.verifyToken = async (req, res, next) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decode = jwt.verify(token, process.env.JWT_KEY);
    if (!(await User.findById({ _id: decode._id }))) {
      throw 'invalid token user not exits';
    }
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: 'invalid token' });
  }
};
exports.isToken_user = async (req, res, next) => {
  try {
    let token = req.header('x-auth-token');
    if (!token) {
      token = '';
      return next();
    }

    const decode = jwt.verify(token, process.env.JWT_KEY);
    if (!(await User.findById({ _id: decode._id }))) {
      throw 'invalid token user not exits';
    }
    req.user = decode;
    next();
  } catch (error) {
    res.status(401).json({ message: 'invalid token' });
  }
};
exports.checkAdmin = (req, res, next) => {
  try {
    const { role } = req.user;
    if (role === 'admin') {
      return next();
    }

    res.status(403).json({ message: 'Not Allowed To Get Access' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// checking subscritption
exports.checkIsSubscribe = async (req, res, next) => {
  const userId = req.user._id;
  if (req.user.role === 'admin') {
    return next();
  }
  let subscribtion = await Membership.findOne({ user_id: userId });
  if (!subscribtion) {
    return res.status(403).json({ message: 'Get Subscription to access' });
  }
  const { expires_at } = subscribtion;

  if (Date.parse(expires_at) < Date.now()) {
    return res.status(403).json({ message: 'Membership expired' });
  }
  next();
};
