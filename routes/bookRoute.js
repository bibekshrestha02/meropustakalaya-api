const express = require('express');
const Route = express.Router();
const {
  createBook,
  deleteBooks,
  updateBook,
  getBook,
  getBooks,
  showBooksRandom,
  deleteBook,
  getBookFile,
  getBooksAdmin,
} = require('../controllers/bookController');
const {
  checkAdmin,
  verifyToken,
  isToken_user,
  checkIsSubscribe,
} = require('../middlerware/authMiddleware');
Route.get('/', getBooks);
Route.get('/adminBooks/', verifyToken, checkAdmin, getBooksAdmin);
Route.post('/', verifyToken, checkAdmin, createBook);
Route.put('/:id', verifyToken, checkAdmin, updateBook);
Route.delete('/', verifyToken, checkAdmin, deleteBooks);
Route.delete('/:id', verifyToken, checkAdmin, deleteBook);
Route.get('/shows/', showBooksRandom);
Route.get('/:id', isToken_user, getBook);
Route.get('/file/:id', verifyToken, checkIsSubscribe, getBookFile);
module.exports = Route;
