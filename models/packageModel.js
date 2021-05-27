const Joi = require('joi');
const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50,
  },
  description: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    maxlength: 100000,
  },
  validityDay: {
    type: Number,
    required: true,
  },
  isEnable: {
    type: Boolean,
    default: true,
  },
});
exports.packageSchema = packageSchema;
exports.Package = mongoose.model('packages', packageSchema);

exports.ValidatePackage = (packageData) => {
  const Schema = Joi.object({
    name: Joi.string().min(4).max(50).required(),
    price: Joi.number().min(2).max(100000).required(),
    validityDay: Joi.number().min(1).required(),
    description: Joi.string().min(5).max(1000),
    isEnable: Joi.boolean(),
  });
  return Schema.validate(packageData);
};
