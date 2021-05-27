const { Membership, validateMembership } = require('../models/membershipModel');
const { Package } = require('../models/packageModel');
const { User } = require('../models/userModel');
const mongoose = require('mongoose');
const moment = require('moment');
const asyncMiddleware = require('../middlerware/asyncMiddleware');
exports.getSubscribtionDetail = asyncMiddleware(async (req, res) => {
  let { id } = req.params;
  if (!mongoose.Types.ObjectId(id)) {
    return res.status(400).json({
      name: 'Id',
      message: 'Invalid id',
    });
  }
  let subscribtion = await Membership.findById(id);
  if (!subscribtion) {
    return res.status(400).json({
      name: 'Id',
      message: 'Invalid id',
    });
  }
  res.status(200).json({
    status: 200,
    data: subscribtion,
  });
});
exports.postSubscribe = asyncMiddleware(async (req, res, next) => {
  const { error } = validateMembership(req.body);
  const { id } = req.body;
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send('Invalid packakage id');
  }
  let packageData = await Package.findById(id);
  if (!packageData || !packageData.isEnable) {
    return res.status(400).send('Package not exists');
  }
  const user_id = req.user._id;
  const { validityDay } = packageData;
  let expires_at = new Date(moment().add(validityDay, 'days').format());
  let membershipData = await Membership.findOne({ user_id: user_id });

  if (membershipData) {
    const remainingDay = moment(membershipData.expires_at).diff(
      moment(),
      'days'
    );
    expires_at = new Date(
      moment()
        .add(validityDay + remainingDay, 'days')
        .format()
    );

    await Membership.findOneAndUpdate(
      { user_id: user_id },
      {
        update_at: new Date(),
        expires_at: expires_at,
      }
    );
  } else {
    membershipData = await Membership.create({
      user_id: user_id,
      expires_at,
    });
    await User.findByIdAndUpdate(user_id, {
      subscriptionDetail: membershipData._id,
    });
  }
  membershipData = await Membership.findOne({ user_id: user_id });
  res.status(201).json({ data: membershipData });
});

exports.getAllSubscribeDetails = asyncMiddleware(async (req, res, next) => {
  const membershipData = await Membership.find({});
  res.status(200).json({
    status: 200,
    data: membershipData,
  });
});
