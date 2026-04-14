const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { ok, created, fail } = require('../utils/response');
const { authService } = require('../services');

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' },
  );
}

const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 400, 'Validasi gagal', errors.array());
  }

  const { name, username, email, password } = req.body;

  const exists = await authService.existsByUsernameOrEmail({ username, email });
  if (exists) {
    throw new AppError(409, 'Username atau email sudah terdaftar');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await authService.createUser({ name, username, email, passwordHash });
  const token = signToken(user);

  return created(res, { token, user });
});

const login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return fail(res, 400, 'Validasi gagal', errors.array());
  }

  const { identifier, password } = req.body;

  const user = await authService.getUserByIdentifier(identifier);
  if (!user) {
    throw new AppError(401, 'Login gagal');
  }

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    throw new AppError(401, 'Login gagal');
  }

  const token = signToken(user);
  return ok(res, {
    token,
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  if (!user) {
    throw new AppError(404, 'User tidak ditemukan');
  }
  return ok(res, { user });
});

module.exports = {
  register,
  login,
  me,
};
