const { randomUUID } = require('node:crypto');
const { getPostgresPool } = require('../config/database');

class PostgresUser {
  constructor({ _id = randomUUID(), nombre, email, contraseña, carrito = [], saved = false }) {
    this._id = _id;
    this.nombre = nombre;
    this.email = email;
    this.contraseña = contraseña;
    this.carrito = carrito;
    this.saved = saved;
  }

  static fromRow(row) {
    return row && new PostgresUser({
      _id: row.id,
      nombre: row.nombre,
      email: row.email,
      contraseña: row.password_hash,
      carrito: row.carrito,
      saved: true,
    });
  }

  static async findOne({ email }) {
    const result = await getPostgresPool().query(
      'SELECT id, nombre, email, password_hash, carrito FROM carrito_app.usuarios WHERE email = $1',
      [email]
    );
    return this.fromRow(result.rows[0]);
  }

  static async findById(id) {
    const result = await getPostgresPool().query(
      'SELECT id, nombre, email, password_hash, carrito FROM carrito_app.usuarios WHERE id::text = $1',
      [String(id)]
    );
    return this.fromRow(result.rows[0]);
  }

  async save() {
    if (this.saved) {
      await getPostgresPool().query(
        'UPDATE carrito_app.usuarios SET nombre = $2, email = $3, password_hash = $4, carrito = $5, updated_at = now() WHERE id = $1',
        [this._id, this.nombre, this.email, this.contraseña, JSON.stringify(this.carrito)]
      );
    } else {
      await getPostgresPool().query(
        'INSERT INTO carrito_app.usuarios (id, nombre, email, password_hash, carrito) VALUES ($1, $2, $3, $4, $5)',
        [this._id, this.nombre, this.email, this.contraseña, JSON.stringify(this.carrito)]
      );
      this.saved = true;
    }
  }
}

module.exports = PostgresUser;
