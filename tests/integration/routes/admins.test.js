const mongoose = require('mongoose');
const request = require('supertest');
const { Book } = require('../../../models/bookModel');
const { Category } = require('../../../models/categoryModel');
const { Package } = require('../../../models/packageModel');
const { Review } = require('../../../models/reviewModel');
const { Subscription } = require('../../../models/subsriptionModel');
const { User } = require('../../../models/userModel');
describe('Admin', () => {
  let server, token, user;
  beforeEach(async () => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    user = await User.create({
      email: 'shrestha@gmail.com',
      password: '123456',
      name: 'Bibek',
      role: 'admin',
    });
    token = user.generateAuthToken();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Package.deleteMany({});
    await Review.deleteMany({});
    await Subscription.deleteMany({});
    await Category.deleteMany({});
    await Book.deleteMany({});
    await server.close();
  });
  describe('Dashboard GET /api/v1/admins/dashboard', () => {
    beforeEach(async () => {
      await Package.create({
        name: 'winter',
        description: 'Get it now',
        price: 200,
        validityDay: 100,
      });
      await Review.create({
        user: mongoose.Types.ObjectId(),
        book: mongoose.Types.ObjectId(),
        review: 'Nice book',
        rating: 2,
      });
      await Review.create({
        user: mongoose.Types.ObjectId(),
        book: mongoose.Types.ObjectId(),
        review: 'Nice book',
        rating: 2,
      });
      await Subscription.create({
        user_id: mongoose.Types.ObjectId(),
        packages: {
          name: 'winter',
          description: 'Get it now',
          price: 200,
          validityDay: 100,
        },
        expires_at: Date.now(),
      });
      await Subscription.create({
        user_id: mongoose.Types.ObjectId(),
        packages: {
          name: 'winter',
          description: 'Get it now',
          price: 200,
          validityDay: 100,
        },
        expires_at: Date.now() + 3600 * 60 * 100,
      });
      await Category.create({
        name: 'fiction',
        title: 'Fiction',
      });
      await Book.create({
        name: 'Rich Dad poor Dad',
        autherName: 'Bibek',
        pages: 200,
        description: 'Book with many financial knowledge',
        category: 'fiction',
        photo: '../',
        file: '../',
      });
      await Book.create({
        name: 'Rich Dad poor Dad',
        autherName: 'Bibek',
        pages: 200,
        description: 'Book with many financial knowledge',
        category: 'fiction',
        photo: '../',
        file: '../',
      });
      await User.create({
        email: 'email1@gmail.com',
        password: '123456',
        name: 'Bibek',
        role: 'admin',
        isVerfied: true,
      });
      await User.create({
        email: 'email2@gmail.com',
        password: '123456',
        name: 'Bibek',
        role: 'user',
      });
      await User.create({
        email: 'email3@gmail.com',
        password: '123456',
        name: 'Bibek',
        isVerfied: true,
      });
    });
    const exec = () => {
      return request(server)
        .get('/api/v1/admins/dashboard')
        .set('x-auth-token', token);
    };
    it('should return status 200', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      let property = [
        {
          name: 'totalPackage',
          total: 1,
        },
        {
          name: 'totalCategory',
          total: 1,
        },
        {
          name: 'totalReview',
          total: 2,
        },
        {
          name: 'totalSubscribeUser',
          total: 1,
        },
        {
          name: 'totalBook',
          total: 2,
        },
        {
          name: 'totalAdmin',
          total: 2,
        },
        {
          name: 'totalVerifiedUser',
          total: 1,
        },
        {
          name: 'totalUnverifiedUser',
          total: 1,
        },
      ];
      property.map((e) => {
        expect(res.body.data).toHaveProperty(e.name, e.total);
      });
    });
  });
});
