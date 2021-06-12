const Joi = require('joi');
const mongose = require('mongoose');

const bookSchema = new mongose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 80,
    required: true,
  },
  autherName: {
    type: String,
    minlength: 2,
    maxlength: 80,
    required: true,
  },
  pages: {
    type: Number,
  },
  description: {
    type: String,
    minlength: 2,
    maxlength: 1000,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  photo: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
  },
  numberOfRating: {
    type: Number,
    default: 0,
  },
  releasedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});
exports.bookValidation = (data) => {
  const validation = Joi.object({
    name: Joi.string().min(5).max(80).required(),
    autherName: Joi.string().min(2).max(80).required(),
    pages: Joi.number().min(2).max(5000),
    description: Joi.string().min(10).max(2000).required(),
    categoryId: Joi.string()
      .custom((value, helper) => {
        if (!mongose.isValidObjectId(value)) {
          return helper.error('invalid categoryId');
        } else {
          return value;
        }
      })
      .required(),
    photo: Joi.string().required(),
    file: Joi.string().required(),
  });
  return validation.validate(data);
};
exports.Book = mongose.model('books', bookSchema);
