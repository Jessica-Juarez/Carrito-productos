const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/generateToken');

const register = async (req, res) => {
  try {
    const { nombre, email, contraseña } = req.body;

    // Validar que los campos no estén vacíos
    if (!nombre || !email || !contraseña) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ mensaje: 'El email no es válido' });
    }

    // Validar longitud de contraseña
    if (contraseña.length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const usuarioExistente = await User.findOne({ email: email.toLowerCase() });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }

    const contraseñaHasheada = await bcrypt.hash(contraseña, 10);

    const nuevoUsuario = new User({
      nombre: nombre.trim(),
      email: email.toLowerCase(),
      contraseña: contraseñaHasheada,
    });

    await nuevoUsuario.save();

    const token = generateToken(nuevoUsuario._id);

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
      },
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar error de email duplicado
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'El email ya está registrado' });
    }
    
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    // Normalizar email a minúsculas
    const emailNormalizado = email.toLowerCase().trim();

    const usuario = await User.findOne({ email: emailNormalizado });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const contraseñaValida = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!contraseñaValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = generateToken(usuario._id);

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
      },
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

module.exports = { register, login };
