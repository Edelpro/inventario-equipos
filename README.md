# Inventario de equipos tecnológicos

API Node e interfaz web para crear, listar y consultar equipos con stock bajo. Práctica del primer parcial de gestión de la configuración del software (línea base LB-PP1, cambio CHG-001, GitHub Actions).

> **Límites del laboratorio:** almacenamiento volátil en memoria (reiniciar, desplegar o hacer rollback borra los registros); sin autenticación, precio, SKU, ventas ni persistencia; servicios publicados solo en `127.0.0.1`.

## Requisitos

- Node 22 o superior y npm 10 (la API no tiene dependencias externas).
- Para los entornos: VM Ubuntu 24.04 con Docker y runner autoalojado de GitHub Actions con etiqueta `laboratorio` (ver `docs/GUIA-PASO-A-PASO.md`).

## Instalar, probar e iniciar desde carpeta limpia

```bash
npm ci          # instala exactamente lo declarado en package-lock.json
npm test        # 65 pruebas (node:test)
npm start       # http://127.0.0.1:3000  (PORT, HOST, APP_REVISION, APP_ENTORNO en .env.example)
```

Ejemplo con variables: `PORT=3000 HOST=127.0.0.1 APP_REVISION=$(git rev-parse HEAD) APP_ENTORNO=local npm start`.

## Uso rápido

```bash
curl -s http://127.0.0.1:3000/health
curl -s -H 'Content-Type: application/json' -d '{"nombre":"Router","stock":2}' http://127.0.0.1:3000/productos
curl -s http://127.0.0.1:3000/productos
curl -s "http://127.0.0.1:3000/productos/stock-bajo?umbral=3"
```

Interfaz: `http://127.0.0.1:3000/` (umbral inicial 3).

## Entornos del laboratorio

| Entorno | URL en la VM | Cómo llega el código |
|---|---|---|
| staging | `http://127.0.0.1:3001` | Push a `develop` (automático) o workflow **Promocion** con el artefacto de `main` |
| producción del laboratorio | `http://127.0.0.1:3002` | Workflow **Promocion** con el mismo artefacto, después de staging |

Recuperación: `bash scripts/rollback.sh <staging|produccion>` (una segunda ejecución restaura la versión aprobada). El rollback de código no recupera datos en memoria.

## Estructura

```
src/            API (server, app, validacion, almacen, http, estaticos)
public/         interfaz (index.html, app.js, inventario-ui.js, estilos.css)
test/           65 pruebas: salud, RF-01/RF-02, RF-03, interfaz
scripts/        empaquetado, verificación de artefacto, promoción, aceptación, rollback, preparación de VM
.github/        workflows ci.yml y promocion.yml, plantilla de pull request
docs/           plan GCS, catálogo EC, ERS, diseño, matriz, CHG-001, LB-PP1, ficha, evidencias, guía
```

## Documentación de gestión de la configuración

| Documento | Archivo |
|---|---|
| Plan de GCS | `docs/01-plan-gcs.md` |
| Catálogo de elementos de configuración | `docs/02-catalogo-ec.md` |
| ERS RF-01/RF-02/RF-03 | `docs/03-ers.md` |
| Diseño y contrato | `docs/04-diseno-contrato.md` |
| Matriz RF–prueba–resultado | `docs/05-matriz-rf-prueba-resultado.md` |
| Expediente CHG-001 | `docs/06-chg-001.md` |
| Manifiesto y acta LB-PP1 | `docs/07-manifiesto-lb-pp1.md`, `docs/08-acta-revision-lb-pp1.md` |
| Ficha de promoción y registro de evidencias | `docs/09-ficha-promocion.md`, `docs/10-registro-evidencias.md` |
| Declaración individual y guion de demostración | `docs/11-declaracion-aporte-individual.md`, `docs/12-guion-demostracion.md` |
| Guía paso a paso | `docs/GUIA-PASO-A-PASO.md` |

Fuera del alcance de esta entrega: Jenkins y el módulo independiente `inventario-maven` (segundo parcial).
