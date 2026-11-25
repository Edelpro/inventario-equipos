// Starter mínimo: solo expone /health para comprobar CI, runner y los dos entornos
// antes de desarrollar. Cualquier otra ruta responde 404 documentado.
import { responderError, responderJson } from './http.js';

export function crearAplicacion({ revision = 'desconocida', entorno = 'local' } = {}) {
  return async function manejarSolicitud(req, res) {
    const ruta = new URL(req.url, 'http://localhost').pathname;

    if (ruta === '/health' && req.method === 'GET') {
      return responderJson(res, 200, { estado: 'ok', servicio: 'inventario-equipos', revision, entorno });
    }

    return responderError(res, 404, 'recurso_no_encontrado', `No existe ${req.method} ${ruta}.`);
  };
}
