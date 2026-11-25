// Punto de entrada del proceso. Variables documentadas en .env.example.
import http from 'node:http';
import { crearAplicacion } from './app.js';

const puerto = Number.parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';
const revision = process.env.APP_REVISION ?? 'desconocida';
const entorno = process.env.APP_ENTORNO ?? 'local';

const servidor = http.createServer(crearAplicacion({ revision, entorno }));

servidor.listen(puerto, host, () => {
  console.log(`[inventario] escuchando en ${host}:${puerto} · entorno=${entorno} · revision=${revision}`);
});

function detener(senal) {
  console.log(`[inventario] ${senal} recibido; cerrando servidor (los datos en memoria se pierden).`);
  servidor.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 5000).unref();
}

process.on('SIGTERM', () => detener('SIGTERM'));
process.on('SIGINT', () => detener('SIGINT'));
