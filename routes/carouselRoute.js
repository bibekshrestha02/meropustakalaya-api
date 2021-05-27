const express = require('express');
const { verifyToken, checkAdmin } = require('../middlerware/authMiddleware');
const {
  updateCarousel,
  getCarousel,
} = require('../controllers/carouselController');
const Router = express.Router();
Router.put('/', verifyToken, checkAdmin, updateCarousel);
Router.get('/', getCarousel);
module.exports = Router;
