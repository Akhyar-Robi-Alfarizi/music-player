const { registerValidator, loginValidator } = require('./authValidator');
const { createAlbumValidator } = require('./albumValidator');
const { createSongValidator } = require('./songValidator');

module.exports = {
  registerValidator,
  loginValidator,
  createAlbumValidator,
  createSongValidator,
};
