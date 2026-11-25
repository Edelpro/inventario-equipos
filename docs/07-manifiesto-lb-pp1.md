# Manifiesto de la línea base LB-PP1

Identificador: EC-LB-01 · Estado: [Propuesta → Revisada → Aprobada]

> El manifiesto identifica la candidata por **commit y manifiesto**. Una etiqueta (por ejemplo `lb-pp1`) es solo una referencia; la aprobación consta en el acta.

## 1. Identificación de la candidata

| Campo | Valor |
|---|---|
| Repositorio | `https://github.com/[usuario]/inventario-equipos` |
| Rama | `main` |
| Commit de fusión develop → main | `[sha completo]` |
| Pull request | `#[n]` |
| Run CI (push a main) | `[run_id]` · conclusión `success` |
| Artefacto | `imagen-[sha]` |
| Digest canónico (`image-id.txt`) | `sha256:[...]` |
| Suma sha256 de `imagen.tar.gz` | `[...]` |
| Etiqueta Git de referencia | `lb-pp1` → `[sha]` |
| Node / npm en CI | `[v22.x]` / `[10.x]` |

## 2. Elementos incluidos

Generar la lista real con el comando del apartado 3 y pegarla aquí. Debe coincidir con `02-catalogo-ec.md`.

| EC | Ruta | Hash del blob en Git |
|---|---|---|
| EC-SRC-01 | `src/server.js` | `[...]` |
| EC-SRC-02 | `src/app.js` | `[...]` |
| … | … | … |

## 3. Comandos de generación y comparación

```bash
git checkout <sha-main>
git ls-tree -r HEAD --format='%(objectname) %(path)' > ~/evidencias-pp1/lb-pp1-arbol.txt
sha256sum package.json package-lock.json >> ~/evidencias-pp1/lb-pp1-arbol.txt
# Diferencias entre la línea base y la copia entregada (solo deben aparecer documentos de cierre):
git diff --stat <sha-main> HEAD
```

## 4. Exclusiones

`node_modules/`, caches, `.env`, secretos, `artefacto/` y archivos de imagen. La imagen se referencia por `run_id`, SHA y digest; no se versiona.

## 5. Pendientes y contingencias visibles

| Elemento | Estado | Clase de evidencia | Observación |
|---|---|---|---|
| [p. ej. revisión externa del PR de clase] | [pendiente/realizado] | [real/suministrada/simulada] | [...] |
