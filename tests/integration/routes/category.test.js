const request = require('supertest');
const { Category } = require('../../../models/categoryModel');
const { User } = require('../../../models/userModel');
const mongoose = require('mongoose');
describe('Category /api/v1/categories/', () => {
  let server;
  let name;
  let token;
  let id;
  let userData;
  let role, category;

  beforeEach(async () => {
    server = require('../../../index');
    category = await Category.create({ name: '12434', title: '12345' });
  });
  beforeEach(() => {
    name = '12345';
    title = '12345';
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
  afterEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
    await server.close();
  });

  describe('POST /api/v1/categories/', () => {
    const exec = () => {
      return request(server)
        .post('/api/v1/categories/')
        .set('x-auth-token', token)
        .send({
          name: name,
          title: title,
        });
    };
    it('should return status 401 if client is not loged in ', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return status 403 if client is not admin ', async () => {
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
    describe('Name validity', () => {
      it(' return status 400 if name is less than 3 char', async () => {
        name = '1';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it(' return status 400 if name is more than 50 char', async () => {
        name = new Array(52).join('12');
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it(' return status 400 if name is not unique', async () => {
        await Category.create({ name: name, title: title });
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('Title validity', () => {
      it(' return status 400 if title is less than 3 char', async () => {
        title = '1';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it(' return status 400 if title is more than 50 char', async () => {
        title = new Array(52).join('12');
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return status 201 if category is created ', async () => {
      const res = await exec();
      const result = await Category.findOne({ name: name });
      expect(result).not.toBeNull();
      expect(res.status).toBe(201);
    });
  });
  describe('GET /api/v1/categories/', () => {
    const exec = () => {
      return request(server).get('/api/v1/categories/');
    };
    it('should retrun status 200 ', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
  describe('DELETE /api/v1/categories/', () => {
    let categoryIds = [],
      category1,
      category2;
    beforeEach(async () => {
      category1 = await Category.create({
        name: '12345',
        title: '1234',
      });
      category2 = await Category.create({ name: '67896', title: '2333' });
      categoryIds = [category1._id, category2._id];
    });
    const exec = () => {
      return request(server)
        .delete('/api/v1/categories/')
        .set('x-auth-token', token)
        .send({
          categoryIds: categoryIds,
        });
    };
    describe('Auth', () => {
      it('should return status 401 if client is not login', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        userData = new User({
          name: 'Biebk ser',
          email: 'shresthas@gamil.com',
          role: 'user',
          password: '123456',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Validate ids', () => {
      it(' retrun status 400 if categoryId is invalid', async () => {
        categoryIds = ['123', '125'];
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it(' retrun status 400 if categoryId is invalid', async () => {
        categoryIds = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });

    it('should return status 200 if client is admin and ids are valid', async () => {
      const res = await exec();
      category1 = await Category.findById(category1._id);
      category2 = await Category.findById(category2._id);
      expect(category1).toBeNull();
      expect(category2).toBeNull();
      expect(res.status).toBe(200);
    });
  });

  describe('PUT /api/v1/categories/', () => {
    beforeEach(async () => {
      id = category._id;
      name = '12345';
      title = '56789';
    });
    const exec = () => {
      return request(server)
        .put('/api/v1/categories/')
        .set('x-auth-token', token)
        .send({
          category_id: id,
          name: name,
          title: title,
        });
    };
    describe('Authentication', () => {
      it('should return status 401 if client is not loged in ', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin ', async () => {
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
    describe('Id validation', () => {
      it('should retrun status 400 if category id is not valid', async () => {
        id = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retrun status 400 if category id is not valid', async () => {
        id = mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });

    describe('Name validity', () => {
      it(' return status 400 if name is less than 3 char', async () => {
        name = '1';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it(' return status 400 if name is more than 50 char', async () => {
        name = new Array(52).join('12');
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });

    it('should return status 200 if category is updated ', async () => {
      const res = await exec();
      const result = await Category.findById(id);
      expect(res.status).toBe(200);
      expect(result.title).toBe(title);
      expect(result.name).toBe(name);
    });
  });
});
