const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
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
};