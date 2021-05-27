const Joi = require('joi');
const mongoose = require('mongoose');

const categoryModel = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true,
  },
});
exports.Category = mongoose.model('categories', categoryModel);

exports.validCategory = (data) => {
  const Schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    title: Joi.string().min(2).max(50).required(),
  });
  return Schema.validate(data);
};
