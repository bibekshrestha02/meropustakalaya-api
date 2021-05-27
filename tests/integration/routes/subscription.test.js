const request = require('supertest');
const { User } = require('../../../models/userModel');
const { Package } = require('../../../models/packageModel');
const { Subscription } = require('../../../models/subsriptionModel');
const moment = require('moment');
describe('SUBSCRIPTION /api/v1/subscriptions', () => {
  let server, token, userData, package_id, packageData;
  beforeEach(async () => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    userData = new User({
      name: 'biebk',
      email: 'shresthabbks@gamil.com',
      password: '12345',
      role: 'admin',
    });
    userData = await userData.save();
    token = userData.generateAuthToken();
  });
  beforeEach(async () => {
    packageData = new Package({
      name: 'summer',
      description: 'hurry up',
      price: 100,
      validityDay: 20,
    });
    packageData = await packageData.save();
    package_id = packageData._id;
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Package.deleteMany({});
    await Subscription.deleteMany({});
    await server.close();
  });
  describe('Post SUBSCRIPTION /api/v1/subscriptions/', () => {
    const exec = async () => {
      return request(server)
        .post('/api/v1/subscriptions/')
        .set('x-auth-token', token)
        .send({
          package_id,
        });
    };
    it('should return status 401 if client is not loged in ', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('return status 400 if package id is not valid', async () => {
      await Package.findByIdAndDelete(package_id);
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should add subscriptions if user send valid data', async () => {
      await exec();
      let subscription = await Subscription.findOne({ user_id: userData._id });
      userData = await User.findById(userData._id);
      expect(userData.subscriptionDetail).toStrictEqual(subscription._id);
      expect(subscription).toHaveProperty('user_id');
      expect(subscription).toHaveProperty('packages');
      expect(subscription).toHaveProperty('start_at');
      expect(subscription).toHaveProperty('expires_at');
      expect(subscription).not.toBeNull();
    });

    it('should update subscription if user already exists in subscription model', async () => {
      let subscription = await Subscription.create({
        user_id: userData._id,
        packages: packageData,
        start_at: new Date(),
        expires_at: new Date(moment().add(20, 'days').format()),
      });
      await exec();
      subscription = await Subscription.findById(subscription._id);
      expect(subscription.update_at).not.toBeNull();
    });
    it('should return status 400 if package is disable', async () => {
      await Package.findByIdAndUpdate({ _id: package_id }, { isEnable: false });
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it('should return status 201 if user send valid data', async () => {
      const res = await exec();
      expect(res.status).toBe(201);
    });
  });
  describe('Get /api/v1/subscriptions/', () => {
    const exec = () => {
      return request(server)
        .get('/api/v1/subscriptions/')
        .set('x-auth-token', token);
    };

    describe('authenticate', () => {
      it('should return status 401 if client not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client not admin', async () => {
        userData = new User({
          name: 'biebk',
          email: 'shresthabssks@gamil.com',
          password: '12345',
          role: 'user',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    it('should return status 200 if client is admin', async () => {
      await Subscription.create({
        user_id: userData._id,
        packages: packageData,
        start_at: new Date(),
        expires_at: new Date(moment().add(20, 'days').format()),
      });
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
});
