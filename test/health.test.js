// Starter mínimo: salud del servicio (no equivale a aceptación funcional).
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { iniciarServidor, obtener } from './ayudante.js';

describe('GET /health', () => {
  let servidor;
  beforeEach(async () => {
    servidor = await iniciarServidor({ revision: 'abc1234', entorno: 'prueba' });
  });
  afterEach(() => servidor.cerrar());

  it('responde 200 con estado ok en JSON', async () => {
    const { estado, datos, cabeceras } = await obtener(servidor.base, '/health');
    assert.equal(estado, 200);
    assert.match(cabeceras.get('content-type'), /^application\/json/);
    assert.equal(datos.estado, 'ok');
    assert.equal(datos.servicio, 'inventario-equipos');
  });

  it('informa la revisión exacta y el entorno configurados', async () => {
    const { datos } = await obtener(servidor.base, '/health');
    assert.equal(datos.revision, 'abc1234');
    assert.equal(datos.entorno, 'prueba');
  });
});
