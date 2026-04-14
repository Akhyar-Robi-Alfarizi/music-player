# Panduan Migrasi Data ke Cloudinary

## Masalah
Jika Anda sudah memiliki data lama dengan path lokal (`/uploads/...`), gambar tidak akan tampil setelah migrasi ke Cloudinary karena file tidak ada di server production.

## Solusi

### Opsi 1: Upload Ulang (Paling Mudah)
Untuk data yang tidak terlalu banyak, cara termudah adalah:
1. Hapus album/lagu lama yang gambarnya tidak tampil
2. Upload ulang dengan sistem baru (akan otomatis ke Cloudinary)

### Opsi 2: Migrasi Manual File ke Cloudinary
Jika Anda memiliki banyak data dan ingin mempertahankannya:

#### Langkah 1: Install Cloudinary CLI
```bash
npm install -g cloudinary-cli
```

#### Langkah 2: Login ke Cloudinary
```bash
cloudinary config
# Masukkan Cloud Name, API Key, dan API Secret
```

#### Langkah 3: Upload File Lokal ke Cloudinary
```bash
# Upload semua cover
cloudinary upload_dir backend/uploads/covers -f mymusic/covers

# Upload semua audio
cloudinary upload_dir backend/uploads/audio -f mymusic/audio
```

#### Langkah 4: Update Database
Setelah upload, Anda perlu update database untuk mengganti path lokal dengan URL Cloudinary.

**Contoh Query SQL:**
```sql
-- Backup dulu!
CREATE TABLE songs_backup AS SELECT * FROM songs;
CREATE TABLE albums_backup AS SELECT * FROM albums;

-- Update songs cover_url
UPDATE songs 
SET cover_url = CONCAT(
  'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/',
  'mymusic/covers/',
  SUBSTRING_INDEX(cover_url, '/', -1)
)
WHERE cover_url LIKE '/uploads/covers/%';

-- Update songs file_url
UPDATE songs 
SET file_url = CONCAT(
  'https://res.cloudinary.com/YOUR_CLOUD_NAME/raw/upload/v1/',
  'mymusic/audio/',
  SUBSTRING_INDEX(file_url, '/', -1)
)
WHERE file_url LIKE '/uploads/audio/%';

-- Update albums cover_url
UPDATE albums 
SET cover_url = CONCAT(
  'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/',
  'mymusic/covers/',
  SUBSTRING_INDEX(cover_url, '/', -1)
)
WHERE cover_url LIKE '/uploads/covers/%';
```

**PENTING**: Ganti `YOUR_CLOUD_NAME` dengan Cloud Name Anda!

### Opsi 3: Biarkan Data Lama (Hybrid)
Sistem sudah mendukung hybrid mode:
- Data lama dengan path lokal (`/uploads/...`) akan tetap dicoba akses dari server
- Data baru akan otomatis ke Cloudinary (URL lengkap)

Namun ini hanya berfungsi jika:
- Server production Anda masih memiliki folder `uploads/` dengan file-file lama
- Atau Anda deploy folder `uploads/` ke production

## Rekomendasi

Untuk production yang bersih:
1. **Gunakan Opsi 1** jika data masih sedikit
2. **Gunakan Opsi 2** jika data sudah banyak dan penting
3. **Hindari Opsi 3** karena tidak scalable dan ribet maintenance

## Verifikasi Setelah Migrasi

1. Buka halaman Albums
2. Pastikan semua cover album tampil
3. Buka halaman Library
4. Pastikan semua cover lagu tampil
5. Coba putar lagu - pastikan audio berfungsi

## Troubleshooting

### Gambar masih tidak tampil setelah migrasi
- Cek URL di database: `SELECT id, name, cover_url FROM albums LIMIT 5;`
- Pastikan URL dimulai dengan `https://res.cloudinary.com/`
- Cek apakah file benar-benar ada di Cloudinary Media Library

### Audio tidak bisa diputar
- Cek URL di database: `SELECT id, title, file_url FROM songs LIMIT 5;`
- Pastikan URL Cloudinary menggunakan `/raw/upload/` untuk audio (bukan `/image/upload/`)
- Cek format file audio didukung browser (MP3, WAV, M4A)

## Catatan Penting

- **Selalu backup database sebelum migrasi!**
- Test di development dulu sebelum production
- Cloudinary Free tier: 25GB storage, cukup untuk ~5000 lagu MP3 @ 5MB
