const express = require('express');
const Route = express.Router();
const {
  getAllUsers,
  createUser,
  updateName,
  deleteUser,
  getUser,
  getLoginUser,
  saveBook,
  getSaveBook,
} = require('../controllers/userController');
const { checkAdmin, verifyToken } = require('../middlerware/authMiddleware');
Route.get('/', verifyToken, checkAdmin, getAllUsers);
Route.get('/me', verifyToken, getLoginUser);
Route.post('/create', verifyToken, checkAdmin, createUser);
Route.put('/', verifyToken, updateName);
Route.delete('/:id', verifyToken, checkAdmin, deleteUser);
Route.get('/saves/', verifyToken, getSaveBook);
Route.get('/:id', verifyToken, checkAdmin, getUser);
Route.post('/saves/:book', verifyToken, saveBook);
module.exports = Route;
