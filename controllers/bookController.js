const asyncFn = require('../middlerware/asyncMiddleware');
const { Book, bookValidation } = require('../models/bookModel');
const { Review } = require('../models/reviewModel');
const { Category } = require('../models/categoryModel');
const { deleteFiles } = require('../helpers/helperFn');
const mongoose = require('mongoose');
exports.createBook = asyncFn(async (req, res, next) => {
  const image = req.files.bookImage[0];
  const file = req.files.bookFile[0];
  const { error } = bookValidation(req.body);
  if (error) {
    await deleteFiles(image.path);
    await deleteFiles(file.path);
    return res.status(400).send(error.details[0].message);
  }
  let category = await Category.findById(req.body.categoryId);
  if (!category) {
    await deleteFiles(image.path);
    await deleteFiles(file.path);
    return res.status(400).send('invalid category id');
  }
  let book = new Book({
    name: req.body.name,
    autherName: req.body.autherName,
    pages: req.body.pages,
    description: req.body.description,
    category: category.name,
    photo: image.path,
    file: file.path,
  });
  try {
    await book.save();
  } catch (error) {
    await deleteFiles(image.path);
    await deleteFiles(file.path);
    return res.status(500).json({ message: 'something went wrong' });
  }
  res.status(201).json({
    status: 201,
    message: 'success',
  });
});
exports.deleteBooks = asyncFn(async (req, res, next) => {
  let { ids } = req.body;
  if (!ids) {
    return res.status(400).json({
      type: 'ids',
      message: 'Books Ids are required',
    });
  }
  let isValid = true;
  ids.map(async (id) => {
    if (!mongoose.isValidObjectId(id)) {
      return (isValid = false);
    }
  });
  if (!isValid) {
    return res.status(400).send('Invalid id');
  }
  let books = await Book.find({ _id: { $in: ids } });

  if (books.length < 1) {
    return res.status(400).send('Invalid id');
  }
  await books.map(async (book) => {
    await deleteFiles(book.file);
    await deleteFiles(book.photo);
  });
  await Book.deleteMany({ _id: { $in: ids } });
  await Review.deleteMany({ book: { $in: ids } });
  res.status(200).send('success');
});
exports.deleteBook = asyncFn(async (req, res) => {
  let { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      type: 'id',
      message: 'Books Id is required',
    });
  }
  let book = await Book.findById(id);
  if (!book) {
    return res.status(400).json({
      type: 'book',
      message: 'Book Not found',
    });
  }
  await deleteFiles(book.file);
  await deleteFiles(book.photo);
  await Book.findByIdAndDelete(id);
  await Review.deleteMany({ book: id });
  res.status(200).send('success');
});
exports.updateBooks = asyncFn(async (req, res) => {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    res.status(400).send('invalid id');
    return;
  }
  const book = await Book.findById(id);
  if (!book) {
    res.status(400).send('invalid id');
    return;
  }
  const image = req.files.bookImage[0];
  const file = req.files.bookFile[0];
  const { error } = bookValidation(req.body);
  if (error) {
    await deleteFiles(image.path);
    await deleteFiles(file.path);
    return res.status(400).send(error.details[0].message);
  }
  let category = await Category.findById(req.body.categoryId);
  if (!category) {
    await deleteFiles(image.path);
    await deleteFiles(file.path);
    return res.status(400).send('invalid category id');
  }
  await deleteFiles(book.photo);
  await deleteFiles(book.file);

  await Book.findByIdAndUpdate(id, {
    name: req.body.name,
    autherName: req.body.autherName,
    pages: req.body.pages,
    description: req.body.description,
    category: category.name,
    photo: image.path,
    file: file.path,
  });

  res.status(200).json({
    status: 200,
    message: 'success',
  });
});

exports.getBook = asyncFn(async (req, res) => {
  const { id } = req.params;
  let user;
  if (req.user) {
    user = req.user._id;
  }

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).send('Invalid id');
  }
  let book = await Book.findById(id).lean();
  if (!book) {
    return res.status(400).send('Invalid id');
  }

  let review = await Review.aggregate([
    {
      $match: {
        book: book._id,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $project: {
        user: { password: 0, _v: 0 },
      },
    },
  ]);
  if (user) {
    let userReview = await Review.findOne({
      user: user,
      book: book._id,
    }).populate('user', '-password');
    book['userReview'] = userReview;
  }
  book['reviews'] = review;
  res.status(200).json({
    status: 200,
    data: book,
  });
});
exports.getBooks = asyncFn(async (req, res) => {
  let { category } = req.query;
  let { sort } = req.query;
  if (category) {
    category = category.split(',');
  } else {
    category = [];
  }

  let books;
  if (category.length < 1) {
    books = await Book.find().sort(sort);
  } else {
    books = await Book.find({ category: { $in: category } }).sort(sort);
  }

  res.status(200).json({
    status: 200,
    data: books,
  });
});
exports.showBooksRandom = asyncFn(async (req, res) => {
  let books = await Book.aggregate([
    {
      $sample: { size: 4 },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: books,
  });
});
