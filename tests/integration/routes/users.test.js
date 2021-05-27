const request = require('supertest');
const { User } = require('../../../models/userModel');
const { Subscription } = require('../../../models/subsriptionModel');
const { Package } = require('../../../models/packageModel');
const mongoose = require('mongoose');
const moment = require('moment');
const { Book } = require('../../../models/bookModel');
const { Review } = require('../../../models/reviewModel');
describe('USER ', () => {
  let server, token, users;
  beforeEach(async () => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    users = new User({
      name: 'bibek',
      email: 'srehs@gmail.com',
      password: '123456',
      role: 'admin',
    });
    let subscription = await Subscription.create({
      user_id: users._id,
      packages: {
        name: 'Annul',
        description: 'Hurry Up',
        price: 200,
        validityDay: 200,
        isEnable: true,
      },
      expires_at: Date.now(),
    });
    users.subscriptionDetail = subscription._id;
    users = await users.save();

    token = users.generateAuthToken();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Package.deleteMany({});
    await Subscription.deleteMany({});
    await Book.deleteMany({});
    await server.close();
  });
  describe('Get me /api/v1/users/me', () => {
    const exec = () => {
      return request(server).get('/api/v1/users/me').set('x-auth-token', token);
    };
    it('should return status 401 if client is not loged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return status 200 with user data', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body.data).not.toBeNull();
    });
  });

  describe('GET  USERS /api/v1/users/', () => {
    beforeEach(async () => {
      let user1 = await User.create({
        name: 'cartoon',
        email: 'email3@gmail.com',
        password: '123456',
        role: 'user',
      });
      await User.create({
        name: 'ballon',
        email: 'email1@gmail.com',
        password: '123456',
        role: 'user',
      });
      await User.create({
        name: 'apple',
        email: 'email2@gmail.com',
        password: '123456',
        role: 'admin',
      });
      await User.create({
        name: 'zebra',
        email: 'email56@gmail.com',
        password: '123456',
        role: 'user',
        isVerfied: true,
      });

      let packageData = await Package.create({
        name: 'summer',
        description: 'hurry up',
        price: 100,
        validityDay: 20,
      });
      let subscriptionDetail = await Subscription.create({
        user_id: user1._id,
        packages: packageData,
        start_at: new Date(),
        expires_at: new Date(moment().add(20, 'days').format()),
      });
      await User.findByIdAndUpdate(
        { _id: user1._id },
        { subscriptionDetail: subscriptionDetail._id }
      );
    });
    let sort;
    let filter;
    const exec = () => {
      return request(server)
        .get(`/api/v1/users?sort=${sort}&filter=${filter}`)
        .set('x-auth-token', token);
    };
    describe('Auth', () => {
      it('should return status 401 if client is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        let users = new User({
          name: 'bibek',
          email: 'srehssd@gmail.com',
          password: '123456',
          role: 'user',
        });
        users = await users.save();
        token = users.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    it('should filter role = admin', async () => {
      filter = 'admin';
      const res = await exec();
      const { data } = res.body;
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'admin',
          }),
        ])
      );
    });
    it('should filter role = user', async () => {
      filter = 'user';
      const res = await exec();
      const { data } = res.body;
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'user',
          }),
        ])
      );
    });
    it('should filter email = verified', async () => {
      filter = 'verified';
      const res = await exec();
      const { data } = res.body;
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isVerfied: true,
          }),
        ])
      );
    });
    it('should filter email = unVerfied', async () => {
      filter = 'unverified';
      const res = await exec();
      const { data } = res.body;
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            isVerfied: false,
          }),
        ])
      );
    });
    it('should filter user = subscribe', async () => {
      filter = 'subscribe';
      const res = await exec();
      const { data } = res.body;
      expect(data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            subscriptionDetail: expect.any(Object),
          }),
        ])
      );
    });
    it('should filter user = unsubscribe', async () => {
      filter = 'unsubscribe';
      const res = await exec();
      const { data } = res.body;
      expect(data).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            subscriptionDetail: expect.any(Object),
          }),
        ])
      );
    });
    it('should return status 200 if client is admin', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
  describe('GET  USER /api/v1/users/:id', () => {
    let id;
    beforeEach(async () => {
      userData = await User.create({
        name: 'cartoon',
        email: 'email8@gmail.com',
        password: '123456',
        role: 'user',
      });
      id = userData._id;
    });
    const exec = () => {
      return request(server)
        .get(`/api/v1/users/${id}`)
        .set('x-auth-token', token);
    };
    describe('Auth', () => {
      it('should return status 401 if client is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        let users = new User({
          name: 'bibek',
          email: 'srehssd@gmail.com',
          password: '123456',
          role: 'user',
        });
        users = await users.save();
        token = users.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Validate Id', () => {
      it('should return status 400 if id is not valid', async () => {
        id = '1223';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if id is not exists', async () => {
        await User.findByIdAndDelete(id);
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return status 200 if client send valid id', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
  describe('Post  /api/v1/users/create', () => {
    let name;
    let email;
    let password;
    let role;
    beforeEach(() => {
      name = 'Bibek SHrestha';
      email = 'shresthabbks@gmail.com';
      password = 'shreadfasdf';
      role = 'user';
    });

    const exec = () => {
      return request(server)
        .post('/api/v1/users/create')
        .set('x-auth-token', token)
        .send({
          name: name,
          email: email,
          password: password,
          role: role,
        });
    };
    describe('Auth', () => {
      it('should return status 401 if client is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        users = new User({
          name: 'bibek',
          email: 'srehssd@gmail.com',
          password: '123456',
          role: 'user',
        });
        users = await users.save();
        token = users.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('name', () => {
      it('should retun status 400 if admin not send name ', async () => {
        name = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if admin name is less than 4char ', async () => {
        name = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if admin name is more  than 50char ', async () => {
        name = new Array(55).join('a');
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('email', () => {
      it('should retun status 400 if admin not send email ', async () => {
        email = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if admin send invalid email ', async () => {
        email = '1234';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('password', () => {
      it('should retun status 400 if admin not send password ', async () => {
        password = '';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should retun status 400 if admin send password less than 4 char ', async () => {
        password = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('role', () => {
      it('should retun status 400 if admin role is nither user nor admin ', async () => {
        role = 'asdf';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return 400 if user send email that already exists in db', async () => {
      let userData = new User({
        name: 'bibekshre',
        email: email,
        password: '1234567',
      });
      await userData.save();
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should save email, password, name, role in db if user send valid data', async () => {
      await exec();
      const userData = await User.findOne({ email: email });
      expect(userData).not.toBeNull();
    });
    it('should send status 201 if user send valid data', async () => {
      const res = await exec();
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/v1/users/', () => {
    let name;
    beforeEach(() => {
      name = 'hellow';
    });
    const exec = () => {
      return request(server)
        .put('/api/v1/users/')
        .set('x-auth-token', token)
        .send({ name: name });
    };
    it('should return status 401 if client is not loged', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    describe('Validate name', () => {
      it('should return status 400 if name is less than 4 char', async () => {
        name = '123';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if name is more than 50 char', async () => {
        name = new Array(52).join('1');
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should update name if client send valid name', async () => {
      const res = await exec();
      users = await User.findById(users._id);
      expect(users.name).toBe(name);
      expect(res.status).toBe(200);
    });
  });
  describe('DELETE user  /api/v1/users/', () => {
    let userIds, book;
    beforeEach(async () => {
      let user1 = await User.create({
        name: 'cartoon',
        email: 'email4@gmail.com',
        password: '123456',
        role: 'user',
      });
      let user2 = await User.create({
        name: 'cartoon',
        email: 'email5@gmail.com',
        password: '123456',
        role: 'user',
      });
      let user3 = await User.create({
        name: 'cartoon',
        email: 'email6@gmail.com',
        password: '123456',
        role: 'user',
      });
      userIds = [user1._id, user3._id, user2._id];
      book = await Book.create({
        name: 'Atomic',
        autherName: 'Bibek',
        pages: 200,
        description: 'NIce Book',
        category: 'Personal',
        file: 'asdf.jpg',
        photo: 'asdf',
      });
      book = book._id;
      await Review.create({
        user: user1._id,
        book: book,
        review: 'Nice book',
        rating: 2,
      });
      await Review.create({
        user: user2._id,
        book: book,
        review: 'Nice book',
        rating: 2,
      });
      await Review.create({
        user: user3._id,
        book: book,
        review: 'Nice book',
        rating: 2,
      });
    });
    const exec = () => {
      return request(server)
        .delete('/api/v1/users/')
        .set('x-auth-token', token)
        .send({
          userIds,
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
    it('should retrun status 400 if userIds is invalid ', async () => {
      userIds = ['123', '1245', '1254'];
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should retrun status 400 if userIds is invalid ', async () => {
      userIds = [mongoose.Types.ObjectId];
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should delete review', async () => {
      await exec();
      const review = await Review.find({ user: { $in: userIds } });

      expect(review.length).toBe(0);
    });

    it('should delete the user and send status 200', async () => {
      const res = await exec();
      let user = await User.find({ _id: { $in: userIds } });
      expect(user.length).toBe(0);
      expect(res.status).toBe(200);
    });
  });
  describe('Post save /api/v1/users/saves/:id', () => {
    let book;
    beforeEach(async () => {
      book = await Book.create({
        name: 'Atomic',
        autherName: 'Bibek',
        pages: 200,
        description: 'NIce Book',
        category: 'Personal',
        file: 'asdf.jpg',
        photo: 'asdf',
      });
      book = book._id;
    });
    const exec = () => {
      return request(server)
        .post(`/api/v1/users/saves/${book}`)
        .set('x-auth-token', token);
    };
    it('should returns status 401 if not loged ', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return sttaus if bookId is invalid', async () => {
      book = 'asdf';
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should return status 400 if id not found', async () => {
      book = mongoose.Types.ObjectId();
      const res = await exec();
      expect(res.status).toBe(400);
    });
    it('should save book id in userModel, not save duplicate book', async () => {
      await User.findByIdAndUpdate(users._id, {
        $push: { saveBook: book },
      });
      await exec();
      let user = await User.findById(users._id);
      expect(user.saveBook.length).toBe(0);
    });
    it('should return status 200', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
  describe('GET /api/v1/users/saves', () => {
    let book;
    beforeEach(async () => {
      book = await Book.create({
        name: 'Atomic',
        autherName: 'Bibek',
        pages: 200,
        description: 'NIce Book',
        category: 'Personal',
        file: 'asdf.jpg',
        photo: 'asdf',
      });
      book = book._id;
      await User.findByIdAndUpdate(
        users._id,
        {
          $push: { saveBook: book },
        },
        { new: true }
      );
    });
    const exec = () => {
      return request(server)
        .get('/api/v1/users/saves/')
        .set('x-auth-token', token);
    };
    it('should return status 401 if client is not loged', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return status 200', async () => {
      const res = await exec();
      expect(res.body.data).not.toBeNull();
      expect(res.status).toBe(200);
    });
  });
});
