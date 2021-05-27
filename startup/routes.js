const express = require('express');
const errorMiddleware = require('../middlerware/errorMiddleware');
const authRoute = require('../routes/authRoute');
const userRoute = require('../routes/userRoute');
const packageRoute = require('../routes/packageRoute');
const categoryRoute = require('../routes/categoryRoute');
const membershipRoute = require('../routes/membershipRoute');
const bookRoute = require('../routes/bookRoute');
const reviewRoute = require('../routes/reviewRoute');
const carousels = require('../routes/carouselRoute');
const adminRoute = require('../routes/adminRoute');
const path = require('path');
const {
  verifyToken,
  checkIsSubscribe,
  checkAdmin,
} = require('../middlerware/authMiddleware');
module.exports = function (app) {
  app.use(
    '/api/v1/uploads/bookfiles/',
    verifyToken,
    checkIsSubscribe,
    express.static('uploads/bookFiles')
  );
  app.use('/uploads/bookPhotos', express.static('uploads/bookPhotos'));

  app.use('/api/v1/admins/', verifyToken, checkAdmin, adminRoute);
  app.use('/api/v1/auths/', authRoute);
  app.use('/api/v1/users/', userRoute);
  app.use('/api/v1/packages/', packageRoute);
  app.use('/api/v1/categories/', categoryRoute);
  app.use('/api/v1/subscriptions/', membershipRoute);
  app.use('/api/v1/books/', bookRoute);
  app.use('/api/v1/reviews/', reviewRoute);
  app.use('/api/v1/carousels/', carousels);

  app.use(errorMiddleware);
};
