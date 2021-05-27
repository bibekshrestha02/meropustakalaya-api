const express = require('express');
const Route = express.Router();
const {
  postPackage,
  getEnablePackage,
  getAllPackage,
  updatePackage,
  toogleEnablePackage,
  deletePackage,
} = require('../controllers/packageController');
const { verifyToken, checkAdmin } = require('../middlerware/authMiddleware');
Route.post('/', verifyToken, checkAdmin, postPackage);
Route.delete('/:id', verifyToken, checkAdmin, deletePackage);
Route.get('/', getEnablePackage);
Route.put('/:id', verifyToken, checkAdmin, updatePackage);
Route.put('/toogle/:id', verifyToken, checkAdmin, toogleEnablePackage);
Route.get('/all', verifyToken, checkAdmin, getAllPackage);

module.exports = Route;
