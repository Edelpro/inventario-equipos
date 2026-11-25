// RF-03 · Interfaz del inventario: entrega de archivos y escenario de aceptación.
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearProducto, iniciarServidor, obtener } from './ayudante.js';
import {
  UMBRAL_INICIAL_INTERFAZ,
  construirRutaConsulta,
  prepararCuerpoProducto
} from '../public/inventario-ui.js';

describe('Interfaz del inventario', () => {
  let servidor;
  beforeEach(async () => {
    servidor = await iniciarServidor();
  });
  afterEach(() => servidor.cerrar());

  it('sirve la página con formulario, filtro "Solo stock bajo", umbral inicial 3 y sus scripts', async () => {
    const pagina = await fetch(`${servidor.base}/`);
    const html = await pagina.text();
    assert.equal(pagina.status, 200);
    assert.match(pagina.headers.get('content-type'), /^text\/html/);
    for (const fragmento of ['id="form-crear"', 'id="solo-stock-bajo"', 'id="consultar"', 'id="umbral"', 'value="3"']) {
      assert.ok(html.includes(fragmento), `falta ${fragmento}`);
    }
    for (const script of ['/app.js', '/inventario-ui.js']) {
      const respuesta = await fetch(`${servidor.base}${script}`);
      assert.equal(respuesta.status, 200);
      assert.match(respuesta.headers.get('content-type'), /^text\/javascript/);
    }
    assert.equal(UMBRAL_INICIAL_INTERFAZ, '3');
  });

  it('escenario de aceptación: Router/stock 2 se conserva con umbral 3 y se excluye con 1; el servidor valida', async () => {
    const alta = await crearProducto(servidor.base, prepararCuerpoProducto('Router', '2'));
    assert.equal(alta.estado, 201);

    const listado = await obtener(servidor.base, construirRutaConsulta(false, UMBRAL_INICIAL_INTERFAZ));
    assert.deepEqual(listado.datos.map((p) => p.nombre), ['Router']);

    const conUmbral3 = await obtener(servidor.base, construirRutaConsulta(true, UMBRAL_INICIAL_INTERFAZ));
    assert.deepEqual(conUmbral3.datos.map((p) => p.nombre), ['Router']);

    const conUmbral1 = await obtener(servidor.base, construirRutaConsulta(true, '1'));
    assert.deepEqual(conUmbral1.datos, []);

    // La interfaz no sustituye la validación del servidor.
    const invalido = await crearProducto(servidor.base, prepararCuerpoProducto('Router', 'dos'));
    assert.equal(invalido.estado, 400);
    assert.equal(invalido.datos.error.codigo, 'stock_tipo_invalido');
  });
});
