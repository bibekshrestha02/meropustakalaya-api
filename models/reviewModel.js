const Joi = require('joi');
const mongoose = require('mongoose');
const { Book } = require('./bookModel');
const reviewSchma = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'books',
    required: true,
  },
  review: {
    type: String,
    required: true,
    max: 5000,
    min: 2,
  },
  rating: {
    type: Number,
    required: true,
    max: 5,
    min: 1,
  },
  createAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
  updateAt: {
    type: Date,
  },
});
reviewSchma.statics.calAvg = async function (bookId) {
  const stats = await this.aggregate([
    {
      $match: { book: bookId },
    },
    {
      $group: {
        _id: '$book',
        avgRating: { $avg: '$rating' },
        numberOfRating: { $sum: 1 },
      },
    },
  ]);
  if (stats.length < 1) {
    await Book.findByIdAndUpdate(
      { _id: bookId },
      {
        rating: 4.5,
        numberOfRating: 0,
      },
      {
        new: true,
      }
    );
  } else {
    await Book.findByIdAndUpdate(
      { _id: bookId },
      {
        rating: stats[0].avgRating,
        numberOfRating: stats[0].numberOfRating,
      },
      {
        new: true,
      }
    );
  }
};
reviewSchma.post('save', function (doc) {
  this.constructor.calAvg(doc.book);
});
reviewSchma.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();
  next();
});
reviewSchma.post(/^findOneAnd/, async function () {
  await this.r.constructor.calAvg(this.r.book);
});

const reviewValidation = (review) => {
  const validation = Joi.object({
    rating: Joi.number().min(1).max(5).required(),
    book: Joi.string()
      .custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
          return helpers.message('invalid id');
        } else {
          return value;
        }
      })
      .required(),
    review: Joi.string().max(5000).required(),
  });
  return validation.validate(review);
};
exports.reviewValidation = reviewValidation;
exports.Review = mongoose.model('reviews', reviewSchma);
