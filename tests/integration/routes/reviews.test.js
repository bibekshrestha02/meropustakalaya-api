const request = require('supertest');
const { Review } = require('../../../models/reviewModel');
const { Book } = require('../../../models/bookModel');
const { User } = require('../../../models/userModel');
const mongoose = require('mongoose');
describe('Review /api/v1/reviews/', () => {
  let server, book, book2, review, rating, token, user, reviewId;
  beforeEach(() => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    user = await User.create({
      name: 'Bibek',
      email: 's23hrestha@gmail.com',
      password: '123444',
    });
    token = user.generateAuthToken();
  });
  beforeEach(async () => {
    book = await Book.create({
      name: '1233455',
      autherName: '1233455',
      pages: 142,
      file: 'asdf',
      photo: '/asdf/',
      description: '1233455',
      category: 'book',
    });
    book = book._id;
    book2 = await Book.create({
      name: '1233455',
      autherName: '1233455',
      pages: 142,
      file: 'asdf',
      photo: '/asdf/',
      description: '1233455',
      category: 'book',
    });
    book2 = book2._id;
  });
  beforeEach(() => {
    review = 'Nice book';
    rating = 5;
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});
    await Review.deleteMany({});
    await server.close();
  });
  describe('POST /api/v1/reviews/', () => {
    const exec = () => {
      return request(server)
        .post('/api/v1/reviews/')
        .set('x-auth-token', token)
        .send({
          book: book._id,
          review,
          rating,
        });
    };
    describe('Authorization', () => {
      it('should return status 401 is user is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
    });
    describe('Validation', () => {
      describe('Rating validation', () => {
        it('should return status 400 if rating is more than 5', async () => {
          rating = 6;
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if rating is less than 1', async () => {
          rating = 0;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('book validation', () => {
        it('should return status 400 if book id is invalid', async () => {
          book = '122';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if book is not exists in db', async () => {
          book = mongoose.Types.ObjectId();
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('review validation', () => {
        it('should return status 400 if review is not send ', async () => {
          review = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if review is not send ', async () => {
          review = new Array(50001).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('double rating', () => {
        it('should return status 400', async () => {
          await Review.create({
            user: user._id,
            book: book._id,
            review: review,
            rating: rating,
          });
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    describe('should return status 201', () => {
      it('save rating in db', async () => {
        const res = await exec();
        const fields = ['user', 'book', 'review', 'rating'];
        fields.map((field) => {
          expect(res.body.data).toHaveProperty(field);
        });
        expect(res.status).toBe(201);
      });
      it('should updata book rating and total number of rating', async () => {
        await Review.create({
          book: book,
          user: mongoose.Types.ObjectId(),
          review: 'Nice book',
          rating: 2,
        });
        await exec();

        book = await Book.findById(book);
        expect(book.rating).toBe(3.5);
        expect(book.numberOfRating).toBe(2);
      });
    });
  });
  describe('PUT /api/v1/reviews/:id', () => {
    let reviewId;
    beforeEach(async () => {
      reviewId = await Review.create({
        book: book,
        user: user._id,
        review: 'Nice book',
        rating: 2,
      });
      reviewId = reviewId._id;
    });
    const exec = () => {
      return request(server)
        .put(`/api/v1/reviews/${reviewId}`)
        .set('x-auth-token', token)
        .send({
          book,
          rating,
          review,
        });
    };
    describe('Authorization', () => {
      it('should return status 401 is user is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if anyone else tries to update reivew', async () => {
        user = await User.create({
          name: 'Bibek',
          email: 'Shrestha01@gmail.com',
          password: '123444',
        });
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Validation', () => {
      describe('Rating validation', () => {
        it('should return status 400 if rating is more than 5', async () => {
          rating = 6;
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if rating is less than 1', async () => {
          rating = 0;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('book validation', () => {
        it('should return status 400 if book id is invalid', async () => {
          book = '122';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if book is not exists in db', async () => {
          book = mongoose.Types.ObjectId();
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('review validation', () => {
        it('should return status 400 if review is not send ', async () => {
          review = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if review is not send ', async () => {
          review = new Array(50001).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('reviewId validation', () => {
        it('should return status 400 if review Id is invalid', async () => {
          reviewId = 'asdf';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if review Id is invalid', async () => {
          reviewId = mongoose.Types.ObjectId();
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    describe('return status 200', () => {
      it('should update reivew', async () => {
        review = 'fantastic Book';
        rating = 3;
        const res = await exec();
        review = await Review.findOne({ review: review, rating: rating });
        expect(review).not.toBeNull();
        expect(res.status).toBe(200);
      });
      it('should update book review', async () => {
        review = 'fantastic Book';
        rating = 1;
        const res = await exec();
        book = await Book.findById(book);
        expect(book.rating).toBe(rating);
        expect(book.numberOfRating).toBe(1);
        expect(res.status).toBe(200);
      });
    });
  });
  describe('DELETE /api/v1/reviews/:id', () => {
    beforeEach(async () => {
      reviewId = await Review.create({
        book: book,
        user: user._id,
        review: 'Nice book',
        rating: 2,
      });
      reviewId = reviewId._id;
    });
    const exec = () => {
      return request(server)
        .delete(`/api/v1/reviews/${reviewId}`)
        .set('x-auth-token', token);
    };
    describe('Authorization', () => {
      it('should return status 401 is user is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if anyone else tries to delete reivew except admin and reviewbelongs', async () => {
        user = await User.create({
          name: 'Bibek',
          email: 'Shrestha01@gmail.com',
          password: '123444',
        });
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('validation return status 400', () => {
      describe('id validaiton', () => {
        it('if invalid id is send  ', async () => {
          reviewId = '123';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('if invalid id is send  ', async () => {
          reviewId = mongoose.Types.ObjectId();
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('role validation', () => {
        it('should return status 400 if client role is not admin and review not belongs to that client', async () => {
          user = await User.create({
            name: 'Bibek',
            email: 'shresthabbkss@gmail.com',
            password: '123444',
          });
          token = user.generateAuthToken();
          const res = await exec();
          expect(res.status).toBe(403);
        });
      });
    });
    it('should delete review from admin', async () => {
      user = await User.create({
        name: 'Bibek',
        email: 'shresthabbks02@gmail.com',
        password: '123444',
        role: 'admin',
      });
      token = user.generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(200);
    });

    it('should return status 200', async () => {
      const res = await exec();
      review = await Review.findById(reviewId);
      book = await Book.findById(book);
      expect(book.rating).toBe(4.5);
      expect(book.numberOfRating).toBe(0);
      expect(review).toBeNull();
      expect(res.status).toBe(200);
    });
  });
  describe('DELETE MULTIPLE /api/v1/reviews/', () => {
    let ids = [],
      review1,
      review2,
      review3,
      review4;
    beforeEach(async () => {
      review1 = await Review.create({
        book: book,
        user: mongoose.Types.ObjectId(),
        review: 'Nice book',
        rating: 2,
      });
      review3 = await Review.create({
        book: book,
        user: mongoose.Types.ObjectId(),
        review: 'Book1R2',
        rating: 5,
      });

      review2 = await Review.create({
        book: book2,
        user: mongoose.Types.ObjectId(),
        review: 'Nice SuperId',
        rating: 3,
      });
      review4 = await Review.create({
        book: book2,
        user: mongoose.Types.ObjectId(),
        review: 'Book2R2',
        rating: 4,
      });
      ids = [review1._id, review2._id];
      user = await User.create({
        name: 'Bibek',
        email: 'shrestha008@gmail.com',
        password: '123444',
        role: 'admin',
      });
      token = user.generateAuthToken();
    });
    const exec = () => {
      return request(server)
        .delete('/api/v1/reviews/')
        .set('x-auth-token', token)
        .send({
          ids,
        });
    };
    describe('Authorization', () => {
      it('should return status 401 if client is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        user = await User.create({
          name: 'Bibek',
          email: 'Shrestha01@gmail.com',
          password: '123444',
        });
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Validation ids', () => {
      it('should return status 400 if ids is not valid', async () => {
        ids = ['123', '233'];
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if ids review is not exists in db', async () => {
        ids = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should delte reviews', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      review = await Review.find({ _id: { $in: ids } });
      expect(review).toHaveLength(0);
    });

    it('should update book review', async () => {
      await exec();
      book = await Book.findById(book);
      book2 = await Book.findById(book2);
      expect(book2.rating).toBe(4);
      expect(book.rating).toBe(5);
    });
    it('should update book rating to 4.5', async () => {
      await Review.deleteMany({ _id: review3._id });
      await Review.deleteMany({ _id: review4._id });

      const res = await exec();

      book = await Book.findById(book);
      book2 = await Book.findById(book2);
      expect(res.status).toBe(200);

      expect(book2.rating).toBe(4.5);
      expect(book.rating).toBe(4.5);
    });

    // update book review
    // return status 200
  });
  describe('GET /api/v1/reivews/', () => {
    beforeEach(async () => {
      user = await User.create({
        email: 'shrestha123@gmail.com',
        role: 'admin',
        password: 's1234556',
        name: 'Bibeks ',
      });
      token = user.generateAuthToken();
    });
    beforeEach(async () => {
      await Review.create({
        user: user._id,
        book: book,
        review: 'nice book',
        rating: 3,
      });
      await Review.create({
        user: user._id,
        book: book2,
        review: 'nice super',
        rating: 3,
      });
    });
    const exec = () => {
      return request(server).get('/api/v1/reviews').set('x-auth-token', token);
    };
    describe('Authorization', () => {
      it('should return status 401 is user is not loged', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 is user is not admin', async () => {
        user = await User.create({
          email: 'shres@gmail.com',
          password: 's1234556',
          name: 'Bibeks ',
        });
        token = user.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    it('should return status 200', async () => {
      // await Review.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
});
