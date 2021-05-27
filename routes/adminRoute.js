const express = require('express');
const Router = express.Router();
const { verifyToken, checkAdmin } = require('../middlerware/authMiddleware');
const { Dashboard } = require('../controllers/adminController');
Router.get('/dashboard', Dashboard);
module.exports = Router;
