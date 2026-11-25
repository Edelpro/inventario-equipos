# Guion de demostración (3–5 minutos, participan los tres)

| Tiempo | Quién | Qué se muestra | Qué se explica |
|---|---|---|---|
| 0:00–0:45 | [A] · análisis y configuración | Catálogo EC, CHG-001 y ramas `main`/`develop`/`feature` | Por qué el cambio se registró y decidió antes de programar; qué quedó fuera de alcance |
| 0:45–2:00 | [B] · implementación | Historial: commit 1 rojo (404) → commit 2 (63) → commit 3 (65) | **Caso válido:** Router/stock 2 → 201; nombre recortado; puntos de código Unicode |
| 2:00–3:15 | [C] · verificación | Interfaz en 3002: crear Router 2, «Solo stock bajo», umbral 3 incluye, umbral 1 excluye; stock «dos» → 400 | **Rechazo:** `stock_tipo_invalido` sin coerción; la interfaz no sustituye al servidor |
| 3:15–4:30 | [A] o [B] | Ficha de promoción: mismo run_id, SHA y digest en 3001 y 3002; rollback y restauración | **Decisión:** no reconstruir entre entornos; por qué `image_id` y `runtime_image_id` difieren; el rollback no recupera memoria |
| 4:30–5:00 | Los tres | Acta LB-PP1 | Pendientes y contingencias visibles |

Preguntas para ensayar: ¿por qué `"5"` se rechaza? ¿qué demuestra `/health` y qué no? ¿qué pasa con los datos tras un rollback? ¿por qué una etiqueta no es una aprobación? ¿cómo se sabe que staging y producción ejecutan lo mismo?
