const express = require('express');
const Router = express.Router();
const {
  postSubscribe,
  getAllSubscribeDetails,
  getSubscribtionDetail,
} = require('../controllers/membershipController');
const { verifyToken, checkAdmin } = require('../middlerware/authMiddleware');
Router.post('/', verifyToken, postSubscribe);
Router.get('/:id', [verifyToken, checkAdmin], getSubscribtionDetail);
Router.get('/', [verifyToken, checkAdmin], getAllSubscribeDetails);
module.exports = Router;
