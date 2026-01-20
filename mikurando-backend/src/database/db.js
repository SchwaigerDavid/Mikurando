const { Pool } = require('pg');
require('dotenv').config();

function mustString(name, fallback = '') {
  const v = process.env[name];
  if (v === undefined || v === null) {
    console.warn(`[db] Missing env ${name}`);
    return fallback;
  }
  return String(v);
}

const pool = new Pool({
  user: mustString('DB_USER'),
  host: mustString('DB_HOST'),
  database: mustString('DB_NAME'),
  password: mustString('DB_PASSWORD'),
  port: Number.parseInt(mustString('DB_PORT', '5432'), 10),
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('ERROR trying to connect to database:', err);
  } else {
    console.log('Database connected at ', res.rows[0].now);
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool,
};