const User = require('../models/User');

const obtenerCarrito = async (req, res) => {
  try {
    const usuario = await User.findById(req.userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json({ carrito: usuario.carrito });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener carrito', error: error.message });
  }
};

const agregarAlCarrito = async (req, res) => {
  try {
    const { productoId, cantidad, precio } = req.body;
    const usuario = await User.findById(req.userId);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const productoEnCarrito = usuario.carrito.find(
      (item) => item.productoId.toString() === productoId
    );

    if (productoEnCarrito) {
      productoEnCarrito.cantidad += cantidad;
    } else {
      usuario.carrito.push({ productoId, cantidad, precio });
    }

    await usuario.save();

    res.json({ mensaje: 'Producto agregado al carrito', carrito: usuario.carrito });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar al carrito', error: error.message });
  }
};

const eliminarDelCarrito = async (req, res) => {
  try {
    const { productoId } = req.params;
    const usuario = await User.findById(req.userId);

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    usuario.carrito = usuario.carrito.filter(
      (item) => item.productoId.toString() !== productoId
    );

    await usuario.save();

    res.json({ mensaje: 'Producto eliminado del carrito', carrito: usuario.carrito });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar del carrito', error: error.message });
  }
};

module.exports = { obtenerCarrito, agregarAlCarrito, eliminarDelCarrito };
