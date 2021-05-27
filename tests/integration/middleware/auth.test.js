const request = require('supertest');
const { User } = require('../../../models/userModel');
const { Package } = require('../../../models/packageModel');
describe('auth middleware', () => {
  let server;
  let id, userData;
  let token;
  beforeEach(() => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    try {
      userData = new User({
        name: 'Bibek',
        email: 'shresthabbks@gamil.com',
        password: '12345',
        role: 'user',
      });
      userData = await userData.save();
      id = userData._id;
      token = userData.generateAuthToken();
    } catch (error) {
      console.log(error);
    }
  });
  afterEach(async () => {
    try {
      await Package.deleteMany({});
      await User.deleteMany({});
      await server.close();
    } catch (error) {
      console.log(error);
    }
  });
  const exec = () => {
    return request(server)
      .post('/api/v1/packages')
      .set('x-auth-token', token)
      .send({
        name: 'monthly',
        price: 200,
        description: 'hurry up, avilable only at 200',
        validityDay: 30,
      });
  };
  describe('verify token', () => {
    it('should return status 400 if there is no token', async () => {
      token = ' ';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return status 400 if user send invalid token', async () => {
      token = '1234';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return status 500 if client has send valid token but client not exists in db', async () => {
      await User.findByIdAndDelete(id);
      const res = await exec();
      expect(res.status).toBe(401);
    });
  });
  describe('checkAdmin', () => {
    it('should return status 403 if role is not admin', async () => {
      const res = await exec();
      expect(res.status).toBe(403);
    });
  });
});
