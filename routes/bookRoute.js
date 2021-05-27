const express = require('express');
const Route = express.Router();
const {
  createBook,
  deleteBooks,
  updateBooks,
  getBook,
  getBooks,
  showBooksRandom,
  deleteBook,
} = require('../controllers/bookController');
const upload = require('../middlerware/multerMiddleware');
const {
  checkAdmin,
  verifyToken,
  isToken_user,
} = require('../middlerware/authMiddleware');
Route.get('/', getBooks);
Route.post('/', verifyToken, checkAdmin, upload, createBook);
Route.put('/:id', verifyToken, checkAdmin, upload, updateBooks);
Route.delete('/', verifyToken, checkAdmin, deleteBooks);
Route.delete('/:id', verifyToken, checkAdmin, deleteBook);
Route.get('/shows/', showBooksRandom);
Route.get('/:id', isToken_user, getBook);
module.exports = Route;
