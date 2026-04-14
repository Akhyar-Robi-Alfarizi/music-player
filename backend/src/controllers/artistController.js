const asyncHandler = require('../utils/asyncHandler');
const { ok } = require('../utils/response');
const { artistService } = require('../services');

const getArtists = asyncHandler(async (req, res) => {
  const rows = await artistService.listArtists();
  return ok(res, { artists: rows });
});

module.exports = { getArtists };
