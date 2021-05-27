const mongoose = require('mongoose');
const crypto = require('crypto');
const emailVerficationSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  OTPtoken: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    expires: 600,
    default: Date.now,
    required: true,
  },
});

module.exports = mongoose.model('emailVerfications', emailVerficationSchema);
