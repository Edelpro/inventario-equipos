# Ficha de promoción · artefacto de `main` a staging y producción del laboratorio

Regla: se promueve **el mismo artefacto** del push exitoso a `main`, primero a staging y después a producción, sin reconstruir. `scripts/promover.sh` impide promover a producción un SHA que no esté aceptado en staging.

## 1. Identidad del artefacto (debe ser igual en ambas filas)

| Entorno | run_id CI | SHA | Artefacto | image_id (canónico) | runtime_image_id | Relación |
|---|---|---|---|---|---|---|
| staging (3001) | [ ] | [ ] | `imagen-[sha]` | `sha256:[ ]` | `sha256:[ ]` | [identico / formato_distinto_config_verificada] |
| producción (3002) | [ ] | [ ] | `imagen-[sha]` | `sha256:[ ]` | `sha256:[ ]` | [ ] |

**Sobre los identificadores.** `image-id.txt` contiene el digest de configuración leído del propio archivo exportado (`manifest.json`). Con el almacén de imágenes *containerd* (predeterminado en instalaciones recientes de Docker), `docker image inspect` muestra otro identificador (digest del manifiesto). No se fuerza su igualdad: `scripts/verificar-artefacto.sh` comprueba la suma sha256 del archivo, que `image-id.txt` corresponde al archivo, que la etiqueta OCI de revisión es el SHA y, si los formatos difieren, reexporta la imagen cargada y compara su digest de configuración con el canónico. El recibo conserva ambos valores.

## 2. Comprobaciones posteriores al despliegue

| Comprobación | staging | producción |
|---|---|---|
| `/health` → `estado: ok`, `revision` = SHA | [ ] | [ ] |
| RF-01 alta Router/stock 2 → 201 | [ ] | [ ] |
| RF-01 stock como texto → 400 y listado sin cambios | [ ] | [ ] |
| RF-03 umbral 3 incluye Router; umbral 1 lo excluye | [ ] | [ ] |
| Interfaz visible con umbral inicial 3 (captura) | [ ] | [ ] |

## 3. Recuperación

| Paso | Entorno | SHA en ejecución | `/health` | Registros antes → después | Recibo |
|---|---|---|---|---|---|
| Rollback a imagen anterior | producción | `[sha starter]` | [ ] | [n → 0] | [archivo] |
| Restauración de la aprobada | producción | `[sha main]` | [ ] | [0 → 0] | [archivo] |

**Límite declarado:** el rollback de código restaura la imagen, no los datos. Los registros en memoria del proceso sustituido se pierden; no se promete recuperarlos. Después de restaurar, repetir la aceptación (`bash scripts/verificar-aceptacion.sh http://127.0.0.1:3002 <sha>`).

## 4. Clase de evidencia

| Elemento | Real | Suministrada | Simulada | Pendiente |
|---|---|---|---|---|
| Promoción staging | ☐ | ☐ | ☐ | ☐ |
| Promoción producción | ☐ | ☐ | ☐ | ☐ |
| Rollback y restauración | ☐ | ☐ | ☐ | ☐ |
