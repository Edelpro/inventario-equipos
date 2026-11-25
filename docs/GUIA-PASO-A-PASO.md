# Guía paso a paso · Primer parcial (LB-PP1)

Esta guía sigue el orden obligatorio de la consigna: **infraestructura mínima comprobada → tres avances de desarrollo → PR feature → develop y staging → PR develop → main con commit de fusión → mismo artefacto de main en staging y después en producción → sincronización main → develop** (sin eliminar `develop`).

Convenciones: `$` indica un comando en la terminal de la máquina virtual (VM); `[A]`, `[B]`, `[C]` son los integrantes. Las carpetas `etapas/0-starter … 3-interfaz-verde` del paquete contienen los archivos completos de cada avance.

---

## Paso 1 · Máquina virtual Ubuntu 24.04 (trabajo autónomo)

1. Crear una VM dedicada (VirtualBox o similar): 2 procesadores virtuales, 4 GB de RAM, 25 GB de disco, Ubuntu Server o Desktop 24.04.
2. Copiar el paquete a la VM y ejecutar:
   ```bash
   $ bash etapas/0-starter/scripts/preparar-vm.sh
   $ exit   # cerrar sesión y volver a entrar (grupo docker)
   $ mkdir -p ~/evidencias-pp1
   $ { git --version; docker --version; node --version; npm --version; } | tee ~/evidencias-pp1/vm-versiones.txt
   ```
3. **No** abrir puertos en el cortafuegos ni redirigir 3001/3002 hacia Internet: los contenedores escuchan solo en `127.0.0.1`.

## Paso 2 · Repositorio en GitHub

1. Crear el repositorio `inventario-equipos` (vacío, sin README). Añadir a los compañeros y al docente como colaboradores.
   *Nota:* en cuentas gratuitas, las reglas de protección de ramas y los revisores de entornos requieren repositorio **público**. El código no contiene secretos; si el repositorio debe ser privado, registrar el límite en el acta.
2. Configurar Git en la VM:
   ```bash
   $ git config --global user.name "Nombre Apellido"
   $ git config --global user.email "correo@ejemplo.com"
   $ git config --global init.defaultBranch main
   ```
3. Settings → General → desactivar **Automatically delete head branches** (para no borrar `develop`).

## Paso 3 · Runner autoalojado en la VM

1. Settings → Actions → Runners → **New self-hosted runner** → Linux x64. Ejecutar en la VM los comandos que muestra GitHub y, en `config.sh`, añadir la etiqueta:
   ```bash
   $ ./config.sh --url https://github.com/<usuario>/inventario-equipos --token <token-que-muestra-GitHub> --labels laboratorio
   $ sudo ./svc.sh install && sudo ./svc.sh start
   ```
2. Settings → Actions → General → *Fork pull request workflows*: **Require approval for all outside collaborators** (protege el runner; los workflows de este proyecto solo usan el runner en `push` a `develop` y en ejecuciones manuales).
3. Settings → Environments: crear `staging` y `produccion` (opcional: revisor obligatorio en `produccion`).
4. Captura del runner en estado *Idle* → `~/evidencias-pp1/runner-online.png`.

## Paso 4 · Starter mínimo comprobado ANTES de desarrollar

```bash
$ mkdir ~/inventario-equipos && cd ~/inventario-equipos
$ git init
$ rsync -a ../<ruta-del-paquete>/etapas/0-starter/ ./
$ npm ci && npm test            # 2 pruebas en verde
$ git add . && git commit -m "chore(starter): /health, CI, promoción, plan GCS, catálogo EC, ERS, diseño y registro CHG-001"
$ git remote add origin https://github.com/<usuario>/inventario-equipos.git
$ git push -u origin main
```

1. En Actions, esperar el run **CI** del push a `main` (pruebas + imagen). Anotar su `run_id` (número en la URL del run) y el SHA (`git rev-parse HEAD`).
2. Actions → **Promocion** → *Run workflow*: `run_id`, `sha`, entorno `staging`. Luego repetir con `produccion`.
3. Comprobar los dos entornos:
   ```bash
   $ curl -s 127.0.0.1:3001/health; echo; curl -s 127.0.0.1:3002/health; echo
   ```
   Ambos deben mostrar `"revision":"<sha del starter>"`. Guardar en `~/evidencias-pp1/starter-health.txt` y capturar el CI verde.
