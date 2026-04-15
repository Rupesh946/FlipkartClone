const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL (cloud) or individual vars (local dev)
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }   // required by Neon / Render / Supabase
        : false,
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME     || 'flipkart_clone',
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || '',
    });

pool.on('connect', () => console.log('Database connected'));
pool.on('error',   (err) => { console.error('DB pool error', err); process.exit(-1); });

module.exports = pool;
