# Especificación de requisitos del software (ERS) · RF-01, RF-02, RF-03

Identificador: EC-REQ-01 · Versión 1.1

| Versión | Cambio | Origen |
|---|---|---|
| 1.0 | RF-01 crear y RF-02 listar | Línea de partida del curso |
| 1.1 | Se añade RF-03 (stock bajo e interfaz) y se precisan errores y salud | Decisión aprobada en CHG-001 |

## 1. Contexto

El equipo desarrolla un inventario de equipos tecnológicos para laboratorio: una API que permite crear, listar y consultar equipos con stock bajo, y una interfaz web que la consume. El almacenamiento es volátil y no existe autenticación.

**Fuera de alcance (no se simulan):** precio, SKU (código de referencia de inventario), ventas, inicio de sesión y persistencia.

## 2. Reglas de datos

| Campo | Regla |
|---|---|
| `nombre` | Cadena JSON. Se eliminan los espacios externos (`trim`). Después del recorte debe tener de 1 a 100 **puntos de código Unicode** (un emoji cuenta como 1). |
| `stock` | Número JSON entero de 0 a 2147483647, **sin coerción**: `"5"`, `true`, `null`, `1.5`, `-1` y `2147483648` se rechazan. |
| `umbral` | Parámetro de consulta en entero decimal canónico de 0 a 2147483647 (sin signo, sin ceros a la izquierda, sin espacios, sin decimales ni exponentes). Predeterminado de la API: 5. No puede repetirse. |
| Cuerpo | Objeto JSON con `Content-Type: application/json`, solo con `nombre` y `stock`, hasta 16 KiB. |

## 3. Requisitos funcionales

### RF-01 · Crear producto (`POST /productos`)

| Criterio | Descripción |
|---|---|
| RF-01.1 | Entrada válida → HTTP 201 con `{id, nombre, stock}`; el nombre se devuelve sin espacios externos. |
| RF-01.2 | Stock 0 y 2147483647 se aceptan; cadenas numéricas, negativos, decimales y excedentes se rechazan. |
| RF-01.3 | Nombre vacío o solo espacios, tipo incorrecto o más de 100 puntos de código se rechaza. |
| RF-01.4 | Una entrada inválida devuelve un error documentado (HTTP 400, o 413 por tamaño) y **no agrega ningún producto**. |

### RF-02 · Consultar productos (`GET /productos`)

| Criterio | Descripción |
|---|---|
| RF-02.1 | HTTP 200 con un arreglo, incluso vacío. |
| RF-02.2 | Tras un alta válida contiene el producto; tras un rechazo conserva el estado anterior. |
| RF-02.3 | Cada instancia de la aplicación empieza con estado aislado; el almacenamiento es volátil. |

### RF-03 · Consultar stock bajo e interfaz (`GET /productos/stock-bajo`, `/`)

| Criterio | Descripción |
|---|---|
| RF-03.1 | Devuelve los equipos con `stock ≤ umbral`; umbral predeterminado 5; HTTP 200 con arreglo. |
| RF-03.2 | Rechaza con HTTP 400 umbrales con formato inválido, fuera de rango, repetidos o parámetros fuera del contrato. |
| RF-03.3 | La interfaz parte con umbral 3. Al crear Router/stock 2 aparece en el listado; con «Solo stock bajo» activado y «Consultar», Router se conserva; con umbral 1 se excluye. |
| RF-03.4 | La interfaz no sustituye la validación del servidor: una entrada inválida enviada desde la interfaz recibe HTTP 400 de la API. |
| RF-03.5 | Reiniciar, desplegar o hacer rollback no conserva registros de otro proceso. |

## 4. Requisitos no funcionales

| Identificador | Requisito |
|---|---|
| RNF-01 | `/health` devuelve `{estado, servicio, revision, entorno}` con la revisión exacta (SHA) de la imagen en ejecución. La salud no equivale a aceptación funcional. |
| RNF-02 | Reproducibilidad: `npm ci` y `npm test` desde carpeta limpia con Node 22 producen el resultado declarado. |
| RNF-03 | Los servicios del laboratorio se publican solo en `127.0.0.1` (puertos 3001 y 3002). |
| RNF-04 | Sin dependencias de ejecución externas; bloqueo `package-lock.json` versionado. |

## 5. Decisiones de interpretación registradas

1. **`5.0` en JSON:** el analizador JSON entrega el número 5 (entero) y no conserva la notación; se acepta como 5. Rechazarlo exigiría analizar el texto crudo y se considera fuera del alcance de PP1.
2. **Campos adicionales:** se rechazan (`campo_no_permitido`) para no aparentar soporte de precio, SKU u otros atributos.
3. **Espacios Unicode:** `trim` elimina también espacios Unicode (por ejemplo, espacio de no separación).
