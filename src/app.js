// Aplicación HTTP del inventario de equipos tecnológicos (sin dependencias externas).
// Contrato: docs/04-diseno-contrato.md
import { crearAlmacen } from './almacen.js';
import { validarProducto, validarUmbral } from './validacion.js';
import { ErrorCuerpo, leerCuerpoJson, responderError, responderJson } from './http.js';
import { esRutaEstatica, servirEstatico } from './estaticos.js';

const METODOS_POR_RUTA = new Map([
  ['/health', ['GET']],
  ['/productos', ['GET', 'POST']],
  ['/productos/stock-bajo', ['GET']]
]);

export function crearAplicacion({ revision = 'desconocida', entorno = 'local' } = {}) {
  const almacen = crearAlmacen();

  return async function manejarSolicitud(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const ruta = url.pathname;
      const metodo = req.method;

      const permitidos = METODOS_POR_RUTA.get(ruta);
      if (permitidos && !permitidos.includes(metodo)) {
        return responderError(res, 405, 'metodo_no_permitido', `Método ${metodo} no permitido en ${ruta}.`, null, {
          Allow: permitidos.join(', ')
        });
      }

      if (ruta === '/health') {
        return responderJson(res, 200, { estado: 'ok', servicio: 'inventario-equipos', revision, entorno });
      }

      if (ruta === '/productos' && metodo === 'GET') {
        return responderJson(res, 200, almacen.listar());
      }

      if (ruta === '/productos' && metodo === 'POST') {
        const cuerpo = await leerCuerpoJson(req);
        const resultado = validarProducto(cuerpo);
        if (!resultado.valido) {
          const { codigo, mensaje, campo } = resultado.error;
          return responderError(res, 400, codigo, mensaje, campo);
        }
        return responderJson(res, 201, almacen.agregar(resultado.valor));
      }

      if (ruta === '/productos/stock-bajo') {
        const resultado = validarUmbral(url.searchParams);
        if (!resultado.valido) {
          const { codigo, mensaje, campo } = resultado.error;
          return responderError(res, 400, codigo, mensaje, campo);
        }
        return responderJson(res, 200, almacen.listarStockBajo(resultado.valor));
      }

      if (metodo === 'GET' && esRutaEstatica(ruta)) {
        return await servirEstatico(ruta, res);
      }

      return responderError(res, 404, 'recurso_no_encontrado', `No existe ${metodo} ${ruta}.`);
    } catch (error) {
      if (error instanceof ErrorCuerpo) {
        return responderError(res, error.estado, error.codigo, error.message);
      }
      console.error('[inventario] error interno:', error);
      if (!res.headersSent) {
        return responderError(res, 500, 'error_interno', 'Error interno del servidor.');
      }
      res.end();
    }
  };
}
