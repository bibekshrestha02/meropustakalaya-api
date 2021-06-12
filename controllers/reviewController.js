const { reviewValidation, Review } = require('../models/reviewModel');
const asyncMiddleware = require('../middlerware/asyncMiddleware');
const mongoose = require('mongoose');
const { Book } = require('../models/bookModel');
exports.postReview = asyncMiddleware(async (req, res, next) => {
  let book, review;
  const { error } = reviewValidation(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  book = await Book.findById(req.body.book);
  if (!book) {
    return res.status(400).json({ message: 'Invalid book id' });
  }
  review = await Review.findOne({ book: book._id, user: req.user._id });
  if (review) {
    return res
      .status(400)
      .json({ message: 'cannot post more than one review' });
  }
  review = await Review.create({
    user: req.user._id,
    book: req.body.book,
    review: req.body.review,
    rating: req.body.rating,
  });

  review = await review
    .populate('user', ['name', 'role', 'email'])
    .execPopulate();

  res.status(201).json({
    status: 201,
    data: review,
  });
});
exports.updateReview = asyncMiddleware(async (req, res, next) => {
  let book;
  const reviewId = req.params.id;
  if (!mongoose.isValidObjectId(reviewId)) {
    return res.status(400).send('Invalid id');
  }
  const { error } = reviewValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  let review = await Review.findById(reviewId);
  if (!review) {
    return res.status(400).send('invalid review id');
  }

  if (review.user.toString() !== req.user._id.toString()) {
    return res.status(403).send('forbidon to update others review');
  }

  book = await Book.findById(req.body.book);
  if (!book) {
    return res.status(400).send('Book not exists in db');
  }
  review = await Review.findByIdAndUpdate(
    { _id: reviewId },
    {
      review: req.body.review,
      rating: req.body.rating,
      updateAt: Date.now(),
    },
    { upsert: true }
  ).populate('user', ['name', 'email', 'role']);
  res.status(200).json({
    status: 200,
    data: review,
  });
});
exports.deleteReview = asyncMiddleware(async (req, res) => {
  const reviewId = req.params.id;
  if (!mongoose.isValidObjectId(reviewId)) {
    return res.status(400).send('invalid id');
  }
  let review = await Review.findById(reviewId);
  if (!review) {
    return res.status(400).send('invalid id');
  }
  if (req.user.role !== 'admin') {
    if (req.user._id.toString() !== review.user.toString()) {
      return res.status(403).send('forbiden to delete review');
    }
  }
  await Review.findByIdAndDelete(reviewId);
  return res.status(200).send('success');
});
exports.deleteMultipleReviews = asyncMiddleware(async (req, res) => {
  const { ids } = req.body;
  let isErr = false;
  if (ids.length < 1) {
    return res.status(400).send('not ids send');
  }
  ids.map((id) => {
    if (!mongoose.isValidObjectId(id)) {
      isErr = true;
      return;
    }
  });
  if (isErr) {
    return res.status(400).send('invalid object id');
  }
  let review = await Review.find({ _id: { $in: ids } });

  if (review.length < 1) {
    return res.status(400).send('invalid object id');
  }
  await Review.deleteMany({ _id: { $in: ids } });

  let calAvg = await Review.aggregate([
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 },
      },
    },
  ]);
  if (calAvg.length < 1) {
    review = await Book.updateMany(
      {},
      {
        rating: 4.5,
        numberOfRating: 0,
      }
    );
  } else {
    await calAvg.map(async (d) => {
      await Book.findByIdAndUpdate(
        d._id,
        {
          rating: d.avgRating,
          numberOfRating: d.nRating,
        },
        {
          new: true,
        }
      );
    });
  }

  res.status(200).send('success');
});
exports.getAllReview = asyncMiddleware(async (req, res, next) => {
  let reviews = await Review.aggregate([
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
      $project: { user: { password: 0, _v: 0 } },
    },
    {
      $group: {
        _id: '$book',
        rating: { $avg: '$rating' },
        numberOfRating: { $sum: 1 },
        reviews: {
          $push: {
            _id: '$_id',
            user: '$user',
            book: '$book',
            review: '$review',
            rating: '$rating',
            createAt: '$createAt',
            updateAt: '$updateAt',
          },
        },
      },
    },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetail',
      },
    },
    {
      $unwind: '$bookDetail',
    },
  ]);
  res.status(200).json({
    status: 200,
    data: reviews,
  });
});
