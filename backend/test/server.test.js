const assert = require('node:assert/strict');
const test = require('node:test');

const databasePath = require.resolve('../src/config/database');
let databaseAvailable = true;
require.cache[databasePath] = {
  id: databasePath,
  filename: databasePath,
  loaded: true,
  exports: async () => {
    if (!databaseAvailable) {
      throw new Error('Conexion de prueba fallida');
    }
  },
};

const mongoose = require('mongoose');
const app = require('../src/server');

test('la API informa la salud de MongoDB y responde 503 ante fallos', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const url = `http://127.0.0.1:${server.address().port}/health`;
  const previousState = mongoose.connection.readyState;
  t.after(() => { mongoose.connection.readyState = previousState; });

  mongoose.connection.readyState = 1;
  const healthy = await fetch(url);
  assert.equal(healthy.status, 200);
  assert.deepEqual(await healthy.json(), { status: 'ok', database: 'connected' });

  databaseAvailable = false;
  const unavailable = await fetch(url);
  assert.equal(unavailable.status, 503);
  assert.deepEqual(await unavailable.json(), { mensaje: 'Base de datos no disponible' });
});
