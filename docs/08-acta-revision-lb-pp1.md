# Acta de revisión y aprobación de la línea base LB-PP1

| Campo | Valor |
|---|---|
| Fecha y hora | [AAAA-MM-DD hh:mm] |
| Lugar o medio | [Aula / videollamada] |
| Asistentes | [A] (rol), [B] (rol), [C] (rol), [docente, si participa] |
| Candidata | `main` @ `[sha]` · manifiesto `docs/07-manifiesto-lb-pp1.md` |

## 1. Comprobaciones

| N.º | Comprobación | Resultado | Evidencia |
|---|---|---|---|
| 1 | Los EC reales coinciden con el manifiesto (`git ls-tree`) | [Conforme/No conforme] | `evidencias/lb-pp1-arbol.txt` |
| 2 | `npm ci` y `npm test` desde carpeta limpia: 65/65 | [ ] | `evidencias/receptor-npm-test.log` |
| 3 | CI del push a main en verde; instala desde el bloqueo | [ ] | run `[id]` |
| 4 | Starter operativo antes del desarrollo (`/health` en 3001 y 3002) | [ ] | `evidencias/starter-*` |
| 5 | Commit 1 rojo por 404, commits 2 y 3 en verde | [ ] | logs por commit |
| 6 | Pull request feature → develop revisado por otra persona | [ ] | `#[n]` |
| 7 | Pull request develop → main revisado sobre el último SHA y fusionado con *merge commit*; develop conservada | [ ] | `#[n]` |
| 8 | Mismo artefacto (run_id, SHA, digest) en staging y después en producción | [ ] | ficha de promoción |
| 9 | Aceptación visible: Router 2, listado, umbral 3 incluye, umbral 1 excluye | [ ] | capturas |
| 10 | Rollback a la imagen anterior y restauración de la aprobada; límites de memoria declarados | [ ] | recibos de rollback |
| 11 | Sincronización main → develop | [ ] | `[PR/--ff-only]` |

## 2. Observaciones, pendientes y contingencias

[Registrar aquí cualquier límite. Ejemplo: «La demostración unipersonal del docente no tuvo revisor externo; se registra el límite y la decisión docente, sin afirmar una aprobación inexistente.»]

## 3. Decisión

☐ **Línea base LB-PP1 aprobada** sobre `[sha]`. Etiqueta de referencia: `lb-pp1`.
☐ Aprobada con observaciones: [...]
☐ No aprobada: [motivo y acciones]

| Nombre | Rol | Firma |
|---|---|---|
| [A] | | |
| [B] | | |
| [C] | | |
