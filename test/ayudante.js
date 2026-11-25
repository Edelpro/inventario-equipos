// Ayudantes de prueba: cada prueba levanta una instancia nueva con estado aislado.
import http from 'node:http';
import assert from 'node:assert/strict';
import { crearAplicacion } from '../src/app.js';

export async function iniciarServidor(opciones = {}) {
  const servidor = http.createServer(crearAplicacion(opciones));
  await new Promise((resolver) => servidor.listen(0, '127.0.0.1', resolver));
  const { port } = servidor.address();
  return {
    base: `http://127.0.0.1:${port}`,
    cerrar: () => new Promise((resolver) => servidor.close(resolver))
  };
}

export async function crearProducto(base, cuerpo, { crudo = false, tipo = 'application/json' } = {}) {
  const respuesta = await fetch(`${base}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': tipo },
    body: crudo ? cuerpo : JSON.stringify(cuerpo)
  });
  return { estado: respuesta.status, datos: await respuesta.json(), cabeceras: respuesta.headers };
}

export async function obtener(base, ruta) {
  const respuesta = await fetch(`${base}${ruta}`);
  return { estado: respuesta.status, datos: await respuesta.json(), cabeceras: respuesta.headers };
}

// Verifica un rechazo documentado y que el estado del inventario no cambie.
export async function esperarRechazo(base, cuerpo, codigoEsperado, opciones) {
  const antes = await obtener(base, '/productos');
  assert.equal(antes.estado, 200, 'GET /productos debe existir antes de comprobar el rechazo');
  const { estado, datos } = await crearProducto(base, cuerpo, opciones);
  assert.equal(estado, 400);
  assert.equal(datos.error.codigo, codigoEsperado);
  const despues = await obtener(base, '/productos');
  assert.deepEqual(despues.datos, antes.datos, 'un rechazo no debe agregar productos');
}
