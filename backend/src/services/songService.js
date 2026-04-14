const db = require('../config/db');

function buildSongWhereClause({ search = '', artist = '', mine = '0', userId = null }) {
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push('(s.title LIKE ? OR u.username LIKE ? OR ar.name LIKE ?)');
    const keyword = `%${search}%`;
    values.push(keyword, keyword, keyword);
  }

  if (artist) {
    conditions.push('s.artist_key = ?');
    values.push(artist);
  }

  if (mine === '1' && userId) {
    conditions.push('s.user_id = ?');
    values.push(userId);
  }

  return {
    whereClause: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '',
    values,
  };
}

async function listSongs(filters) {
  const { whereClause, values } = buildSongWhereClause(filters);

  const [rows] = await db.query(
    `SELECT s.id, s.title, s.artist_key, s.album_id, s.file_url, s.cover_url, s.created_at,
            s.user_id AS owner_id, u.username AS owner_username, u.name AS owner_name,
            ar.name AS artist_name, al.name AS album_name
     FROM songs s
     JOIN users u ON u.id = s.user_id
     JOIN artists ar ON ar.artist_key = s.artist_key
     LEFT JOIN albums al ON al.id = s.album_id
     ${whereClause}
     ORDER BY s.created_at DESC`,
    values,
  );

  return rows;
}

async function createSong({ userId, artistKey, albumId, title, fileUrl, coverUrl }) {
  const [result] = await db.query(
    'INSERT INTO songs (user_id, artist_key, album_id, title, file_url, cover_url) VALUES (?, ?, ?, ?, ?, ?)',
    [
      userId,
      artistKey,
      albumId || null,
      title,
      fileUrl,
      coverUrl,
    ],
  );

  return {
    id: result.insertId,
    title,
    artist_key: artistKey,
    album_id: albumId || null,
    file_url: fileUrl,
    cover_url: coverUrl,
  };
}

module.exports = {
  listSongs,
  createSong,
};
