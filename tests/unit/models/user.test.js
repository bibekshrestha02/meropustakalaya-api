const { User } = require('../../../models/userModel');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
describe('Auth token', () => {
  it('should check generated token is valid or not', async () => {
    let id = mongoose.Types.ObjectId();
    let userData = new User({
      _id: id,
      role: 'user',
    });
    const token = userData.generateAuthToken();
    const tokenObj = jwt.decode(token);
    expect(tokenObj).toHaveProperty('_id');
    expect(tokenObj).toHaveProperty('role');
  });
});
