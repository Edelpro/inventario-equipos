// Lógica pura de la interfaz (sin DOM), reutilizable en el navegador y en las pruebas.
// La interfaz no valida por el servidor: solo prepara la solicitud y muestra la respuesta.

export const UMBRAL_INICIAL_INTERFAZ = '3';

const ENTERO_CANONICO = /^(0|[1-9][0-9]*)$/;

export function construirRutaConsulta(soloStockBajo, umbralTexto) {
  if (!soloStockBajo) {
    return '/productos';
  }
  return `/productos/stock-bajo?umbral=${encodeURIComponent(String(umbralTexto))}`;
}

// Conversión explícita: solo un entero decimal canónico se envía como número.
// Cualquier otro texto se envía tal cual para que el servidor lo rechace (400),
// de modo que la validación real siempre ocurre en la API.
export function prepararCuerpoProducto(nombre, stockTexto) {
  const texto = String(stockTexto).trim();
  const stock = ENTERO_CANONICO.test(texto) ? Number(texto) : texto;
  return { nombre: String(nombre), stock };
}

export function describirError(datos, estado) {
  if (datos && datos.error && datos.error.mensaje) {
    return `Error ${estado} (${datos.error.codigo}): ${datos.error.mensaje}`;
  }
  return `Error ${estado}: respuesta inesperada del servidor.`;
}
