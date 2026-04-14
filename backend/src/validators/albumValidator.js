const { body } = require('express-validator');

const createAlbumValidator = [
  body('name').trim().isLength({ min: 1 }),
  body('artistName')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1 }),
  body('artistKey')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1 }),
  body().custom((_, { req }) => {
    const artistInput = `${req.body.artistName || req.body.artistKey || ''}`.trim();
    if (!artistInput) {
      throw new Error('artistName wajib diisi');
    }
    return true;
  }),
  body('description').optional({ checkFalsy: true }).isString(),
];

module.exports = {
  createAlbumValidator,
};
