const db = require('../config/db');

async function listAlbums() {
  const [rows] = await db.query(
    `SELECT a.id, a.name, a.artist_key, a.description, a.cover_url, a.created_at,
            u.id AS owner_id, u.username AS owner_username, u.name AS owner_name,
            ar.name AS artist_name,
            COUNT(s.id) AS song_count
     FROM albums a
     JOIN users u ON u.id = a.user_id
     JOIN artists ar ON ar.artist_key = a.artist_key
     LEFT JOIN songs s ON s.album_id = a.id
     GROUP BY a.id
     ORDER BY a.created_at DESC`,
  );

  return rows;
}

async function getAlbumById(id) {
  const [rows] = await db.query(
    `SELECT a.id, a.name, a.artist_key, a.description, a.cover_url, a.created_at,
            u.id AS owner_id, u.username AS owner_username, u.name AS owner_name,
            ar.name AS artist_name
     FROM albums a
     JOIN users u ON u.id = a.user_id
     JOIN artists ar ON ar.artist_key = a.artist_key
     WHERE a.id = ? LIMIT 1`,
    [id],
  );

  return rows[0] || null;
}

async function listAlbumSongs(id) {
  const [rows] = await db.query(
    `SELECT s.id, s.title, s.artist_key, s.file_url, s.cover_url, s.created_at,
            s.user_id AS owner_id, u.username AS owner_username
     FROM songs s
     JOIN users u ON u.id = s.user_id
     WHERE s.album_id = ?
     ORDER BY s.created_at DESC`,
    [id],
  );

  return rows;
}

async function createAlbum({ userId, artistKey, name, description, coverUrl }) {
  const [result] = await db.query(
    'INSERT INTO albums (user_id, artist_key, name, description, cover_url) VALUES (?, ?, ?, ?, ?)',
    [userId, artistKey, name, description || null, coverUrl],
  );

  return {
    id: result.insertId,
    user_id: userId,
    artist_key: artistKey,
    name,
    description: description || null,
    cover_url: coverUrl,
  };
}

module.exports = {
  listAlbums,
  getAlbumById,
  listAlbumSongs,
  createAlbum,
};
