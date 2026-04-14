const express = require('express');
const { getSongs, createSong } = require('../controllers/songController');
const { authRequired } = require('../middleware/auth');
const { optionalAuth } = require('../middleware/optionalAuth');
const { upload } = require('../middleware/upload');
const { createSongValidator } = require('../validators');

const router = express.Router();

router.get('/', optionalAuth, getSongs);

router.post(
  '/',
  authRequired,
  upload.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
  ]),
  createSongValidator,
  createSong,
);

module.exports = router;
