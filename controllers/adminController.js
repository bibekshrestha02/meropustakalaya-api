const asyncMiddleware = require('../middlerware/asyncMiddleware');
const { Book } = require('../models/bookModel');
const { Category } = require('../models/categoryModel');
const { Package } = require('../models/packageModel');
const { Review } = require('../models/reviewModel');
const { Membership } = require('../models/membershipModel');
const { User } = require('../models/userModel');

exports.Dashboard = asyncMiddleware(async (req, res) => {
  let data = {};
  data['totalPackage'] = await Package.find({
    isEnable: true,
  }).countDocuments();
  data['totalCategory'] = await Category.find({}).countDocuments();
  data['totalReview'] = await Review.find({}).countDocuments();
  data['totalSubscribeUser'] = await Membership.find({
    expires_at: { $gte: Date.now() },
  }).countDocuments();
  data['totalBook'] = await Book.find({}).countDocuments();
  data['totalUser'] = await User.find({}).countDocuments();
  data['totalAdmin'] = await User.find({ role: 'admin' }).countDocuments();
  data['totalVerifiedUser'] = await User.find({
    role: 'user',
    isVerfied: true,
  }).countDocuments();
  data['totalUnverifiedUser'] = await User.find({
    role: 'user',
    isVerfied: false,
  }).countDocuments();
  res.status(200).json({
    status: 'success',
    data,
  });
});
