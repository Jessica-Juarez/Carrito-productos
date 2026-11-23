const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  obtenerCarrito,
  agregarAlCarrito,
  eliminarDelCarrito,
} = require('../controllers/userController');

const router = express.Router();

router.get('/carrito', authMiddleware, obtenerCarrito);
router.post('/carrito', authMiddleware, agregarAlCarrito);
router.delete('/carrito/:productoId', authMiddleware, eliminarDelCarrito);

module.exports = router;
