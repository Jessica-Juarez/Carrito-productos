const assert = require('node:assert/strict');
const test = require('node:test');
const { Pool } = require('pg');

process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
process.env.JWT_SECRET = 'test-secret';

test('registro e inicio de sesion usan PostgreSQL y detectan emails duplicados', async (t) => {
  const rows = new Map();
  let databaseAvailable = true;
  let duplicateOnInsert = false;
  t.mock.method(Pool.prototype, 'query', async (sql, params = []) => {
    if (sql.startsWith('SELECT 1')) {
      if (!databaseAvailable) throw new Error('Base no disponible');
      return { rows: [] };
    }
    if (sql.startsWith('SELECT')) {
      const row = rows.get(params[0]);
      return { rows: row ? [row] : [] };
    }
    if (sql.startsWith('INSERT')) {
      if (duplicateOnInsert || rows.has(params[2])) {
        const error = new Error('duplicate');
        error.code = '23505';
        throw error;
      }
      rows.set(params[2], {
        id: params[0], nombre: params[1], email: params[2],
        password_hash: params[3], carrito: JSON.parse(params[4]),
      });
      return { rows: [] };
    }
    throw new Error(`Consulta inesperada: ${sql}`);
  });

  const app = require('../src/server');
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const url = `http://127.0.0.1:${server.address().port}`;
  const post = (path, body) => fetch(`${url}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const health = await fetch(`${url}/health`);
  assert.deepEqual(await health.json(), { status: 'ok', database: 'connected' });
  const user = { nombre: 'Prueba', email: 'test@example.com', contraseña: 'password123' };
  const registration = await post('/api/auth/register', user);
  assert.equal(registration.status, 201);
  const registered = await registration.json();
  assert.ok(registered.token);
  assert.notEqual(rows.get(user.email).password_hash, user.contraseña);

  const login = await post('/api/auth/login', user);
  assert.equal(login.status, 200);
  assert.equal((await login.json()).usuario.id, registered.usuario.id);
  assert.equal((await post('/api/auth/login', { ...user, contraseña: 'incorrecta' })).status, 401);
  assert.equal((await post('/api/auth/register', user)).status, 400);
  duplicateOnInsert = true;
  assert.equal((await post('/api/auth/register', { ...user, email: 'otro@example.com' })).status, 400);
  databaseAvailable = false;
  const unavailable = await fetch(`${url}/health`);
  assert.equal(unavailable.status, 503);
});
