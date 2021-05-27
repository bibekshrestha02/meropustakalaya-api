const { verifyToken } = require('../../../middlerware/authMiddleware');
const { User } = require('../../../models/userModel');

describe('Verify token', () => {
  let server;
  let userData, token, req, res, next;
  beforeEach(async () => {
    server = require('../../../index');
    userData = new User({
      name: 'Biebk',
      email: 'shres@gmail.com',
      password: '12345',
      role: 'user',
    });
    userData = await userData.save();
    token = userData.generateAuthToken();
    req = {
      header: jest.fn().mockReturnValue(token),
    };
    res = {};
    next = jest.fn();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await server.close();
  });

  it('should return req.user if send valid token', async () => {
    try {
      await verifyToken(req, res, next);
      expect(req.user).toBeDefined();
    } catch (error) {
      console.log(error);
    }
  });
});
