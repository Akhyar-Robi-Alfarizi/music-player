const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'audio') {
      cb(null, path.resolve(__dirname, '../../uploads/audio'));
      return;
    }
    cb(null, path.resolve(__dirname, '../../uploads/covers'));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    cb(null, `${Date.now()}-${baseName}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (file.fieldname === 'audio') {
    if (!file.mimetype.startsWith('audio/')) {
      cb(new Error('File audio tidak valid'));
      return;
    }
  }

  if (file.fieldname === 'cover') {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('File cover tidak valid'));
      return;
    }
  }

  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

module.exports = { upload };
