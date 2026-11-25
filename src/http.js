// Utilidades HTTP compartidas: respuestas JSON, errores documentados y lectura del cuerpo.

export const LIMITE_CUERPO_BYTES = 16 * 1024;

export function responderJson(res, estado, datos, cabecerasExtra = {}) {
  const cuerpo = JSON.stringify(datos);
  res.writeHead(estado, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(cuerpo),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...cabecerasExtra
  });
  res.end(cuerpo);
}

export function responderError(res, estado, codigo, mensaje, campo = null, cabecerasExtra = {}) {
  responderJson(res, estado, { error: { codigo, mensaje, campo } }, cabecerasExtra);
}

export class ErrorCuerpo extends Error {
  constructor(estado, codigo, mensaje) {
    super(mensaje);
    this.estado = estado;
    this.codigo = codigo;
  }
}

export async function leerCuerpoJson(req) {
  const tipo = String(req.headers['content-type'] ?? '').toLowerCase();
  if (!tipo.startsWith('application/json')) {
    throw new ErrorCuerpo(400, 'tipo_contenido_invalido', 'El cuerpo debe enviarse como application/json.');
  }

  const fragmentos = [];
  let total = 0;
  for await (const fragmento of req) {
    total += fragmento.length;
    if (total > LIMITE_CUERPO_BYTES) {
      throw new ErrorCuerpo(413, 'cuerpo_demasiado_grande', `El cuerpo supera ${LIMITE_CUERPO_BYTES} bytes.`);
    }
    fragmentos.push(fragmento);
  }

  const texto = Buffer.concat(fragmentos).toString('utf8');
  if (texto.trim() === '') {
    throw new ErrorCuerpo(400, 'json_invalido', 'El cuerpo está vacío.');
  }
  try {
    return JSON.parse(texto);
  } catch {
    throw new ErrorCuerpo(400, 'json_invalido', 'El cuerpo no es JSON válido.');
  }
}
