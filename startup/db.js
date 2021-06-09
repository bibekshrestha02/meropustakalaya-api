const mongoose = require('mongoose');
const Fawn = require('fawn');
module.exports = () => {
  let db;
  let node_env = process.env.NODE_ENV;

  if (node_env === 'test') {
    db = process.env.DB_TEST;
  } else if (node_env === 'development') {
    db = process.env.DB_DEVELOPMENT;
  } else {
    db = process.env.DB_PRODUCTION;
  }
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
