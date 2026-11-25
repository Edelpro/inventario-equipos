# Catálogo de elementos de configuración (EC)

Identificador: EC-DOC-02 · Versión 1.0 · Todas las rutas son relativas a la raíz del repositorio.

| Identificador | Tipo | Ruta | Descripción | Introducido en | Responsable |
|---|---|---|---|---|---|
| EC-REQ-01 | Requisitos | `docs/03-ers.md` | Especificación de requisitos RF-01, RF-02, RF-03 | Starter | Análisis |
| EC-DIS-01 | Diseño | `docs/04-diseno-contrato.md` | Arquitectura, contrato HTTP y catálogo de errores | Starter | Análisis |
| EC-DOC-01 | Plan | `docs/01-plan-gcs.md` | Plan de gestión de la configuración | Starter | Análisis |
| EC-DOC-02 | Catálogo | `docs/02-catalogo-ec.md` | Este catálogo | Starter | Análisis |
| EC-CHG-01 | Cambio | `docs/06-chg-001.md` | Expediente CHG-001 | Starter (registro) · Commit 3 (cierre) | Análisis |
| EC-SRC-01 | Fuente | `src/server.js` | Punto de entrada del proceso | Starter | Implementación |
| EC-SRC-02 | Fuente | `src/app.js` | Enrutamiento HTTP | Starter (solo `/health`) · Commit 2 · Commit 3 | Implementación |
| EC-SRC-03 | Fuente | `src/http.js` | Respuestas JSON, errores, lectura del cuerpo | Starter | Implementación |
| EC-SRC-04 | Fuente | `src/validacion.js` | Reglas de nombre, stock y umbral | Commit 2 | Implementación |
| EC-SRC-05 | Fuente | `src/almacen.js` | Almacén volátil en memoria | Commit 2 | Implementación |
| EC-SRC-06 | Fuente | `src/estaticos.js` | Entrega de la interfaz (lista blanca) | Commit 3 | Implementación |
| EC-UI-01 | Interfaz | `public/index.html`, `public/estilos.css` | Página del inventario | Commit 3 | Implementación |
| EC-UI-02 | Interfaz | `public/app.js`, `public/inventario-ui.js` | Comportamiento y lógica pura de la interfaz | Commit 3 | Implementación |
| EC-TST-01 | Prueba | `test/health.test.js` | Salud del starter (2 pruebas) | Starter | Verificación |
| EC-TST-02 | Prueba | `test/productos.test.js` | RF-01, RF-02, rutas (44 pruebas) | Commit 1 | Verificación |
| EC-TST-03 | Prueba | `test/stock-bajo.test.js` | RF-03 API (17 pruebas) | Commit 1 | Verificación |
| EC-TST-04 | Prueba | `test/interfaz.test.js` | Interfaz y escenario de aceptación (2 pruebas) | Commit 3 | Verificación |
| EC-TST-05 | Prueba | `test/ayudante.js` | Ayudantes de prueba con estado aislado | Starter · Commit 1 | Verificación |
| EC-DEP-01 | Manifiesto | `package.json` | Metadatos, motor Node 22 y scripts | Starter | Configuración |
| EC-DEP-02 | Bloqueo | `package-lock.json` | Bloqueo de dependencias (sin dependencias externas) | Starter | Configuración |
| EC-CFG-01 | Configuración | `.env.example` | Variables sin valores sensibles | Starter | Configuración |
| EC-CFG-02 | Configuración | `.gitignore`, `.dockerignore` | Exclusiones (caches, `node_modules`, secretos) | Starter | Configuración |
| EC-CFG-03 | Construcción | `Dockerfile` | Imagen con revisión fija (`APP_REVISION`) | Starter | Configuración |
| EC-PIP-01 | Pipeline | `.github/workflows/ci.yml` | Pruebas, imagen, artefacto y staging de `develop` | Starter | Configuración |
| EC-PIP-02 | Pipeline | `.github/workflows/promocion.yml` | Promoción del artefacto de `main` | Starter | Configuración |
| EC-SCR-01 | Script | `scripts/empaquetar-imagen.sh`, `scripts/digest-config.sh` | Empaquetado e identificación del artefacto | Starter | Configuración |
| EC-SCR-02 | Script | `scripts/verificar-artefacto.sh` | Integridad y relación de identificadores | Starter | Configuración |
| EC-SCR-03 | Script | `scripts/promover.sh`, `scripts/rollback.sh` | Promoción y recuperación | Starter | Configuración |
| EC-SCR-04 | Script | `scripts/verificar-aceptacion.sh` | Aceptación posterior al despliegue (nivel salud → api → completa) | Starter · Commit 2 · Commit 3 | Verificación |
| EC-SCR-05 | Script | `scripts/preparar-vm.sh` | Preparación de la máquina virtual Ubuntu 24.04 | Starter | Configuración |
| EC-MAN-01 | Manual | `README.md`, `docs/GUIA-PASO-A-PASO.md` | Instalación, pruebas, inicio y procedimiento | Starter · Commit 3 | Configuración |
| EC-MAT-01 | Trazabilidad | `docs/05-matriz-rf-prueba-resultado.md` | Matriz RF–prueba–resultado | Commit 3 | Verificación |
| EC-LB-01 | Línea base | `docs/07-manifiesto-lb-pp1.md`, `docs/08-acta-revision-lb-pp1.md` | Manifiesto y acta LB-PP1 | Tras la promoción | Verificación |
| EC-EVI-01 | Evidencia | `docs/09-ficha-promocion.md`, `docs/10-registro-evidencias.md`, `evidencias/` | Ficha de promoción, recibos, logs y capturas | Tras la promoción | Verificación |

**Elementos excluidos de la configuración:** `node_modules/`, `.npm/`, caches, `artefacto/`, archivos `.tar`/`.tar.gz`, `.env` y cualquier secreto. Los artefactos de imagen viven en GitHub Actions (retención de 30 días) y se referencian por `run_id` y SHA.
