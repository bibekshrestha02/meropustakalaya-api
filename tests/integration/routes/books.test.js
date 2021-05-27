const request = require('supertest');
const { User } = require('../../../models/userModel');
const fs = require('mz/fs');
const { Category } = require('../../../models/categoryModel');
const { Book } = require('../../../models/bookModel');
const { Review } = require('../../../models/reviewModel');
const { deleteFiles } = require('../../../helpers/helperFn');
const moment = require('moment');
const { Subscription } = require('../../../models/subsriptionModel');
const mongoose = require('mongoose');
describe('book /api/v1/books/', () => {
  let server,
    book,
    token,
    userData,
    name,
    autherName,
    pages,
    description,
    categoryId,
    bookFile,
    bookId,
    bookImage;

  beforeEach(() => {
    server = require('../../../index');
  });
  beforeEach(async () => {
    name = 'Atomic Habit';
    autherName = 'Bibek';
    pages = 200;
    description = 'Atomic habit is a book read by bibek shreshta';
    let { _id } = await Category.create({
      name: 'PersonalDevelopment',
      title: '1234',
    });
    categoryId = _id;
    bookFile = `${__dirname}/testFiles/book.pdf`;
    bookImage = `${__dirname}/testFiles/image.jpg`;
  });
  beforeEach(async () => {
    userData = new User({
      name: 'Bibek',
      email: 'Shresthabbks@gmail.com',
      password: '1234556',
      role: 'admin',
    });
    userData = await userData.save();
    token = userData.generateAuthToken();
  });
  afterEach(async () => {
    await User.deleteMany({});
    await Book.deleteMany({});
    await Category.deleteMany({});
    await Review.deleteMany({});
    await server.close();
  });
  describe('POST /api/v1/books', () => {
    const exec = () => {
      return request(server)
        .post('/api/v1/books/')
        .set('x-auth-token', token)
        .field('name', name)
        .field('pages', pages)
        .field('autherName', autherName)
        .field('description', description)
        .field('categoryId', categoryId.toString())
        .attach('bookFile', bookFile)
        .attach('bookImage', bookImage);
    };
    describe('Authorization', () => {
      it('should return status 401 if client is not loged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      // it('should return status 403 if client is not admin', async () => {
      //   userData = new User({
      //     name: 'Bibek',
      //     email: 'Shresthabb@gmail.com',
      //     password: '1234556',
      //     role: 'user',
      //   });
      //   userData = await userData.save();
      //   token = userData.generateAuthToken();
      //   const res = await exec();
      //   expect(res.status).toBe(403);
      // });
    });

    describe('validation', () => {
      describe('Name validation', () => {
        it('should return status 400 if name is less than 2char. ', async () => {
          name = '1';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is more than 80 char. ', async () => {
          name = new Array(85).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Auther name validation', () => {
        it('should return status 400 if autherName is less than 2char. ', async () => {
          autherName = '1';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if autherName is more than 80 char. ', async () => {
          autherName = new Array(82).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Pages validation', () => {
        it('should return status 400 if pages is string. ', async () => {
          pages = '12hj';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if page number is more than 5000 ', async () => {
          pages = 5001;
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if page number is less than 2', async () => {
          pages = 1;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Description validation', () => {
        it('should return status 400 if description is less than 10 character ', async () => {
          description = new Array(9).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if description is more than 2000 char. ', async () => {
          description = new Array(2005).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('CategoryId validation', () => {
        it('should return status 400 if categoryId not send', async () => {
          categoryId = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if categoryId is not valid object id ', async () => {
          categoryId = '1245';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 200 if category id is not exist in db', async () => {
          await Category.deleteMany({});
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('File validation', () => {
        it('should return status 400 if file expect pdf is send', async () => {
          bookFile = `${__dirname}/testFiles/bookE.epub`;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Photo validation', () => {
        it('should return status 400 if Image expect jpeg and png is send', async () => {
          bookImage = `${__dirname}/testFiles/bookE.epub`;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    it('should return status 200 if admin send valid data', async () => {
      const res = await exec();
      let book = await Book.findOne({ name: name });
      expect(book).not.toBeNull();
      const isBookFile = await fs.exists(book.file);
      const isBookPhoto = await fs.exists(book.photo);
      expect(isBookFile).toBeTruthy();
      expect(isBookPhoto).toBeTruthy();
      expect(res.status).toBe(201);
      await deleteFiles(book.file);
      await deleteFiles(book.photo);
    });
  });
  describe('DELETE /api/v1/books/', () => {
    let ids, book1, book2, reviewId;
    beforeEach(async () => {
      await request(server)
        .post('/api/v1/books/')
        .set('x-auth-token', token)
        .field('name', 'book1')
        .field('pages', pages)
        .field('autherName', autherName)
        .field('description', description)
        .field('categoryId', categoryId.toString())
        .attach('bookFile', bookFile)
        .attach('bookImage', bookImage);
      await request(server)
        .post('/api/v1/books/')
        .set('x-auth-token', token)
        .field('name', 'book2')
        .field('pages', pages)
        .field('autherName', autherName)
        .field('description', description)
        .field('categoryId', categoryId.toString())
        .attach('bookFile', bookFile)
        .attach('bookImage', bookImage);
      book1 = await Book.findOne({ name: 'book1' });
      book2 = await Book.findOne({ name: 'book2' });
      ids = [book1._id, book2._id];
    });
    beforeEach(async () => {
      reviewId = await Review.create({
        user: userData._id,
        book: book1._id,
        review: 'Nice book boys',
        rating: 4,
      });
    });
    afterEach(async () => {
      (await fs.exists(book1.file)) && (await deleteFiles(book1.file));

      (await fs.exists(book1.photo)) && (await deleteFiles(book1.photo));
      (await fs.exists(book2.photo)) && (await deleteFiles(book2.photo));
      (await fs.exists(book2.file)) && (await deleteFiles(book2.file));
    });
    const exec = () => {
      return request(server)
        .delete('/api/v1/books/')
        .set('x-auth-token', token)
        .send({
          ids,
        });
    };
    describe('Authorization', () => {
      it('should return status 401 if client is not loged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      it('should return status 403 if client is not admin', async () => {
        userData = new User({
          name: 'Bibek',
          email: 'Shresthabb@gmail.com',
          password: '1234556',
          role: 'user',
        });
        userData = await userData.save();
        token = userData.generateAuthToken();
        const res = await exec();
        expect(res.status).toBe(403);
      });
    });
    describe('Id validate', () => {
      it('should return status 400 if invalid id is send', async () => {
        ids = ['idafd', mongoose.Types.ObjectId()];
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if id without data in db is send', async () => {
        ids = [mongoose.Types.ObjectId(), mongoose.Types.ObjectId()];
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return status 200 if admin send valid ids', async () => {
      const res = await exec();
      const book = await Book.find({ _id: { $in: ids } });
      expect(await fs.existsSync(book1.photo)).toBeFalsy();
      expect(await fs.existsSync(book2.photo)).toBeFalsy();
      expect(await fs.existsSync(book1.file)).toBeFalsy();
      expect(await fs.existsSync(book2.file)).toBeFalsy();
      expect(await Review.findById(reviewId)).toBeNull();
      expect(book.length).toBe(0);
      expect(res.status).toBe(200);
    });
  });
  describe('PUT /api/v1/books', () => {
    beforeEach(async () => {
      await request(server)
        .post('/api/v1/books/')
        .set('x-auth-token', token)
        .field('name', 'book1')
        .field('pages', pages)
        .field('autherName', autherName)
        .field('description', description)
        .field('categoryId', categoryId.toString())
        .attach('bookFile', bookFile)
        .attach('bookImage', bookImage);
      book = await Book.findOne({ name: 'book1' });
      bookId = book._id;
    });
    afterEach(async () => {
      (await fs.exists(book.file)) && (await deleteFiles(book.file));

      (await fs.exists(book.photo)) && (await deleteFiles(book.photo));
    });
    const exec = () => {
      return request(server)
        .put(`/api/v1/books/${bookId}`)
        .set('x-auth-token', token)
        .field('name', name)
        .field('pages', pages)
        .field('autherName', autherName)
        .field('description', description)
        .field('categoryId', categoryId.toString())
        .attach('bookFile', bookFile)
        .attach('bookImage', bookImage);
    };
    describe('Authorization', () => {
      it('should return status 401 if client is not loged in', async () => {
        token = '';
        const res = await exec();
        expect(res.status).toBe(401);
      });
      // it('should return status 403 if client is not admin', async () => {
      //   try {
      //     userData = new User({
      //       name: 'Bibek',
      //       email: 'Shresthabb@gmail.com',
      //       password: '1234556',
      //       role: 'user',
      //     });
      //     userData = await userData.save();
      //     token = userData.generateAuthToken();
      //     const res = await exec();

      //     expect(res.status).toBe(403);
      //   } catch (error) {
      //     console.log(error);
      //   }
      // });
    });
    describe('Id validation', () => {
      it('should return status 400 if invalid id is send', async () => {
        bookId = mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if id without data in db is send', async () => {
        bookId = '1234';
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    describe('validation', () => {
      describe('Name validation', () => {
        it('should return status 400 if name is less than 2char. ', async () => {
          name = '1';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if name is more than 80 char. ', async () => {
          name = new Array(85).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Auther name validation', () => {
        it('should return status 400 if autherName is less than 2char. ', async () => {
          autherName = '1';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if autherName is more than 80 char. ', async () => {
          autherName = new Array(82).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Pages validation', () => {
        it('should return status 400 if pages is string. ', async () => {
          pages = '12hj';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if page number is more than 5000 ', async () => {
          pages = 5001;
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if page number is less than 2', async () => {
          pages = 1;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Description validation', () => {
        it('should return status 400 if description is less than 10 character ', async () => {
          description = new Array(9).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if description is more than 2000 char. ', async () => {
          description = new Array(2005).join('a');
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('CategoryId validation', () => {
        it('should return status 400 if categoryId not send', async () => {
          categoryId = '';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 400 if categoryId is not valid object id ', async () => {
          categoryId = '1245';
          const res = await exec();
          expect(res.status).toBe(400);
        });
        it('should return status 200 if category id is not exist in db', async () => {
          await Category.deleteMany({});
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('File validation', () => {
        it('should return status 400 if file expect pdf is send', async () => {
          bookFile = `${__dirname}/testFiles/bookE.epub`;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
      describe('Photo validation', () => {
        it('should return status 400 if Image expect jpeg and png is send', async () => {
          bookImage = `${__dirname}/testFiles/bookE.epub`;
          const res = await exec();
          expect(res.status).toBe(400);
        });
      });
    });
    it('should return status 200 if admin send valid data', async () => {
      name = 'newName';
      autherName = 'new Auther Nmae';
      pages = 200;
      const res = await exec();
      const isPreBookPhoto = await fs.exists(book.photo);
      const isPreBookFile = await fs.exists(book.file);
      expect(isPreBookFile).toBeFalsy();
      expect(isPreBookPhoto).toBeFalsy();
      book = await Book.findOne({ name: name, autherName, pages });
      const isNewBookFile = await fs.exists(book.file);
      const isNewBookPhoto = await fs.exists(book.photo);
      expect(isNewBookFile).toBeTruthy();
      expect(isNewBookPhoto).toBeTruthy();
      expect(book).not.toBeNull();
      expect(res.status).toBe(200);
      await deleteFiles(book.file);
      await deleteFiles(book.photo);
    });
  });
  describe('GET /api/v1/books/:id', () => {
    beforeEach(async () => {
      book = await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      bookId = book._id;
      await Review.create({
        user: userData._id,
        book: bookId,
        review: 'Nice book boys',
        rating: 4,
      });
      await Review.create({
        user: mongoose.Types.ObjectId(),
        book: bookId,
        review: 'Nice book boys',
        rating: 4,
      });
      await Review.create({
        user: userData._id,
        book: mongoose.Types.ObjectId(),
        review: 'Nice book boys',
        rating: 4,
      });
    });
    const exec = () => {
      return request(server)
        .get(`/api/v1/books/${bookId}`)
        .set('x-auth-token', token);
    };
    describe('Id validation', () => {
      it('should return status 400 if valid is not valid', async () => {
        bookId = '1235';
        const res = await exec();
        expect(res.status).toBe(400);
      });
      it('should return status 400 if valid is not valid', async () => {
        bookId = mongoose.Types.ObjectId();
        const res = await exec();
        expect(res.status).toBe(400);
      });
    });
    it('should return data with user review if user is loged', async () => {
      const res = await exec();
      expect(res.body.data).toHaveProperty('userReview');
    });
    it('should return review ', async () => {
      token = '';
      const res = await exec();
      expect(res.body.data).not.toHaveProperty('userReview');
    });
    it('should return status 200 with book data', async () => {
      const res = await exec();
      expect(res.body.data).toBeDefined();
      expect(res.status).toBe(200);
    });
  });
  describe('Get /api/v1/books/shows', () => {
    beforeEach(async () => {
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
      await Book.create({
        name,
        autherName,
        pages,
        file: 'asdf',
        photo: '/asdf/',
        description,
        category: 'book',
      });
    });
    const exec = () => {
      return request(server).get('/api/v1/books/shows');
    };
    it('should return status 200 with 4 books', async () => {
      const res = await exec();

      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/v1/books/', () => {
    let categories = [];
    beforeEach(async () => {
      await Book.create({
        name,
        autherName,
        pages,
        description,
        category: 'personal',
        file: '/upload/book.pdf',
        photo: '/upload/photo.jpg',
      });
      await Book.create({
        name,
        autherName,
        pages,
        description,
        category: 'fiction',
        file: '/upload/book.pdf',
        photo: '/upload/photo.jpg',
      });
      await Book.create({
        name,
        autherName,
        pages,
        description,
        category: 'romance',
        file: '/upload/book.pdf',
        photo: '/upload/photo.jpg',
      });
    });
    beforeEach(() => {
      categories = [];
    });
    const exec = () => {
      return request(server).get('/api/v1/books/').send({
        categories,
      });
    };
    it('should return status 200 and only get books of categories', async () => {
      categories = ['personal', 'fiction'];
      const res = await exec();

      expect(res.body.data).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: expect.stringMatching(/\b(?:personal|fiction)\b/),
          }),
        ])
      );
      expect(res.status).toBe(200);
    });
    it('should return status 200 and get all books', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
  describe('GET api/v1/uploads/bookfiles/', () => {
    let bookFileName, expires_at, subscription;
    beforeEach(() => {
      bookFileName = 'book1.pdf';
      expires_at = new Date(moment().add(5, 'days').format());
    });
    beforeEach(async () => {
      userData = new User({
        name: 'Bibek',
        email: 'Shrestha@gmail.com',
        password: '1234556',
        role: 'user',
      });
      userData = await userData.save();
      token = userData.generateAuthToken();
    });
    beforeEach(async () => {
      subscription = await Subscription.create({
        user_id: userData._id,
        expires_at,
        packages: {
          name: 'TESTing',
          description: 'helow',
          price: 12,
          validityDay: 5,
        },
      });
    });
    const exec = () => {
      return request(server)
        .get(`/api/v1/uploads/bookfiles/${bookFileName}`)
        .set('x-auth-token', token);
    };
    it('should return status 200 if client is not loged in', async () => {
      token = '';
      const res = await exec();
      expect(res.status).toBe(401);
    });
    it('should return status 403 if client is not admin or not subscrbed', async () => {
      await Subscription.deleteMany({});
      const res = await exec();
      expect(res.status).toBe(403);
    });
    it('should return status 403 if client subscription is expired', async () => {
      expires_at = new Date(moment().add(-5, 'days').format());
      subscription = await Subscription.findOneAndUpdate(
        {
          _id: subscription._id,
        },
        {
          expires_at: expires_at,
        },
        {
          new: true,
        }
      );
      const res = await exec();
      expect(res.status).toBe(403);
    });
    it('should return status 200 if client is subscribed', async () => {
      const res = await exec();
      expect(res.status).toBe(200);
    });
    it('should return 404 if file is not find', async () => {
      bookFileName = 'asdf';
      const res = await exec();
      expect(res.status).toBe(404);
    });

    it('should return status 200 if client is admin and not subscribed', async () => {
      userData = new User({
        name: 'Bibek',
        email: 'Shs@gmail.com',
        password: '1234556',
        role: 'admin',
      });
      userData = await userData.save();
      token = userData.generateAuthToken();
      const res = await exec();
      expect(res.status).toBe(200);
    });
  });
});
