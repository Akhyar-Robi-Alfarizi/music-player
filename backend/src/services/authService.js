const db = require('../config/db');

async function getUserByIdentifier(identifier) {
  const [rows] = await db.query(
    'SELECT id, name, username, email, password_hash FROM users WHERE username = ? OR email = ? LIMIT 1',
    [identifier, identifier],
  );

  return rows[0] || null;
}

async function existsByUsernameOrEmail({ username, email }) {
  const [rows] = await db.query(
    'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
    [username, email],
  );

  return rows.length > 0;
}

async function createUser({ name, username, email, passwordHash }) {
  const [result] = await db.query(
    'INSERT INTO users (name, username, email, password_hash) VALUES (?, ?, ?, ?)',
    [name, username, email, passwordHash],
  );

  return {
    id: result.insertId,
    name,
    username,
    email,
  };
}

async function getUserById(id) {
  const [rows] = await db.query(
    'SELECT id, name, username, email, created_at FROM users WHERE id = ?',
    [id],
  );

  return rows[0] || null;
}

module.exports = {
  getUserByIdentifier,
  existsByUsernameOrEmail,
  createUser,
  getUserById,
};
