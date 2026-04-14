const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created, fail } = require('../utils/response');
const { albumService, artistService } = require('../services');

const getAlbums = asyncHandler(async (req, res) => {
  const rows = await albumService.listAlbums();

  return ok(res, { albums: rows });
});

const getAlbumById = asyncHandler(async (req, res) => {
  const album = await albumService.getAlbumById(req.params.id);

  if (!album) {
    throw new AppError(404, 'Album tidak ditemukan');
  }

  const songs = await albumService.listAlbumSongs(req.params.id);

  return ok(res, { album, songs });
});

const createAlbum = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 400, 'Validasi gagal', errors.array());
  }

  const { name, description } = req.body;
  const artistInput = `${req.body.artistName || req.body.artistKey || ''}`.trim();

  const artist = await artistService.findOrCreateArtistByName(artistInput);

  // Gunakan URL dari Cloudinary, bukan path lokal
  const coverUrl = req.file ? req.file.path : null;

  const album = await albumService.createAlbum({
    userId: req.user.id,
    artistKey: artist.artist_key,
    name,
    description,
    coverUrl,
  });

  return created(res, { album }, 'Album berhasil dibuat');
});

module.exports = {
  getAlbums,
  getAlbumById,
  createAlbum,
};
