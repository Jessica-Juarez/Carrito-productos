const mongoose = require('mongoose');
const { Pool } = require('pg');

let connectionPromise;
let postgresPool;

const getPostgresPool = () => {
  if (!postgresPool) {
    postgresPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 2,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
    });
    postgresPool.on('error', (error) => {
      console.error('Error en el pool de PostgreSQL:', error.message);
    });
  }
  return postgresPool;
};

const connectDB = async () => {
  if (process.env.DATABASE_URL) {
    await getPostgresPool().query('SELECT 1 FROM carrito_app.usuarios LIMIT 1');
    return;
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGODB_URI);
  }

  try {
    await connectionPromise;
  } catch (error) {
    console.error('Error al conectar MongoDB:', error.message);
    throw error;
  } finally {
    connectionPromise = undefined;
  }
};

module.exports = connectDB;
module.exports.getPostgresPool = getPostgresPool;
