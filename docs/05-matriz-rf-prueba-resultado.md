# Matriz de trazabilidad RF–prueba–resultado

Identificador: EC-MAT-01 · Versión 1.0

**Columnas de resultado.** «Referencia» es la ejecución de comprobación del paquete preparado (Node 22, `npm ci` + `npm test`, 65/65 en verde). No sustituye la ejecución del equipo: completen «CI (run_id)» con el run real de GitHub Actions del commit fusionado en `main` y marquen la clase de evidencia (real, suministrada, simulada o pendiente).

| Criterio | Archivo de prueba | Pruebas | Cantidad | Referencia | CI (run_id) |
|---|---|---|---|---|---|
| RNF-01 salud y revisión | `test/health.test.js` | responde 200 con estado ok; informa revisión exacta y entorno | 2 | Verde | [pendiente] |
| RF-01.1 alta 201 y trim | `test/productos.test.js` | crea y devuelve 201; elimina espacios externos; conserva internos; tildes y eñes; identificadores incrementales | 5 | Verde | [pendiente] |
| RF-01.2 fronteras y rechazos de stock | `test/productos.test.js` | stock 0; stock 2147483647; rechaza "5", "", -1, 1.5, 2147483648, booleano, nulo, arreglo, ausente | 11 | Verde | [pendiente] |
| RF-01.3 fronteras y rechazos de nombre | `test/productos.test.js` | 1 carácter; 100 ASCII; 100 puntos de código no ASCII; longitud tras trim; rechaza vacío, espacios, tabulaciones, 101 ASCII, 101 no ASCII, numérico, nulo, arreglo, ausente | 13 | Verde | [pendiente] |
| RF-01.4 error documentado sin alta | `test/productos.test.js` | JSON mal formado; cuerpo vacío; arreglo; null; campo `precio`; tipo de contenido; 413; formato `{codigo, mensaje, campo}` (cada rechazo verifica que el listado no cambia) | 8 | Verde | [pendiente] |
| RF-02.1 arreglo vacío | `test/productos.test.js` | devuelve 200 con arreglo vacío | 1 | Verde | [pendiente] |
| RF-02.2 estado tras alta y rechazo | `test/productos.test.js` | incluye tras alta; conserva tras rechazo; orden de registro | 3 | Verde | [pendiente] |
| RF-02.3 estado aislado | `test/productos.test.js` | cada instancia empieza con estado aislado | 1 | Verde | [pendiente] |
| Contrato de rutas | `test/productos.test.js` | 405 con `Allow`; 404 documentado | 2 | Verde | [pendiente] |
| RF-03.1 stock ≤ umbral | `test/stock-bajo.test.js` | predeterminado 5; incluye igual; excluye superior; umbral 0; umbral máximo; Router con 3; Router excluido con 1; arreglo vacío | 8 | Verde | [pendiente] |
| RF-03.2 rechazos de umbral | `test/stock-bajo.test.js` | excedente; negativo; decimal; `05`; `+5`; vacío; `abc`/`1e1`/espacio; repetido; parámetro ajeno | 9 | Verde | [pendiente] |
| RF-03.3 interfaz umbral 3 | `test/interfaz.test.js` | sirve página con formulario, filtro, umbral inicial 3 y scripts | 1 | Verde | [pendiente] |
| RF-03.3 y RF-03.4 escenario Router | `test/interfaz.test.js` | Router/stock 2 conservado con 3, excluido con 1; la API rechaza entrada inválida enviada por la interfaz | 1 | Verde | [pendiente] |
| RF-03.5 volatilidad | `scripts/rollback.sh` (recibo) | `registros_antes` y `registros_despues` en el recibo de rollback | — | Simulada | [pendiente en laboratorio] |
| **Total automatizado** | | | **65** | **65 verdes** | |

## Evolución por commit (rojo → verde)

| Commit en `feature/registro-equipos` | Pruebas | Resultado esperado | Causa |
|---|---|---|---|
| Starter (en `main`) | 2 | 2 verdes | Solo `/health` |
| 1 · pruebas | 63 | **60 rojas**, 3 verdes | Las rutas no existen: 404 intencional (pasan las 2 de salud y la de ruta inexistente) |
| 2 · API | 63 | 63 verdes | Implementación de RF-01, RF-02 y RF-03 en la API |
| 3 · interfaz | 65 | 65 verdes | Interfaz y 2 pruebas de aceptación de interfaz |

## Verificación manual en el entorno (ficha de promoción)

| Comprobación | staging 3001 | producción 3002 |
|---|---|---|
| `/health` con revisión = SHA de `main` | [ ] | [ ] |
| Crear Router/stock 2 desde la interfaz → aparece en el listado | [ ] | [ ] |
| «Solo stock bajo» + umbral 3 + «Consultar» → Router visible | [ ] | [ ] |
| Umbral 1 → Router excluido | [ ] | [ ] |
| Stock «dos» desde la interfaz → mensaje de error 400 del servidor | [ ] | [ ] |
