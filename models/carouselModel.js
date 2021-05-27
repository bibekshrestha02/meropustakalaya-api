const Joi = require('joi');
const mongoose = require('mongoose');
const carouselSchema = new mongoose.Schema({
  name: {
    type: String,
    min: 4,
    max: 100,
    default: 'MeroPustakalaya',
    required: true,
  },
  subDetail: {
    type: String,
    min: 4,
    max: 100,
    default: 'What is Meropustakalaya?',
    required: true,
  },
  detail: {
    type: String,
    min: 4,
    max: 500,
    default: 'Meropustakalaya is an online platform to read books.',
    required: true,
  },
  price: {
    type: String,
    required: true,
    default: 150,
  },
  priceLabel: {
    type: String,
    required: true,
    default: 'Monthly',
  },
});
exports.Carousal = mongoose.model('carousel', carouselSchema);
exports.carouselValidation = (val) => {
  const schema = Joi.object({
    name: Joi.string().min(4).max(100).required(),
    subDetail: Joi.string().min(4).max(500).required(),
    detail: Joi.string().min(4).max(500).required(),
    priceLabel: Joi.string().min(4).max(100).required(),
    price: Joi.string().min(0).max(10000).required(),
  });
  return schema.validate(val);
};
