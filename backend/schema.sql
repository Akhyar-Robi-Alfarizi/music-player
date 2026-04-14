CREATE DATABASE IF NOT EXISTS mymusic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE mymusic;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artists (
  id INT AUTO_INCREMENT PRIMARY KEY,
  artist_key VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  image_url TEXT,
  color VARCHAR(20) DEFAULT '#1db954',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS albums (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  artist_key VARCHAR(60) NOT NULL,
  name VARCHAR(160) NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_key) REFERENCES artists(artist_key) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS songs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  artist_key VARCHAR(60) NOT NULL,
  album_id INT NULL,
  title VARCHAR(180) NOT NULL,
  file_url TEXT NOT NULL,
  cover_url TEXT,
  duration_seconds INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_key) REFERENCES artists(artist_key) ON DELETE RESTRICT,
  FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  song_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY user_song_unique (user_id, song_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

INSERT INTO artists (artist_key, name, image_url, color)
VALUES
  ('hindia', 'Hindia', 'https://assets-a1.kompasiana.com/items/album/2025/02/24/hindia-doves-avatar-dsp-67bbf1cec925c47f353d39c2.jpg?t=o&v=1200', '#1db954'),
  ('naikila', 'Naykilla', 'https://cdn-images.dzcdn.net/images/cover/f3b9f1ea58dc91932fa5df77e9fa810f/0x1900-000000-80-0-0.jpg', '#e74c3c'),
  ('tenxi', 'Tenxi', 'https://yt3.googleusercontent.com/PxGPh5IevnfnRUUjeIDpBhkyMsqkQdne9wkUjBSNV6eY5aYVbiGd-VZp8B3AqxGPiY7i8-jEzg=s900-c-k-c0x00ffffff-no-rj', '#9b59b6'),
  ('dia', 'Dia', 'https://i.scdn.co/image/ab67616d0000b273bc6ee0a7c05af5d905d9a7ac', '#f39c12')
ON DUPLICATE KEY UPDATE name = VALUES(name), image_url = VALUES(image_url), color = VALUES(color);
