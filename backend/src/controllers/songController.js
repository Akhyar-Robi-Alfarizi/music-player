const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created, fail } = require('../utils/response');
const { songService, artistService } = require('../services');

const getSongs = asyncHandler(async (req, res) => {
  const { search = '', artist = '', mine = '0' } = req.query;
  const rows = await songService.listSongs({
    search,
    artist,
    mine,
    userId: req.user?.id || null,
  });

  return ok(res, { songs: rows });
});

const createSong = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 400, 'Validasi gagal', errors.array());
  }

  const { title, albumId } = req.body;
  const artistInput = `${req.body.artistName || req.body.artistKey || ''}`.trim();

  const artist = await artistService.findOrCreateArtistByName(artistInput);

  if (!req.files?.audio?.[0]) {
    throw new AppError(400, 'File audio wajib diupload');
  }

  const audioFile = req.files.audio[0];
  const coverFile = req.files.cover?.[0];

  const fileUrl = `/uploads/audio/${audioFile.filename}`;
  const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;

  const song = await songService.createSong({
    userId: req.user.id,
    artistKey: artist.artist_key,
    albumId,
    title,
    fileUrl,
    coverUrl,
  });

  return created(res, { song }, 'Lagu berhasil ditambahkan');
});

module.exports = {
  getSongs,
  createSong,
};
