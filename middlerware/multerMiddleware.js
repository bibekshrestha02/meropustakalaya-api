const multer = require('multer');
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'bookFile') {
      cb(null, './uploads/bookFiles');
    } else if (file.fieldname === 'bookImage') {
      cb(null, './uploads/bookPhotos');
    } else {
      cb(new Error('invalid filed'));
    }
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + Date.now() + file.originalname);
  },
});
const fileFilter = function (req, file, cb) {
  const ext = path.extname(file.originalname);
  if (
    ext !== '.png' &&
    ext !== '.jpg' &&
    ext !== '.jepg' &&
    ext !== '.pdf' &&
    ext !== '.epub'
  ) {
    return cb(new Error('File and Photo must be of Jpg or Png or Pdf'));
  }

  cb(null, true);
};
const upload = multer({ storage, fileFilter }).fields([
  { name: 'bookFile' },
  { name: 'bookImage' },
]);
module.exports = function (req, res, next) {
  upload(req, res, function (error) {
    if (error) {
      return res.status(400).json({ type: 'file', message: error.message });
    }
    next();
  });
};
