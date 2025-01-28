const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: '../uploads',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  if (extname) return cb(null, true);
  cb(new Error('Only images are allowed (jpeg, jpg, png)'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
