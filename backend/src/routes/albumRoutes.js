const express = require('express');
const { getAlbums, getAlbumById, createAlbum } = require('../controllers/albumController');
const { authRequired } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { createAlbumValidator } = require('../validators');

const router = express.Router();

router.get('/', getAlbums);
router.get('/:id', getAlbumById);

router.post(
  '/',
  authRequired,
  upload.single('cover'),
  createAlbumValidator,
  createAlbum,
);

module.exports = router;
