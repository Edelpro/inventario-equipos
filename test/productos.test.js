// RF-01 (crear) y RF-02 (listar): casos normales, fronteras y rechazos.
import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { crearProducto, esperarRechazo, iniciarServidor, obtener } from './ayudante.js';

const CIEN_ASCII = 'a'.repeat(100);
const CIEN_EMOJI = '💻'.repeat(100); // 100 puntos de código, 200 unidades UTF-16

describe('RF-01 · POST /productos', () => {
  let servidor;
  beforeEach(async () => {
    servidor = await iniciarServidor();
  });
  afterEach(() => servidor.cerrar());

  describe('entradas válidas', () => {
    it('crea un producto y devuelve 201 con {id, nombre, stock}', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: 'Router', stock: 2 });
      assert.equal(estado, 201);
      assert.deepEqual(Object.keys(datos).sort(), ['id', 'nombre', 'stock']);
      assert.equal(datos.nombre, 'Router');
      assert.equal(datos.stock, 2);
      assert.equal(typeof datos.id, 'number');
    });

    it('elimina los espacios externos del nombre', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: '   Switch  ', stock: 4 });
      assert.equal(estado, 201);
      assert.equal(datos.nombre, 'Switch');
    });

    it('conserva los espacios internos del nombre', async () => {
      const { datos } = await crearProducto(servidor.base, { nombre: '  Switch 24 puertos ', stock: 4 });
      assert.equal(datos.nombre, 'Switch 24 puertos');
    });

    it('acepta stock cero (frontera inferior)', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: 'Proyector', stock: 0 });
      assert.equal(estado, 201);
      assert.equal(datos.stock, 0);
    });

    it('acepta stock 2147483647 (frontera superior)', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: 'Cable', stock: 2147483647 });
      assert.equal(estado, 201);
      assert.equal(datos.stock, 2147483647);
    });

    it('acepta un nombre de 1 carácter (frontera inferior)', async () => {
      const { estado } = await crearProducto(servidor.base, { nombre: 'X', stock: 1 });
      assert.equal(estado, 201);
    });

    it('acepta un nombre de 100 caracteres ASCII (frontera superior)', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: CIEN_ASCII, stock: 1 });
      assert.equal(estado, 201);
      assert.equal(datos.nombre, CIEN_ASCII);
    });

    it('acepta 100 puntos de código aunque ocupen 200 unidades UTF-16', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: CIEN_EMOJI, stock: 1 });
      assert.equal(estado, 201);
      assert.equal([...datos.nombre].length, 100);
    });

    it('mide la longitud después del trim', async () => {
      const { estado } = await crearProducto(servidor.base, { nombre: `  ${CIEN_ASCII}  `, stock: 1 });
      assert.equal(estado, 201);
    });

    it('acepta nombres con tildes y eñes', async () => {
      const { estado, datos } = await crearProducto(servidor.base, { nombre: 'Cámara de video año 2026', stock: 3 });
      assert.equal(estado, 201);
      assert.equal(datos.nombre, 'Cámara de video año 2026');
    });

    it('asigna identificadores únicos e incrementales', async () => {
      const primero = await crearProducto(servidor.base, { nombre: 'A', stock: 1 });
      const segundo = await crearProducto(servidor.base, { nombre: 'B', stock: 1 });
      assert.ok(segundo.datos.id > primero.datos.id);
    });
  });

  describe('rechazos de nombre', () => {
    it('rechaza nombre vacío', async () => {
      await esperarRechazo(servidor.base, { nombre: '', stock: 1 }, 'nombre_vacio');
    });
    it('rechaza nombre con solo espacios', async () => {
      await esperarRechazo(servidor.base, { nombre: '     ', stock: 1 }, 'nombre_vacio');
    });
    it('rechaza nombre con solo tabulaciones y saltos de línea', async () => {
      await esperarRechazo(servidor.base, { nombre: '\t\n\r ', stock: 1 }, 'nombre_vacio');
    });
    it('rechaza nombre de 101 caracteres', async () => {
      await esperarRechazo(servidor.base, { nombre: `${CIEN_ASCII}b`, stock: 1 }, 'nombre_longitud_excedida');
    });
    it('rechaza 101 puntos de código no ASCII', async () => {
      await esperarRechazo(servidor.base, { nombre: `${CIEN_EMOJI}💻`, stock: 1 }, 'nombre_longitud_excedida');
    });
    it('rechaza nombre numérico', async () => {
      await esperarRechazo(servidor.base, { nombre: 123, stock: 1 }, 'nombre_tipo_invalido');
    });
    it('rechaza nombre nulo', async () => {
      await esperarRechazo(servidor.base, { nombre: null, stock: 1 }, 'nombre_tipo_invalido');
    });
    it('rechaza nombre como arreglo', async () => {
      await esperarRechazo(servidor.base, { nombre: ['Router'], stock: 1 }, 'nombre_tipo_invalido');
    });
    it('rechaza ausencia de nombre', async () => {
      await esperarRechazo(servidor.base, { stock: 1 }, 'nombre_requerido');
    });
  });

  describe('rechazos de stock (sin coerción)', () => {
    it('rechaza stock como cadena numérica "5"', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: '5' }, 'stock_tipo_invalido');
    });
    it('rechaza stock como cadena vacía', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: '' }, 'stock_tipo_invalido');
    });
    it('rechaza stock negativo -1', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: -1 }, 'stock_fuera_de_rango');
    });
    it('rechaza stock decimal 1.5', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: 1.5 }, 'stock_no_entero');
    });
    it('rechaza stock 2147483648 (excedente)', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: 2147483648 }, 'stock_fuera_de_rango');
    });
    it('rechaza stock booleano', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: true }, 'stock_tipo_invalido');
    });
    it('rechaza stock nulo', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: null }, 'stock_tipo_invalido');
    });
    it('rechaza stock como arreglo', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: [5] }, 'stock_tipo_invalido');
    });
    it('rechaza ausencia de stock', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router' }, 'stock_requerido');
    });
  });

  describe('rechazos del cuerpo', () => {
    it('rechaza JSON mal formado', async () => {
      await esperarRechazo(servidor.base, '{"nombre": "Router", ', 'json_invalido', { crudo: true });
    });
    it('rechaza cuerpo vacío', async () => {
      await esperarRechazo(servidor.base, '', 'json_invalido', { crudo: true });
    });
    it('rechaza un arreglo como cuerpo', async () => {
      await esperarRechazo(servidor.base, [{ nombre: 'Router', stock: 2 }], 'cuerpo_invalido');
    });
    it('rechaza null como cuerpo', async () => {
      await esperarRechazo(servidor.base, null, 'cuerpo_invalido');
    });
    it('rechaza campos fuera del contrato (precio)', async () => {
      await esperarRechazo(servidor.base, { nombre: 'Router', stock: 2, precio: 10 }, 'campo_no_permitido');
    });
    it('rechaza un tipo de contenido distinto de application/json', async () => {
      await esperarRechazo(servidor.base, 'nombre=Router&stock=2', 'tipo_contenido_invalido', {
        crudo: true,
        tipo: 'application/x-www-form-urlencoded'
      });
    });
    it('responde 413 si el cuerpo supera 16 KiB', async () => {
      const grande = JSON.stringify({ nombre: 'x'.repeat(20000), stock: 1 });
      const { estado, datos } = await crearProducto(servidor.base, grande, { crudo: true });
      assert.equal(estado, 413);
      assert.equal(datos.error.codigo, 'cuerpo_demasiado_grande');
    });
    it('documenta el error con {error: {codigo, mensaje, campo}}', async () => {
      const { datos } = await crearProducto(servidor.base, { nombre: 'Router', stock: '5' });
      assert.deepEqual(Object.keys(datos.error).sort(), ['campo', 'codigo', 'mensaje']);
      assert.equal(datos.error.campo, 'stock');
      assert.equal(typeof datos.error.mensaje, 'string');
    });
  });
});

