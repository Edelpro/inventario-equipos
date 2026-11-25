// RF-03 · GET /productos/stock-bajo: umbral canónico, fronteras y rechazos.
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearProducto, iniciarServidor, obtener } from './ayudante.js';

async function cargarInventario(base) {
  for (const [nombre, stock] of [
    ['Agotado', 0],
    ['Router', 2],
    ['Laptop', 5],
    ['Monitor', 6],
    ['Cable', 2147483647]
  ]) {
    await crearProducto(base, { nombre, stock });
  }
}

const nombres = (productos) => productos.map((producto) => producto.nombre);

describe('RF-03 · GET /productos/stock-bajo', () => {
  let servidor;
  beforeEach(async () => {
    servidor = await iniciarServidor();
    await cargarInventario(servidor.base);
  });
  afterEach(() => servidor.cerrar());

  async function rechazo(consulta, codigo) {
    const { estado, datos } = await obtener(servidor.base, `/productos/stock-bajo${consulta}`);
    assert.equal(estado, 400);
    assert.equal(datos.error.codigo, codigo);
    assert.equal(datos.error.campo, codigo === 'parametro_no_permitido' ? 'limite' : 'umbral');
  }

  describe('umbrales válidos', () => {
    it('usa el umbral predeterminado 5 cuando no se envía', async () => {
      const { estado, datos } = await obtener(servidor.base, '/productos/stock-bajo');
      assert.equal(estado, 200);
      assert.deepEqual(nombres(datos), ['Agotado', 'Router', 'Laptop']);
    });

    it('incluye el stock igual al umbral (stock ≤ umbral)', async () => {
      const { datos } = await obtener(servidor.base, '/productos/stock-bajo?umbral=5');
      assert.ok(nombres(datos).includes('Laptop'));
    });

    it('excluye el stock inmediatamente superior al umbral', async () => {
      const { datos } = await obtener(servidor.base, '/productos/stock-bajo?umbral=5');
      assert.ok(!nombres(datos).includes('Monitor'));
    });

    it('acepta umbral 0 y devuelve solo stock cero', async () => {
      const { estado, datos } = await obtener(servidor.base, '/productos/stock-bajo?umbral=0');
      assert.equal(estado, 200);
      assert.deepEqual(nombres(datos), ['Agotado']);
    });

    it('acepta umbral 2147483647 y devuelve todos', async () => {
      const { estado, datos } = await obtener(servidor.base, '/productos/stock-bajo?umbral=2147483647');
      assert.equal(estado, 200);
      assert.equal(datos.length, 5);
    });

    it('incluye Router/stock 2 con umbral 3', async () => {
      const { datos } = await obtener(servidor.base, '/productos/stock-bajo?umbral=3');
      assert.deepEqual(nombres(datos), ['Agotado', 'Router']);
    });

    it('excluye Router/stock 2 con umbral 1', async () => {
      const { datos } = await obtener(servidor.base, '/productos/stock-bajo?umbral=1');
      assert.deepEqual(nombres(datos), ['Agotado']);
    });

    it('devuelve 200 con arreglo vacío si no hay coincidencias', async () => {
      const vacio = await iniciarServidor();
      try {
        const { estado, datos } = await obtener(vacio.base, '/productos/stock-bajo?umbral=3');
        assert.equal(estado, 200);
        assert.deepEqual(datos, []);
      } finally {
        await vacio.cerrar();
      }
    });
  });

  describe('umbrales rechazados', () => {
    it('rechaza umbral 2147483648 (excedente)', () => rechazo('?umbral=2147483648', 'umbral_fuera_de_rango'));
    it('rechaza umbral negativo -1', () => rechazo('?umbral=-1', 'umbral_formato_invalido'));
    it('rechaza umbral decimal 1.5', () => rechazo('?umbral=1.5', 'umbral_formato_invalido'));
    it('rechaza ceros a la izquierda 05', () => rechazo('?umbral=05', 'umbral_formato_invalido'));
    it('rechaza signo explícito %2B5', () => rechazo('?umbral=%2B5', 'umbral_formato_invalido'));
    it('rechaza umbral vacío', () => rechazo('?umbral=', 'umbral_formato_invalido'));
    it('rechaza texto no numérico y notación exponencial', async () => {
      await rechazo('?umbral=abc', 'umbral_formato_invalido');
      await rechazo('?umbral=1e1', 'umbral_formato_invalido');
      await rechazo('?umbral=%205', 'umbral_formato_invalido');
    });
    it('rechaza umbral repetido', () => rechazo('?umbral=3&umbral=4', 'umbral_repetido'));
    it('rechaza parámetros fuera del contrato', () => rechazo('?limite=3', 'parametro_no_permitido'));
  });
});
