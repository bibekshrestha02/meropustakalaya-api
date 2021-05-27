const request = require('supertest');
const { User } = require('../../../models/userModel');
const { Package } = require('../../../models/packageModel');
const mongoose = require('mongoose');
describe('PACKAGE /api/v1/users/packages', () => {
  let server,
    role,
    token,
    userData,
    packageData,
    price,
    name,
    description,
    validityDay,
    isEnable,
    id;
  beforeEach(async () => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    role = 'admin';
    userData = new User({
      name: 'Biebk ser',
      email: 'shresthabbk001s@gamil.com',
      role,
      password: '123456',
    });
    userData = await userData.save();
    token = userData.generateAuthToken();
  });
  beforeEach(async () => {
    name = 'Monthly';
    price = 90;
    description = 'hurry up, avilable only at 200';
    validityDay = 5;
    isEnable = false;
    packageData = await Package.create({
      name,
      price,
      description,
      isEnable,
      validityDay,
    });
    id = packageData._id;
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Package.deleteMany({});
    await server.close();
  });
  describe('CREATE PACKAGE POST /api/v1/packages', () => {
    beforeEach(() => {
      name = 'Monthly';
      price = '90';
      description = 'hurry up, avilable only at 200';
      validityDay = '5';
      isEnable = true;
    });

    const exec = () => {
      return request(server)
        .post('/api/v1/packages/')
        .set('x-auth-token', token)
        .send({ name, price, description, validityDay, isEnable });
    };
    describe('check Authorization', () => {
      it('should retrun status 401 if user is not login', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should retrun status 403 if client is not admin', async () => {
        await User.deleteMany({});
        userData = new User({
          name: 'Biebk ser',
          email: 'shresthabbk001s@gamil.com',
          role: 'user',
          password: '123456',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe('Check Validity', () => {
      describe('name', () => {
        it('should return status 400 if name is less than 4 char', async () => {
          name = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is more than 50 char', async () => {
          name = new Array(52).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is not provided', async () => {
          name = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Price', () => {
        it('should return status 400 if price is more than 100 char', async () => {
          price = new Array(52).join('1');
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if price is not provided', async () => {
          price = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('validityDay', () => {
        it('should return status 400 if validityDay is not provided', async () => {
          validityDay = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('description', () => {
        it('should return status 400 if description is less than 5 char', async () => {
          description = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if description is more than 1001 char', async () => {
          description = new Array(10001).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    it('should add package if client send valid data and send status 201', async () => {
      const res = await exec();
      const result = await Package.findOne({ name });
      expect(result).not.toBeNull();
      expect(res.status).toBe(201);
    });
  });
  describe('GET all enable package GET /api/v1/packages/ ', () => {
    beforeEach(async () => {
      await Package.create({
        name: '12345',
        isEnable: false,
        price: 125,
        validityDay: 1324,
        description: 'Hurry up',
      });
      await Package.create({
        name: '12345',
        isEnable: true,
        price: 125,
        validityDay: 1324,
        description: 'Hurry up',
      });
      await Package.create({
        name: '12345',
        isEnable: true,
        price: 125,

        validityDay: 1324,
        description: 'Hurry up',
      });
    });
    const exec = () => {
      return request(server).get('/api/v1/packages');
    };
    it('should return status 200 and data of length 2', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });
  });
  describe('GET all package by admin GET /api/v1/packages/all', () => {
    const exec = async () => {
      return request(server)
        .get('/api/v1/packages/all')
        .set('x-auth-token', token);
    };

    describe('Authentication', () => {
      it('retrun status 401 if client is not logedin', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('retrun status 401 if client is not admin', async () => {
        userData = new User({
          name: 'bibek',
          email: 'sherstha@gamil.com',
          password: '123445',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    it('should retrun status 200 if client is admin with all packages', async () => {
      const res = await exec();
      expect(res.body).toHaveProperty('data');
      expect(res.status).toBe(200);
    });
  });

  describe('UPDATE package by admin UPDATE /api/v1/packages/:id', () => {
    const exec = () => {
      return request(server)
        .put(`/api/v1/packages/${id}`)
        .set('x-auth-token', token)
        .send({ name, price, description, validityDay, isEnable });
    };
    describe('check Authorization', () => {
      it('should retrun status 401 if user is not login', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should retrun status 403 if client is not admin', async () => {
        await User.deleteMany({});
        userData = new User({
          name: 'Bibek',
          email: 'shresthabbk001s@gamil.com',
          password: '123456',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Check Validation', () => {
      describe('Id validation', () => {
        it('should return status 400 if id is not valid', async () => {
          id = '1234';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if id package is not exist', async () => {
          await Package.deleteMany({});
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });

      describe('name validation', () => {
        it('should return status 400 if name is less than 4 char', async () => {
          name = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is more than 50 char', async () => {
          name = new Array(52).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is not provided', async () => {
          name = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Price validation', () => {
        it('should return status 400 if price is more than 100 char', async () => {
          price = new Array(52).join('1');
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if price is not provided', async () => {
          price = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('validityDay validation', () => {
        it('should return status 400 if validityDay is not provided', async () => {
          validityDay = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('description validation', () => {
        it('should return status 400 if description is less than 5 char', async () => {
          description = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if description is more than 1001 char', async () => {
          description = new Array(10001).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    it('should update package and return status 200', async () => {
      name = 'Yearly';
      price = 100;
      description = 'now its time to buy';
      validityDay = 20;
      isEnable = false;
      const res = await exec();
      packageData = await Package.findById(id);
      expect(packageData.name).toBe(name);
      expect(res.status).toBe(200);
    });
  });
  describe('toogle package by admin UPDATE /api/v1/packages/toogle/:id', () => {
    const exec = () => {
      return request(server)
        .put(`/api/v1/packages/toogle/${id}`)
        .set('x-auth-token', token);
    };
    describe('check Authorization', () => {
      it('should retrun status 401 if user is not login', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should retrun status 403 if client is not admin', async () => {
        await User.deleteMany({});
        userData = new User({
          name: 'Bibek',
          email: 'shresthabbk001s@gamil.com',
          password: '123456',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Id validation', () => {
      it('should return status 400 if id is not valid', async () => {
        id = '1234';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if id package is not exist', async () => {
        await Package.deleteMany({});
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    // check package isEnable, if enable is true, make it false and vice-versa
    it('should isEnable be true if it is false', async () => {
      await Package.findByIdAndUpdate(id, {
        isEnable: false,
      });
      const res = await exec();
      packageData = await Package.findById(id);
      expect(packageData.isEnable).toBe(true);
      expect(res.status).toBe(200);
    });

    it('should isEnable be false if it is true', async () => {
      await Package.findByIdAndUpdate(id, {
        isEnable: true,
      });
      const res = await exec();
      packageData = await Package.findById(id);
      expect(packageData.isEnable).toBe(false);
      expect(res.status).toBe(200);
    });
  });
  describe('DELETE package by admin DELETE /api/v1/packages/', () => {
    let packageIds;
    beforeEach(async () => {
      let package1 = await Package.create({
        name: '12345',
        isEnable: false,
        price: 125,
        validityDay: 1324,
        description: 'Hurry up',
      });
      let package2 = await Package.create({
        name: '12345',
        isEnable: true,
        price: 125,
        validityDay: 1324,
        description: 'Hurry up',
      });
      let package3 = await Package.create({
        name: '12345',
        isEnable: true,
        price: 125,

        validityDay: 1324,
        description: 'Hurry up',
      });
      packageIds = [package1._id, package3._id, package2._id];
    });
    const exec = () => {
      return request(server)
        .delete('/api/v1/packages/')
        .set('x-auth-token', token)
        .send({
          packageIds,
        });
    };
    describe('check Authorization', () => {
      it('should retrun status 401 if user is not login', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should retrun status 403 if client is not admin', async () => {
        await User.deleteMany({});
        userData = new User({
          name: 'Bibek',
          email: 'shresthabbk001s@gamil.com',
          password: '123456',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('validate id', () => {
      it('should retrun status 400 if packageIds is invalid ', async () => {
        packageIds = ['123', '1245', '1254'];
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retrun status 400 if packageIds is invalid ', async () => {
        packageIds = [mongoose.Types.ObjectId()];
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });

    it('should delete the package and send status 200', async () => {
      const res = await exec();
      await packageIds.map(async (id) => {
        packageData = await Package.findById(packageIds[id]);
        expect(packageData).toBeNull();
      });
      expect(res.status).toBe(200);
    });
  });
});
