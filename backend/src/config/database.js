const mongoose = require('mongoose');

let connectionPromise;

const connectDB = async () => {
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
