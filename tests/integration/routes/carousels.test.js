const request = require('supertest');
const { User } = require('../../../models/userModel');
const { Carousal } = require('../../../models/carouselModel');

describe('Carousels /api/v1/carousels/', () => {
  let server, token, user;
  beforeEach(() => {
    server = require('../../../index');
  });

  beforeEach(async () => {
    user = new User({
      name: 'Bibek',
      email: 'Shresthabbks@gmail.com',
      password: '1234556',
      role: 'admin',
    });
    user = await user.save();
    token = user.generateAuthToken();
  });
  afterEach(async () => {
    await Carousal.deleteMany({});
    await User.deleteMany({});
    await server.close();
  });
  describe('Create or update Crausels PUT /api/v1/carousels/', () => {
    let name, subDetail, detail, price, priceLabel;
    beforeEach(() => {
      name = 'Meropustakalaya';
      subDetail = 'Why meropustakalaya?';
      detail = 'It is one of the Nepal leading online sides.';
      price = 200;
      priceLabel = 'Monthly';
    });
    const exec = () => {
      return request(server)
        .put('/api/v1/carousels/')
        .set('x-auth-token', token)
        .send({ name, subDetail, detail, price, priceLabel });
    };
    describe('Auth Validation', () => {
      it('should return status 401 if client is not logedin', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        user = new User({
          name: 'Bibek',
          email: 'Shresthabbk00s@gmail.com',
          password: '1234556',
          role: 'user',
        });
        user = await user.save();
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });

    describe('field Validation', () => {
      describe('name validation', () => {
        it('should return status 400 if name is not send', async () => {
          name = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is less then 2char', async () => {
          name = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is more than 100char', async () => {
          name = new Array(105).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('subDetail validation', () => {
        it('should return status 400 if subDetail is not send', async () => {
          subDetail = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if subDetail is less then 2char', async () => {
          subDetail = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if subDetail is more than 100char', async () => {
          subDetail = new Array(505).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Detail validation', () => {
        it('should return status 400 if detail is not send', async () => {
          detail = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if detail is less then 2char', async () => {
          detail = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if detail is more than 100char', async () => {
          detail = new Array(505).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Pricelabel validation', () => {
        it('should return status 400 if priceLabel is not send', async () => {
          priceLabel = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if priceLabel is less then 2char', async () => {
          priceLabel = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if priceLabel is more than 100char', async () => {
          priceLabel = new Array(505).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Price validation', () => {
        it('should return status 400 if price is string', async () => {
          price = 'asdf';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if price is not send', async () => {
          price = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if price is less then 2char', async () => {
          price = -1;
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if price is more than 10000', async () => {
          price = 20000;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    it('should create carousel if it is not created', async () => {
      await exec();
      let carousel = await Carousal.findOne({});
      expect(carousel).not.toBeNull();
    });
    it('should update carousel if it is  created', async () => {
      name = 'Name';
      subDetail = 'subDetail';
      detail = 'detail';
      price = 123;
      priceLabel = '12434';
      await Carousal.create({
        name,
        subDetail,
        detail,
        price,
        priceLabel,
      });
      await exec();
      let carousel = await Carousal.findOne({});
      expect(carousel.name).toBe(name);
      expect(carousel.price).toBe(price);
      expect(carousel.subDetail).toBe(subDetail);
      expect(carousel.priceLabel).toBe(priceLabel);
      expect(carousel.detail).toBe(detail);
    });
    it('should return status 201 ', async () => {
      const res = await exec();
      expect(res.status).toBe(201);
      expect(res.body.data).not.toBeNull();
    });
  });
  describe('Get carousels Get /api/v1/carousels', () => {
    const exec = () => {
      return request(server).get('/api/v1/carousels/');
    };
    it('should return status 200 with carousels data', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
});
