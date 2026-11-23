const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  const token = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'tu_clave_secreta_muy_segura_2024',
    { expiresIn: '7d' }
  );
  return token;
};

module.exports = { generateToken };
