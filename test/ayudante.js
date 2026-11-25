// Ayudantes de prueba: cada prueba levanta una instancia nueva con estado aislado.
import http from 'node:http';
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

export async function obtener(base, ruta) {
  const respuesta = await fetch(`${base}${ruta}`);
  return { estado: respuesta.status, datos: await respuesta.json(), cabeceras: respuesta.headers };
}
