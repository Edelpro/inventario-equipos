# Registro de evidencias

Cada evidencia se clasifica como **real** (ejecutada por el equipo en su entorno), **suministrada** (proporcionada por el docente como contingencia para la misma comprobación), **simulada** (ensayo fuera del entorno oficial) o **pendiente**. Una indisponibilidad del laboratorio no se presenta como éxito.

| N.º | Evidencia | Archivo en `evidencias/` | Origen (commit / run / PR) | Clase | Responsable |
|---|---|---|---|---|---|
| E01 | Versiones de herramientas en la VM | `vm-versiones.txt` | — | [ ] | [ ] |
| E02 | Runner autoalojado en línea (captura) | `runner-online.png` | — | [ ] | [ ] |
| E03 | CI verde del starter | `starter-ci.png` | run [ ] | [ ] | [ ] |
| E04 | `/health` del starter en 3001 y 3002 | `starter-health.txt` | SHA [ ] | [ ] | [ ] |
| E05 | Commit 1 en rojo (404) | `commit1-rojo.log` | SHA [ ] | [ ] | [ ] |
| E06 | Commit 2 en verde (63) | `commit2-verde.log` | SHA [ ] | [ ] | [ ] |
| E07 | Commit 3 en verde (65) | `commit3-verde.log` | SHA [ ] | [ ] | [ ] |
| E08 | Diffs de los tres commits | `diff-commit1.patch`, `diff-commit2.patch`, `diff-commit3.patch` | — | [ ] | [ ] |
| E09 | PR feature → develop con revisión | `pr-feature-develop.png` | PR [ ] | [ ] | [ ] |
| E10 | CI de develop y staging automático | `develop-staging.png` | run [ ] | [ ] | [ ] |
| E11 | PR develop → main, último SHA revisado, *merge commit* | `pr-develop-main.png` | PR [ ] | [ ] | [ ] |
| E12 | Recibos de promoción staging y producción | `recibos/*.json` | runs [ ] | [ ] | [ ] |
| E13 | Capturas de la interfaz: Router 2, umbral 3, umbral 1 | `ui-*.png` | — | [ ] | [ ] |
| E14 | Recibos de rollback y restauración | `recibos/*rollback*.json` | — | [ ] | [ ] |
| E15 | Sincronización main → develop | `sync-main-develop.txt` | [ ] | [ ] | [ ] |
| E16 | Ejecución del receptor desde carpeta limpia | `receptor-npm-test.log` | — | [ ] | [ ] |
| E17 | Árbol de la línea base | `lb-pp1-arbol.txt` | SHA [ ] | [ ] | [ ] |

## Evidencia de referencia del paquete

La carpeta `referencia-preparacion/` del paquete (fuera del repositorio) contiene los registros de comprobación previos a la entrega al equipo: pruebas de cada etapa y una simulación local de promoción y rollback con SHA ficticios. **Clase: simulada.** No sustituye ninguna evidencia real de la tabla anterior y no debe adjuntarse como evidencia propia.
