const db = require('../config/db');

function toArtistKey(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function listArtists() {
  const [rows] = await db.query(
    'SELECT artist_key, name, image_url, color FROM artists ORDER BY name ASC',
  );

  return rows;
}

async function findOrCreateArtistByName(artistName) {
  const name = artistName.trim();

  const [existingByName] = await db.query(
    'SELECT artist_key, name FROM artists WHERE LOWER(name) = LOWER(?) LIMIT 1',
    [name],
  );

  if (existingByName[0]) {
    return existingByName[0];
  }

  const baseKey = toArtistKey(name) || `artist-${Date.now()}`;
  let artistKey = baseKey;
  let index = 1;

  while (true) {
    const [exists] = await db.query(
      'SELECT artist_key FROM artists WHERE artist_key = ? LIMIT 1',
      [artistKey],
    );

    if (!exists[0]) {
      break;
    }

    artistKey = `${baseKey}-${index}`;
    index += 1;
  }

  await db.query(
    'INSERT INTO artists (artist_key, name) VALUES (?, ?)',
    [artistKey, name],
  );

  return {
    artist_key: artistKey,
    name,
  };
}

module.exports = {
  listArtists,
  findOrCreateArtistByName,
};
