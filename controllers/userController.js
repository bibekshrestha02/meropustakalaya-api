const { User, validateUser, validateUserName } = require('../models/userModel');
const { Book } = require('../models/bookModel');
const bycript = require('bcrypt');
const _ = require('lodash');
const asyncMiddleware = require('../middlerware/asyncMiddleware');
const mongoose = require('mongoose');
const { Review } = require('../models/reviewModel');
exports.getLoginUser = asyncMiddleware(async (req, res) => {
  const { _id } = req.user;
  let user = await User.findById(_id)
    .populate('subscriptionDetail')
    .select('-password -__v');
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
exports.getAllUsers = asyncMiddleware(async (req, res) => {
  const { sort, filter } = req.query;
  // filter: admin,user,subscribe,unsubscribe,verified,unverified
  // sort: name, join_at
  let user;
  if (filter === 'admin') {
    user = User.find({ role: 'admin' });
  } else if (filter === 'user') {
    user = User.find({ role: 'user' });
  } else if (filter === 'subscribe') {
    user = User.find({ subscriptionDetail: { $exists: true } });
  } else if (filter === 'unsubscribe') {
    user = User.find({ subscriptionDetail: { $exists: false } });
  } else if (filter === 'verified') {
    user = User.find({ isVerfied: true });
  } else if (filter === 'unverified') {
    user = User.find({ isVerfied: false });
  } else {
    user = User.find({});
  }
  user = await user
    .populate('subscriptionDetail')
    .sort(sort)
    .select('-password');
  res.status(200).json({
    status: 200,
    data: user,
  });
});
exports.getUser = asyncMiddleware(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send('Invalid id');
  }
  let user = await User.findById(id).select('-password');
  if (!user) {
    return res.status(400).send('Invalid id');
  }
  res.status(200).json({
    status: 200,
    data: user,
  });
});
exports.updateName = asyncMiddleware(async (req, res) => {
  const { name } = req.body;
  const { error } = validateUserName(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const { _id } = req.user;

  await User.findByIdAndUpdate(_id, { name: name }, { new: true });
  let user = await User.findById(_id)
    .populate('subscriptionDetail')
    .select('-password -__v');
  res.status(200).json({
    status: 'success',
    data: user,
  });
});
exports.createUser = asyncMiddleware(async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const isEmail = await User.findOne({ email: req.body.email });
  if (isEmail) {
    return res
      .status(400)
      .json({ name: 'email', message: 'Email already exits' });
  }
  let userData = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role: req.body.role,
  });

  const saltRound = await bycript.genSalt(10);
  userData.password = await bycript.hash(userData.password, saltRound);
  await userData.save();

  res.status(201).json({
    status: 201,
    message: 'sucess',
  });
});

exports.deleteUser = asyncMiddleware(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send('Invalid User id');
  }

  let user = await User.findById(id);
  if (!user) {
    return res.status(400).send('Invalid User id');
  }
  await Review.deleteMany({ user: id });
  await User.findByIdAndDelete(id);
  res.status(200).json({
    status: 200,
    message: 'success',
  });
});
exports.saveBook = asyncMiddleware(async (req, res) => {
  let { book } = req.params;
  const { _id } = req.user;
  if (!mongoose.isValidObjectId(book)) {
    return res.status(400).send('Invalid book Id');
  }

  book = await Book.findById(book);
  if (!book) {
    return res.status(400).send('Invalid book ');
  }

  let { saveBook } = await User.findById(_id).select('saveBook').lean();
  let isSaveBook = saveBook.some((e) => e.toString() === book._id.toString());
  if (isSaveBook) {
    saveBook = saveBook.filter((e) => e.toString() !== book._id.toString());
  } else {
    saveBook = saveBook.concat(book._id.toString());
  }
  await User.findByIdAndUpdate(_id, { saveBook: saveBook });

  res.status(200).json({ status: 'sucess', data: saveBook });
});
exports.getSaveBook = asyncMiddleware(async (req, res) => {
  const { _id } = req.user;
  let { saveBook } = await User.findById(_id);
  let book = await Book.find({ _id: { $in: saveBook } });
  res.status(200).json({
    status: 'success',
    data: book,
  });
});
