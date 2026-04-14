const { body } = require('express-validator');

const registerValidator = [
  body('name').trim().isLength({ min: 2 }),
  body('username').trim().isLength({ min: 3 }),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
];

const loginValidator = [
  body('identifier').notEmpty(),
  body('password').notEmpty(),
];

module.exports = {
  registerValidator,
  loginValidator,
};
