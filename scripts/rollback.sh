#!/usr/bin/env bash
# Recuperación de código: vuelve a ejecutar la imagen anterior registrada del entorno.
# Intercambia actual.env y anterior.env; una segunda ejecución restaura la versión aprobada.
# Límite: el rollback de código NO restaura los registros en memoria ni deshace cambios de datos.
# Uso: scripts/rollback.sh <staging|produccion>
set -euo pipefail

ENTORNO="${1:?Falta el entorno: staging | produccion}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
ESTADO_DIR="${ESTADO_DIR:-$HOME/inventario-estado}"
ESTADO="${ESTADO_DIR}/${ENTORNO}"
RECIBOS="${ESTADO_DIR}/recibos"

case "${ENTORNO}" in
  staging)    PUERTO=3001 ;;
  produccion) PUERTO=3002 ;;
  *) echo "ERROR: entorno desconocido ${ENTORNO}" >&2; exit 1 ;;
esac
CONTENEDOR="inventario-${ENTORNO}"

[[ -f "${ESTADO}/anterior.env" ]] || { echo "ERROR: no hay versión anterior registrada en ${ENTORNO}" >&2; exit 1; }

( . "${ESTADO}/actual.env"; echo "Versión actual:   ${SHA} (${RUNTIME_IMAGE_ID})" )
( . "${ESTADO}/anterior.env"; echo "Versión destino:  ${SHA} (${RUNTIME_IMAGE_ID})" )

REGISTROS_ANTES="$(curl -fsS "http://127.0.0.1:${PUERTO}/productos" 2>/dev/null \
  | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))' 2>/dev/null || echo 'no-disponible')"

# shellcheck disable=SC1091
. "${ESTADO}/anterior.env"
docker image inspect "${ETIQUETA}" >/dev/null || { echo "ERROR: la imagen ${ETIQUETA} ya no existe localmente" >&2; exit 1; }

docker rm -f "${CONTENEDOR}" >/dev/null 2>&1 || true
docker run -d --name "${CONTENEDOR}" --restart unless-stopped \
  -p "127.0.0.1:${PUERTO}:3000" -e "APP_ENTORNO=${ENTORNO}" \
  --label "laboratorio.entorno=${ENTORNO}" "${ETIQUETA}" >/dev/null

for _ in $(seq 1 30); do
  curl -fsS "http://127.0.0.1:${PUERTO}/health" >/dev/null 2>&1 && break
  sleep 1
done

REVISION="$(curl -fsS "http://127.0.0.1:${PUERTO}/health" | python3 -c 'import json,sys; print(json.load(sys.stdin)["revision"])')"
REGISTROS_DESPUES="$(curl -fsS "http://127.0.0.1:${PUERTO}/productos" 2>/dev/null \
  | python3 -c 'import json,sys; print(len(json.load(sys.stdin)))' 2>/dev/null || echo 'no-disponible')"

if [[ "${REVISION}" != "${SHA}" ]]; then
  echo "ERROR: /health informa ${REVISION} y se esperaba ${SHA}" >&2
  exit 1
fi

mv "${ESTADO}/actual.env" "${ESTADO}/intercambio.env"
mv "${ESTADO}/anterior.env" "${ESTADO}/actual.env"
mv "${ESTADO}/intercambio.env" "${ESTADO}/anterior.env"

mkdir -p "${RECIBOS}"
RECIBO="${RECIBOS}/${ENTORNO}-rollback-$(date -u +%Y%m%dT%H%M%SZ)-${SHA:0:7}.json"
cat > "${RECIBO}" <<JSON
{
  "operacion": "rollback_codigo",
  "entorno": "${ENTORNO}",
  "sha_en_ejecucion": "${SHA}",
  "runtime_image_id": "${RUNTIME_IMAGE_ID}",
  "health_revision": "${REVISION}",
  "registros_antes": "${REGISTROS_ANTES}",
  "registros_despues": "${REGISTROS_DESPUES}",
  "fecha_utc": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "limite": "El rollback de código no recupera los registros en memoria del proceso sustituido."
}
JSON
cat "${RECIBO}"
mkdir -p recibos && cp "${RECIBO}" recibos/ 2>/dev/null || true
echo "Rollback completado. Ejecute de nuevo scripts/rollback.sh ${ENTORNO} para restaurar la versión aprobada."
