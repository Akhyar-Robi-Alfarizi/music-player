const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
require('dotenv').config();

// 1. Konfigurasi Kredensial Cloudinary (diambil dari file .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Validasi konfigurasi Cloudinary
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('⚠️  PERINGATAN: Kredensial Cloudinary belum dikonfigurasi di file .env');
  console.error('   Silakan tambahkan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, dan CLOUDINARY_API_SECRET');
}

// 2. Setup Storage Dinamis (Bisa bedain Cover dan Audio)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folderName = 'mymusic/covers';
    let resourceType = 'image'; // Default untuk cover album

    // Kalau yang diupload adalah file audio/lagu
    if (file.fieldname === 'audio') {
      folderName = 'mymusic/audio';
      resourceType = 'auto'; // Biarkan Cloudinary otomatis mendeteksi file audio
    }

    return {
      folder: folderName,
      resource_type: resourceType,
    };
  },
});

// 3. File Filter (Diambil dari kode aslimu biar tetap aman)
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'audio') {
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('File audio tidak valid!'));
    }
  }

  if (file.fieldname === 'cover') {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('File cover tidak valid!'));
    }
  }

  cb(null, true);
};

// 4. Inisialisasi Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Batas ukuran 50MB (Sesuai kodemu)
  },
});

module.exports = { upload };