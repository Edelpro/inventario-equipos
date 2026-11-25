# Diseño y contrato HTTP

Identificador: EC-DIS-01 · Versión 1.1

## 1. Arquitectura

```
Navegador ── GET / , /app.js ──► src/estaticos.js (lista blanca de public/)
    │
    └── fetch JSON ──► src/app.js (enrutamiento)
                          ├── src/validacion.js  (reglas RF-01 y RF-03)
                          ├── src/almacen.js     (memoria volátil, por instancia)
                          └── src/http.js        (respuestas y errores)
src/server.js: lee PORT, HOST, APP_REVISION, APP_ENTORNO y arranca el proceso.
```

Sin dependencias externas: módulo `node:http`, pruebas con `node:test` y `fetch` nativo de Node 22. Esta decisión reduce la superficie de dependencias y simplifica el bloqueo; la gestión de dependencias de terceros se aborda en PP2 con Maven.

## 2. Contrato

| Método y ruta | Éxito | Errores |
|---|---|---|
| `GET /health` | 200 `{"estado":"ok","servicio":"inventario-equipos","revision":"<sha>","entorno":"<entorno>"}` | — |
| `POST /productos` | 201 `{"id":1,"nombre":"Router","stock":2}` | 400, 413 |
| `GET /productos` | 200 `[{"id":1,"nombre":"Router","stock":2}]` o `[]` | — |
| `GET /productos/stock-bajo?umbral=3` | 200 arreglo con `stock ≤ umbral` | 400 |
| `GET /`, `/index.html`, `/app.js`, `/inventario-ui.js`, `/estilos.css` | 200 interfaz | — |
| Método no admitido en ruta conocida | — | 405 con cabecera `Allow` |
| Ruta inexistente | — | 404 |

## 3. Formato de error

```json
{ "error": { "codigo": "stock_tipo_invalido", "mensaje": "El stock debe ser un número JSON, no texto ni otro tipo.", "campo": "stock" } }
```

| Código | HTTP | Causa |
|---|---|---|
| `tipo_contenido_invalido` | 400 | `Content-Type` distinto de `application/json` |
| `json_invalido` | 400 | Cuerpo vacío o JSON mal formado |
| `cuerpo_invalido` | 400 | El cuerpo no es un objeto (arreglo, `null`, número) |
| `campo_no_permitido` | 400 | Campo fuera del contrato (por ejemplo, `precio`) |
| `nombre_requerido` / `nombre_tipo_invalido` / `nombre_vacio` / `nombre_longitud_excedida` | 400 | Reglas de nombre |
| `stock_requerido` / `stock_tipo_invalido` / `stock_no_entero` / `stock_fuera_de_rango` | 400 | Reglas de stock |
| `parametro_no_permitido` / `umbral_repetido` / `umbral_formato_invalido` / `umbral_fuera_de_rango` | 400 | Reglas de umbral |
| `cuerpo_demasiado_grande` | 413 | Cuerpo mayor de 16 KiB |
| `metodo_no_permitido` | 405 | Método no admitido |
| `recurso_no_encontrado` | 404 | Ruta inexistente |
| `error_interno` | 500 | Excepción no prevista (se registra en consola) |

## 4. Interfaz

- Formulario «Crear equipo» (nombre, stock) → `POST /productos`; muestra el mensaje de éxito o el error del servidor.
- Listado con casilla «Solo stock bajo», campo «Umbral» (inicial **3**) y botón «Consultar».
- La lógica pura (`public/inventario-ui.js`) construye la ruta de consulta y el cuerpo; solo convierte a número un entero decimal canónico y envía cualquier otro texto tal cual, para que la API lo rechace.
- Las celdas se escriben con `textContent` para evitar inyección de HTML.

## 5. Despliegue

Una imagen por commit (`inventario-equipos:<sha>`, etiqueta OCI `org.opencontainers.image.revision`). El mismo artefacto se promueve a staging (`127.0.0.1:3001`) y después a producción del laboratorio (`127.0.0.1:3002`); solo cambia `APP_ENTORNO`. Detalle de identificadores en `09-ficha-promocion.md`.
