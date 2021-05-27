const dotenv = require('dotenv');
const express = require('express');
const app = express();
const cors = require('cors');
dotenv.config();
app.use(cors());
app.use(express.json());

require('./startup/routes')(app);

require('./startup/db')();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}....`);
});

module.exports = server;