4. Crear `develop` y protegerla:
   ```bash
   $ git switch -c develop && git push -u origin develop   # despliega automáticamente en staging
   ```
   Settings → Branches → reglas para `main` y `develop`: *Require a pull request before merging* (en `main`, 1 aprobación), *Require status checks* → **Pruebas (npm ci + npm test)**.

> Este estado (starter en 3001 y 3002) queda como **versión anterior** para el rollback del paso 9.

## Paso 5 · Tres avances en `feature/registro-equipos`

La persona con rol de implementación ejecuta; las otras dos observan y revisan.

```bash
$ cd ~/inventario-equipos && git switch develop && git pull
$ git switch -c feature/registro-equipos
PAQ=../<ruta-del-paquete>/etapas
```

**Commit 1 · pruebas en rojo (404 intencional)**
```bash
$ rsync -a --delete --exclude .git --exclude node_modules $PAQ/1-pruebas-rojo/ ./
$ npm ci && npm test 2>&1 | tee ~/evidencias-pp1/commit1-rojo.log   # 63 pruebas: 60 fallan con 404, 3 pasan
$ git add -A && git commit -m "test(chg-001): pruebas RF-01..RF-03 en rojo con 404 intencional"
$ git show HEAD > ~/evidencias-pp1/diff-commit1.patch && git push -u origin feature/registro-equipos
```
El CI de la rama quedará en **rojo**: es la evidencia esperada; no se oculta ni se fuerza a verde.

**Commit 2 · API con 63 pruebas en verde**
```bash
$ rsync -a --delete --exclude .git --exclude node_modules $PAQ/2-api-verde/ ./
$ npm ci && npm test 2>&1 | tee ~/evidencias-pp1/commit2-verde.log   # 63/63
$ git add -A && git commit -m "feat(api): RF-01 crear, RF-02 listar y RF-03 stock bajo con validación sin coerción"
$ git show HEAD > ~/evidencias-pp1/diff-commit2.patch && git push
```

**Commit 3 · interfaz con 65 pruebas en verde**
```bash
$ rsync -a --delete --exclude .git --exclude node_modules $PAQ/3-interfaz-verde/ ./
$ npm ci && npm test 2>&1 | tee ~/evidencias-pp1/commit3-verde.log   # 65/65
$ git add -A && git commit -m "feat(ui): interfaz de inventario con filtro de stock bajo (umbral inicial 3)"
$ git show HEAD > ~/evidencias-pp1/diff-commit3.patch && git push
```

Antes de cada commit, revisar el diff (`git diff --stat`, `git status`): no deben aparecer `node_modules`, caches ni `.env`.

## Paso 6 · Pull request feature → develop y staging

1. Abrir el PR `feature/registro-equipos → develop` (la plantilla aparece sola). El autor puede comentar su diff; **otra persona** revisa y pulsa *Approve*.
2. Fusionar con **Create a merge commit** (no *Squash*: se perderían los tres commits incrementales).
3. El push a `develop` ejecuta CI y despliega en staging. Comprobar:
   ```bash
   $ curl -s 127.0.0.1:3001/health   # revision = SHA del merge en develop
   ```

## Paso 7 · Pull request develop → main

1. Abrir `develop → main`. El revisor confirma que revisa el **último SHA** (pestaña *Commits*) y que el CI de ese SHA está en verde.
2. Fusionar con **Create a merge commit**. **No** pulsar *Delete branch*.

## Paso 8 · Promoción del mismo artefacto: staging y después producción

