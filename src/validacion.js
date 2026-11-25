// Reglas de validación del inventario de equipos tecnológicos.
// RF-01: nombre y stock del producto. RF-03: umbral de stock bajo.
// La validación se ejecuta siempre en el servidor; la interfaz no la sustituye.

export const LIMITE_STOCK = 2147483647;
export const LONGITUD_MAXIMA_NOMBRE = 100;
export const UMBRAL_PREDETERMINADO = 5;

const CAMPOS_PERMITIDOS = new Set(['nombre', 'stock']);
const PARAMETROS_STOCK_BAJO = new Set(['umbral']);
// Entero decimal canónico: "0" o un dígito 1-9 seguido de dígitos, sin signo,
// sin ceros a la izquierda, sin espacios, sin decimales ni notación exponencial.
const ENTERO_CANONICO = /^(0|[1-9][0-9]*)$/;

function fallo(codigo, mensaje, campo = null) {
  return { valido: false, error: { codigo, mensaje, campo } };
}

// Cuenta puntos de código Unicode (no unidades UTF-16): "🖥️" no cuenta como 3.
export function contarPuntosDeCodigo(texto) {
  return [...texto].length;
}

export function validarProducto(cuerpo) {
  if (cuerpo === null || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) {
    return fallo('cuerpo_invalido', 'El cuerpo debe ser un objeto JSON con nombre y stock.');
  }

  for (const clave of Object.keys(cuerpo)) {
    if (!CAMPOS_PERMITIDOS.has(clave)) {
      return fallo('campo_no_permitido', `El campo "${clave}" no forma parte del contrato.`, clave);
    }
  }

  const { nombre, stock } = cuerpo;

  if (nombre === undefined) {
    return fallo('nombre_requerido', 'El nombre es obligatorio.', 'nombre');
  }
  if (typeof nombre !== 'string') {
    return fallo('nombre_tipo_invalido', 'El nombre debe ser una cadena de texto.', 'nombre');
  }
  const nombreLimpio = nombre.trim();
  const longitud = contarPuntosDeCodigo(nombreLimpio);
  if (longitud === 0) {
    return fallo('nombre_vacio', 'El nombre no puede estar vacío ni contener solo espacios.', 'nombre');
  }
  if (longitud > LONGITUD_MAXIMA_NOMBRE) {
    return fallo(
      'nombre_longitud_excedida',
      `El nombre admite como máximo ${LONGITUD_MAXIMA_NOMBRE} caracteres.`,
      'nombre'
    );
  }

  if (stock === undefined) {
    return fallo('stock_requerido', 'El stock es obligatorio.', 'stock');
  }
  // Sin coerción: "5", true o null no se convierten en número.
  if (typeof stock !== 'number' || !Number.isFinite(stock)) {
    return fallo('stock_tipo_invalido', 'El stock debe ser un número JSON, no texto ni otro tipo.', 'stock');
  }
  if (!Number.isInteger(stock)) {
    return fallo('stock_no_entero', 'El stock debe ser un número entero.', 'stock');
  }
  if (stock < 0 || stock > LIMITE_STOCK) {
    return fallo('stock_fuera_de_rango', `El stock debe estar entre 0 y ${LIMITE_STOCK}.`, 'stock');
  }

  // Object.is(-0, 0) es falso; se normaliza -0 a 0 para no exponer un cero negativo.
  return { valido: true, valor: { nombre: nombreLimpio, stock: stock === 0 ? 0 : stock } };
}

export function validarUmbral(parametros) {
  for (const clave of parametros.keys()) {
    if (!PARAMETROS_STOCK_BAJO.has(clave)) {
      return fallo('parametro_no_permitido', `El parámetro "${clave}" no forma parte del contrato.`, clave);
    }
  }

  const valores = parametros.getAll('umbral');
  if (valores.length === 0) {
    return { valido: true, valor: UMBRAL_PREDETERMINADO };
  }
  if (valores.length > 1) {
    return fallo('umbral_repetido', 'El parámetro umbral solo puede enviarse una vez.', 'umbral');
  }

  const texto = valores[0];
  if (!ENTERO_CANONICO.test(texto)) {
    return fallo(
      'umbral_formato_invalido',
      'El umbral debe ser un entero decimal sin signo, sin ceros a la izquierda ni espacios.',
      'umbral'
    );
  }
  // Se compara la longitud antes de convertir para evitar pérdida de precisión.
  if (texto.length > String(LIMITE_STOCK).length || Number(texto) > LIMITE_STOCK) {
    return fallo('umbral_fuera_de_rango', `El umbral debe estar entre 0 y ${LIMITE_STOCK}.`, 'umbral');
  }

  return { valido: true, valor: Number(texto) };
}
