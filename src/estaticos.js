// Entrega de la interfaz del inventario (RF-03). Lista blanca de archivos:
// no se sirve ninguna ruta del sistema de archivos fuera de public/.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const CARPETA_PUBLICA = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');

const ARCHIVOS = new Map([
  ['/', { archivo: 'index.html', tipo: 'text/html; charset=utf-8' }],
  ['/index.html', { archivo: 'index.html', tipo: 'text/html; charset=utf-8' }],
  ['/app.js', { archivo: 'app.js', tipo: 'text/javascript; charset=utf-8' }],
  ['/inventario-ui.js', { archivo: 'inventario-ui.js', tipo: 'text/javascript; charset=utf-8' }],
  ['/estilos.css', { archivo: 'estilos.css', tipo: 'text/css; charset=utf-8' }]
]);

export function esRutaEstatica(ruta) {
  return ARCHIVOS.has(ruta);
}

export async function servirEstatico(ruta, res) {
  const { archivo, tipo } = ARCHIVOS.get(ruta);
  const contenido = await readFile(path.join(CARPETA_PUBLICA, archivo));
  res.writeHead(200, {
    'Content-Type': tipo,
    'Content-Length': contenido.length,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(contenido);
}
