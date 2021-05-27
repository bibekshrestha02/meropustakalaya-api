const express = require('express');
const Router = express.Router();
const {
  postCategory,
  getCategory,
  deleteCategories,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { checkAdmin, verifyToken } = require('../middlerware/authMiddleware');
Router.get('/', getCategory);
Router.put('/', [verifyToken, checkAdmin], updateCategory);
Router.post('/', [verifyToken, checkAdmin], postCategory);
Router.delete('/', [verifyToken, checkAdmin], deleteCategories);
Router.delete('/:id', [verifyToken, checkAdmin], deleteCategory);

module.exports = Router;
