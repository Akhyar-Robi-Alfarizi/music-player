const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { authRequired } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators');

const router = express.Router();

router.post(
  '/register',
  registerValidator,
  register,
);

router.post(
  '/login',
  loginValidator,
  login,
);

router.get('/me', authRequired, me);

module.exports = router;
