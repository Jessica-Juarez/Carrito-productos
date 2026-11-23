const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contraseña: {
      type: String,
      required: true,
    },
    carrito: [
      {
        productoId: mongoose.Schema.Types.ObjectId,
        cantidad: Number,
        precio: Number,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
