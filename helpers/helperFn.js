const fs = require('fs');
const crypto = require('crypto');
exports.deleteFiles = (path) => {
  return fs.unlinkSync(path);
};
exports.generateOTP = () => {
  let digits = '0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
};
exports.createOTPToken = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};
