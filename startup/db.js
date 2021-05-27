const mongoose = require('mongoose');
const Fawn = require('fawn');
module.exports = () => {
  let db;
  process.env.NODE_ENV === 'development'
    ? (db = process.env.DB_PRODUCTION)
    : (db = process.env.DB_TEST);
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    })
    .then(() => {
      console.log(`connected to ${db}...`);
    })
    .catch((err) => {
      console.log('Error:', err);
    });
  Fawn.init(mongoose);
};
