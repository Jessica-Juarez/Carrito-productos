const assert = require('node:assert/strict');
const test = require('node:test');
const mongoose = require('mongoose');
const connectDB = require('../src/config/database');

test('comparte conexiones concurrentes y permite reintentar tras un fallo', async (t) => {
  const previousState = mongoose.connection.readyState;
  t.after(() => { mongoose.connection.readyState = previousState; });
  mongoose.connection.readyState = 0;

  let resolveConnection;
  const connect = t.mock.method(mongoose, 'connect', () => new Promise((resolve) => {
    resolveConnection = resolve;
  }));
  const first = connectDB();
  const second = connectDB();
  assert.equal(connect.mock.callCount(), 1);
  resolveConnection();
  await Promise.all([first, second]);

  connect.mock.mockImplementationOnce(async () => { throw new Error('fallo de prueba'); });
  await assert.rejects(connectDB(), /fallo de prueba/);

  connect.mock.mockImplementationOnce(async () => {});
  await connectDB();
  assert.equal(connect.mock.callCount(), 3);
});