describe('RF-02 · GET /productos', () => {
  let servidor;
  beforeEach(async () => {
    servidor = await iniciarServidor();
  });
  afterEach(() => servidor.cerrar());

  it('devuelve 200 con un arreglo vacío al iniciar', async () => {
    const { estado, datos, cabeceras } = await obtener(servidor.base, '/productos');
    assert.equal(estado, 200);
    assert.match(cabeceras.get('content-type'), /^application\/json/);
    assert.deepEqual(datos, []);
  });

  it('incluye el producto después de un alta válida', async () => {
    const creado = await crearProducto(servidor.base, { nombre: 'Router', stock: 2 });
    const { datos } = await obtener(servidor.base, '/productos');
    assert.deepEqual(datos, [creado.datos]);
  });

  it('conserva el estado anterior después de un rechazo', async () => {
    await crearProducto(servidor.base, { nombre: 'Router', stock: 2 });
    const antes = await obtener(servidor.base, '/productos');
    await crearProducto(servidor.base, { nombre: 'Router', stock: -5 });
    const despues = await obtener(servidor.base, '/productos');
    assert.deepEqual(despues.datos, antes.datos);
    assert.equal(despues.datos.length, 1);
  });

  it('lista los productos en orden de registro', async () => {
    await crearProducto(servidor.base, { nombre: 'Primero', stock: 1 });
    await crearProducto(servidor.base, { nombre: 'Segundo', stock: 2 });
    const { datos } = await obtener(servidor.base, '/productos');
    assert.deepEqual(
      datos.map((producto) => producto.nombre),
      ['Primero', 'Segundo']
    );
  });

  it('cada instancia de aplicación empieza con estado aislado', async () => {
    await crearProducto(servidor.base, { nombre: 'Router', stock: 2 });
    const otra = await iniciarServidor();
    try {
      const { datos } = await obtener(otra.base, '/productos');
      assert.deepEqual(datos, []);
    } finally {
      await otra.cerrar();
    }
  });
});

describe('Rutas y métodos', () => {
  let servidor;
  beforeEach(async () => {
    servidor = await iniciarServidor();
  });
  afterEach(() => servidor.cerrar());

  it('responde 405 con cabecera Allow para un método no permitido', async () => {
    const respuesta = await fetch(`${servidor.base}/productos`, { method: 'DELETE' });
    const datos = await respuesta.json();
    assert.equal(respuesta.status, 405);
    assert.equal(respuesta.headers.get('allow'), 'GET, POST');
    assert.equal(datos.error.codigo, 'metodo_no_permitido');
  });

  it('responde 404 documentado para una ruta inexistente', async () => {
    const { estado, datos } = await obtener(servidor.base, '/precios');
    assert.equal(estado, 404);
    assert.equal(datos.error.codigo, 'recurso_no_encontrado');
  });
});
