const { request } = require('express');
const express = require('express');
const Router = express.Router();
const {
  postReview,
  updateReview,
  deleteReview,
  deleteMultipleReviews,
  getAllReview,
} = require('../controllers/reviewController');
const { verifyToken, checkAdmin } = require('../middlerware/authMiddleware');
Router.get('/', verifyToken, checkAdmin, getAllReview);
Router.post('/', verifyToken, postReview);
Router.put('/:id', verifyToken, updateReview);
Router.delete('/:id', verifyToken, deleteReview);
Router.delete('/', verifyToken, checkAdmin, deleteMultipleReviews);

module.exports = Router;
