const { Pool } = require('pg');
require('dotenv').config();

console.log("👉 DATABASE URL IS:", process.env.DATABASE_URL);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false 
  }
});

pool.on('connect', () => {
  console.log('Connected to Neon.tech PostgreSQL Database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;