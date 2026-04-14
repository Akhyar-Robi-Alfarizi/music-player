const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { ok, fail } = require('./utils/response');

const authRoutes = require('./routes/authRoutes');
const artistRoutes = require('./routes/artistRoutes');
const albumRoutes = require('./routes/albumRoutes');
const songRoutes = require('./routes/songRoutes');

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*', credentials: false }));

app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.get('/api/health', (_, res) => {
  return ok(res, { status: 'ok', app: 'mymusic-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);

app.use((req, res) => {
  return fail(res, 404, 'Endpoint tidak ditemukan');
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const payload = {
    message: err.message || 'Terjadi kesalahan pada server',
  };

  if (err.detail) {
    payload.detail = err.detail;
  }

  if (statusCode === 500 && err.message) {
    payload.detail = err.message;
  }

  return fail(res, statusCode, payload.message, payload.detail);
});

app.listen(port, () => {
  console.log(`MyMusic API running at http://localhost:${port}`);
});
