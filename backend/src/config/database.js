const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const poolConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const pool = new Pool(poolConfig);

// Configurar search_path para usar schema lovable
pool.on('connect', (client) => {
  client.query('SET search_path TO lovable');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
};

module.exports = { pool, query };
