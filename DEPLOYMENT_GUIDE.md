# Panduan Deployment MyMusic

## Masalah Upload File di Production

Jika Anda mengalami error "Terjadi kesalahan pada server" saat upload file, kemungkinan besar kredensial Cloudinary belum dikonfigurasi.

## Setup Cloudinary (WAJIB untuk Upload File)

### 1. Buat Akun Cloudinary
1. Kunjungi [cloudinary.com](https://cloudinary.com)
2. Daftar akun gratis (Free tier sudah cukup untuk development)
3. Setelah login, buka Dashboard

### 2. Dapatkan Kredensial
Di Dashboard Cloudinary, Anda akan melihat:
- **Cloud Name**: nama cloud Anda
- **API Key**: kunci API
- **API Secret**: kunci rahasia (klik "Show" untuk melihat)

### 3. Konfigurasi di Production

#### Untuk Vercel:
1. Buka project di Vercel Dashboard
2. Pergi ke **Settings** → **Environment Variables**
3. Tambahkan 3 variabel berikut:
   ```
   CLOUDINARY_CLOUD_NAME = your_cloud_name
   CLOUDINARY_API_KEY = your_api_key
   CLOUDINARY_API_SECRET = your_api_secret
   ```
4. Klik **Save**
5. **Redeploy** aplikasi Anda

#### Untuk Platform Lain:
Tambahkan environment variables yang sama di platform hosting Anda (Heroku, Railway, dll)

### 4. Konfigurasi Lokal (Development)

Edit file `backend/.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Troubleshooting

### Error: "Terjadi kesalahan pada server"
**Penyebab**: Kredensial Cloudinary belum dikonfigurasi atau salah

**Solusi**:
1. Pastikan semua 3 environment variables sudah diset
2. Pastikan tidak ada spasi atau karakter aneh
3. Redeploy aplikasi setelah menambahkan variables
4. Cek logs di platform hosting untuk error detail

### Gambar Cover Tidak Tampil (Icon Placeholder Muncul)
**Penyebab**: 
- Data lama masih menggunakan path lokal (`/uploads/...`)
- File tidak ada di Cloudinary

**Solusi**:
1. **Untuk data baru**: Pastikan kredensial Cloudinary sudah benar, lalu upload ulang
2. **Untuk data lama**: Lihat file `backend/MIGRATION_GUIDE.md` untuk cara migrasi
3. **Quick fix**: Hapus dan upload ulang album/lagu yang bermasalah

### Error: "File audio tidak valid"
**Penyebab**: Format file tidak didukung

**Solusi**: Gunakan format audio yang umum (MP3, WAV, M4A, dll)

### Error: "File terlalu besar"
**Penyebab**: File melebihi batas 50MB

**Solusi**: 
- Kompres file audio Anda
- Atau ubah limit di `backend/src/middleware/upload.js` (baris `fileSize`)

## Verifikasi Setup

Setelah konfigurasi, coba:
1. Login ke aplikasi
2. Pergi ke halaman "Upload Musik"
3. Upload file audio dan cover
4. Jika berhasil, file akan tersimpan di Cloudinary dan muncul di library Anda

## Catatan Penting

- **Jangan commit file `.env`** ke Git (sudah ada di `.gitignore`)
- Cloudinary Free tier memberikan:
  - 25 GB storage
  - 25 GB bandwidth/bulan
  - Cukup untuk aplikasi kecil-menengah
- File yang diupload akan memiliki URL Cloudinary (bukan path lokal)
