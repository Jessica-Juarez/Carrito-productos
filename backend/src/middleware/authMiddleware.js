const { verifyToken } = require('../utils/generateToken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }

    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ mensaje: 'Token inválido' });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Error de autenticación' });
  }
};

module.exports = authMiddleware;
