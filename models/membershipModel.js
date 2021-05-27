const Joi = require('joi');
const mongoose = require('mongoose');

const membershipSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'users',
  },
  // package: {
  //   type: [mongoose.Schema.Types.ObjectId],
  //   required: true,
  //   ref: 'packages',
  // },
  start_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  expires_at: {
    type: Date,
    required: true,
  },
  update_at: {
    type: Date,
  },
});
exports.validateMembership = function (data) {
  const schema = Joi.object({
    id: Joi.string().required(),
  });
  return schema.validate(data);
};
exports.Membership = mongoose.model('membership', membershipSchema);
