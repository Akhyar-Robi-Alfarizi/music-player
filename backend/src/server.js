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

// 1. Middleware dasar
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Konfigurasi CORS Sederhana (Biar Vercel nggak bingung)
// Ganti konfigurasi CORS sebelumnya dengan ini:
app.use(cors({
  origin: true, // MANTRA SAPU JAGAT: Otomatis mengizinkan Frontend URL apapun
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static files
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// 3. Routes
app.get('/api/health', (_, res) => {
  return ok(res, { status: 'ok', app: 'mymusic-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/songs', songRoutes);

// 4. Handle 404
app.use((req, res) => {
  return fail(res, 404, 'Endpoint tidak ditemukan');
});

// 5. Error Handler Global
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const statusCode = err.statusCode || 500;
  return fail(res, statusCode, err.message || 'Terjadi kesalahan pada server', err.detail);
});

// 6. Jalankan server (Hanya untuk local development)
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`MyMusic API running at http://localhost:${port}`);
  });
}

// 7. WAJIB UNTUK VERCEL: Export aplikasi
module.exports = app;