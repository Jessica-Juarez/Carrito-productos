const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/database');

dotenv.config({ path: './src/.env' });

if (process.env.NODE_ENV === 'production') {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI es obligatorio en produccion');
  }
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET es obligatorio en produccion');
  }
}

process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/Carrito_compras';
process.env.PORT = process.env.PORT || 5000;
process.env.JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_12345';

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const mongoose = require('mongoose');

// Crear aplicación Express
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Base de datos no disponible:', error.message);
    res.status(503).json({ mensaje: 'Base de datos no disponible' });
  }
});

// Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({
    message: 'API de Tienda Apple funcionando',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Conectada' : 'Desconectada'
  });
});

app.get('/health', (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;
  res.status(isDatabaseConnected ? 200 : 503).json({
    status: isDatabaseConnected ? 'ok' : 'unavailable',
    database: isDatabaseConnected ? 'connected' : 'disconnected'
  });
});

// Configurar puerto
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Servidor backend corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el backend:', error.message);
    process.exitCode = 1;
  }
};

if (require.main === module) {
  startServer();
}

module.exports = app;