1. Abrir el run **CI** del push a `main` (commit de fusión), comprobar que terminó en verde y anotar `run_id` y SHA completo.
2. Actions → **Promocion** → `run_id`, `sha`, `staging`. Al terminar, repetir con `produccion` (el script rechaza producción si staging no tiene ese mismo SHA).
3. Descargar los artefactos `recibo-*` y guardarlos en `~/evidencias-pp1/recibos/`. Comparar: mismo `run_id`, `sha`, `image_id`; `runtime_image_id` y `relacion_identificadores` registrados.
4. Aceptación visible en el navegador de la VM, `http://127.0.0.1:3002/` (y 3001): crear **Router / 2**, ver el listado, marcar **Solo stock bajo**, umbral **3** → *Consultar* (Router visible); umbral **1** → *Consultar* (Router excluido); stock «dos» → mensaje de error 400. Capturas `ui-*.png`.

## Paso 9 · Recuperación (rollback) y restauración

En la VM, con el mismo usuario del runner:
```bash
$ cd ~/inventario-equipos && git switch main && git pull
$ bash scripts/rollback.sh produccion   # vuelve al starter; /health muestra su SHA; los registros se pierden
$ bash scripts/rollback.sh produccion   # restaura la versión aprobada de main
$ bash scripts/verificar-aceptacion.sh http://127.0.0.1:3002 "$(git rev-parse HEAD)"
$ cp ~/inventario-estado/recibos/*rollback* ~/evidencias-pp1/recibos/
```
Registrar en la ficha que el rollback de código **no restaura memoria** (`registros_antes` → `registros_despues`).

## Paso 10 · Sincronización main → develop

```bash
$ git fetch origin && git switch develop && git pull
$ git diff --stat develop origin/main        # ¿hay diferencias de contenido?
$ git merge --ff-only origin/main            # si solo falta el commit de fusión
$ git push                                   # si la regla de develop lo rechaza, abrir PR main → develop
$ git log --oneline -3 | tee ~/evidencias-pp1/sync-main-develop.txt
```

## Paso 11 · Cierre de la línea base

1. Etiqueta de referencia: `git tag -a lb-pp1 <sha-main> -m "LB-PP1 candidata" && git push origin lb-pp1`.
2. Generar el árbol: `git ls-tree -r <sha-main> --format='%(objectname) %(path)' > ~/evidencias-pp1/lb-pp1-arbol.txt`.
3. Completar `docs/05` (columna CI), `06` (trazabilidad), `07` (manifiesto), `08` (acta), `09` (ficha) y `10` (evidencias) en una rama `docs/cierre-lb-pp1` → PR a `develop`.
4. Prueba del receptor desde carpeta limpia:
   ```bash
   $ rm -rf /tmp/receptor && git clone https://github.com/<usuario>/inventario-equipos /tmp/receptor
   $ cd /tmp/receptor && git checkout <sha-main> && npm ci && npm test 2>&1 | tee ~/evidencias-pp1/receptor-npm-test.log
   ```

## Paso 12 · ZIP individual

Cada integrante genera su copia completa y añade su declaración (`docs/11`):
```bash
$ cd ~/inventario-equipos && git switch develop && git pull
$ rm -rf ~/entrega && mkdir ~/entrega
$ git archive --format=tar --prefix=inventario-equipos/ HEAD | tar -x -C ~/entrega
$ cp -r ~/evidencias-pp1 ~/entrega/inventario-equipos/evidencias
$ cp ~/mi-declaracion.md ~/entrega/inventario-equipos/docs/11-declaracion-aporte-<apellido>.md
$ cd ~/entrega && zip -r ~/PP1-<apellido>.zip inventario-equipos
$ unzip -l ~/PP1-<apellido>.zip | grep -E "node_modules|\.env$" || echo "Sin node_modules ni .env"
```
`git archive` excluye `.git`, `node_modules` y todo lo ignorado. Adjuntar en Moodle el ZIP y, por el medio autorizado, el enlace al repositorio.

## Contingencias

- **Runner o VM no disponibles:** registrar la indisponibilidad como *pendiente*; si el docente entrega un entorno o evidencia de contingencia, rotularla como *suministrada*. Nunca presentarla como ejecución real propia.
- **Sin revisor externo** (demostración unipersonal): registrar el límite y la decisión docente en el PR y en el acta; no afirmar un *Approve* inexistente.
- **Artefacto vencido** (más de 30 días): no reconstruir para «recuperarlo»; volver a ejecutar CI sobre el mismo SHA y registrar el nuevo `run_id` como contingencia.
