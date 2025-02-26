import sql from '../database/config.js';

export const findUserByEmail = async (email) => {
  const [users] = await sql.query('SELECT * FROM users WHERE email = ?', [email]);
  return users[0];
};

export const saveUser = async (username, email, password) => {
  const [results] = await sql.query(
    'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
    [username, email, password]
  );
  return results.insertId;
};
