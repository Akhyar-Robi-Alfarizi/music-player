#!/usr/bin/env node

/**
 * Script untuk memeriksa konfigurasi Cloudinary
 * Jalankan: node check-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

console.log('🔍 Memeriksa Konfigurasi Cloudinary...\n');

// Cek environment variables
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

let hasError = false;

if (!cloudName) {
  console.error('❌ CLOUDINARY_CLOUD_NAME tidak ditemukan di .env');
  hasError = true;
} else {
  console.log('✅ CLOUDINARY_CLOUD_NAME:', cloudName);
}

if (!apiKey) {
  console.error('❌ CLOUDINARY_API_KEY tidak ditemukan di .env');
  hasError = true;
} else {
  console.log('✅ CLOUDINARY_API_KEY:', apiKey.substring(0, 6) + '...');
}

if (!apiSecret) {
  console.error('❌ CLOUDINARY_API_SECRET tidak ditemukan di .env');
  hasError = true;
} else {
  console.log('✅ CLOUDINARY_API_SECRET:', '***' + apiSecret.substring(apiSecret.length - 4));
}

if (hasError) {
  console.error('\n⚠️  Silakan tambahkan kredensial Cloudinary di file .env');
  console.error('   Lihat file .env.example untuk contoh\n');
  process.exit(1);
}

// Test koneksi ke Cloudinary
console.log('\n🔌 Testing koneksi ke Cloudinary...');

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret
});

cloudinary.api.ping()
  .then(() => {
    console.log('✅ Koneksi ke Cloudinary berhasil!\n');
    console.log('📊 Info Akun:');
    return cloudinary.api.usage();
  })
  .then((usage) => {
    console.log(`   Storage: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB / ${(usage.storage.limit / 1024 / 1024).toFixed(0)} MB`);
    console.log(`   Bandwidth: ${(usage.bandwidth.usage / 1024 / 1024).toFixed(2)} MB / ${(usage.bandwidth.limit / 1024 / 1024).toFixed(0)} MB`);
    console.log(`   Resources: ${usage.resources} files\n`);
    console.log('🎉 Cloudinary siap digunakan!');
  })
  .catch((error) => {
    console.error('❌ Gagal terhubung ke Cloudinary');
    console.error('   Error:', error.message);
    console.error('\n💡 Kemungkinan penyebab:');
    console.error('   - Kredensial salah (cek Cloud Name, API Key, API Secret)');
    console.error('   - Tidak ada koneksi internet');
    console.error('   - Akun Cloudinary belum aktif\n');
    process.exit(1);
  });
