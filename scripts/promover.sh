#!/usr/bin/env bash
# Promueve un artefacto ya construido y probado a un entorno del laboratorio, sin reconstruir.
# Regla: producción solo recibe el SHA que está aceptado en staging en ese momento.
# Uso: scripts/promover.sh <staging|produccion> <directorio_artefacto> <sha> <run_id>
# Variables opcionales: ESTADO_DIR (por defecto $HOME/inventario-estado)
set -euo pipefail

ENTORNO="${1:?Falta el entorno: staging | produccion}"
DIR="${2:?Falta el directorio del artefacto}"
SHA="${3:?Falta el SHA}"
RUN_ID="${4:?Falta el run_id}"
AQUI="$(cd "$(dirname "$0")" && pwd)"
ESTADO_DIR="${ESTADO_DIR:-$HOME/inventario-estado}"

case "${ENTORNO}" in
  staging)    PUERTO=3001 ;;
  produccion) PUERTO=3002 ;;
  *) echo "ERROR: entorno desconocido ${ENTORNO}" >&2; exit 1 ;;
esac

CONTENEDOR="inventario-${ENTORNO}"
ESTADO="${ESTADO_DIR}/${ENTORNO}"
RECIBOS="${ESTADO_DIR}/recibos"
mkdir -p "${ESTADO}" "${RECIBOS}"

if [[ "${ENTORNO}" == "produccion" ]]; then
  SHA_STAGING="$( [[ -f "${ESTADO_DIR}/staging/actual.env" ]] && . "${ESTADO_DIR}/staging/actual.env" && echo "${SHA:-}" || true )"
  if [[ "${SHA_STAGING}" != "${SHA}" ]]; then
    echo "ERROR: producción exige que ${SHA} esté aceptado primero en staging (staging tiene: ${SHA_STAGING:-nada})." >&2
    exit 1
  fi
fi

echo "== 1. Verificación del artefacto =="
RESULTADO="$(bash "${AQUI}/verificar-artefacto.sh" "${DIR}" "${SHA}")"
echo "${RESULTADO}"
eval "${RESULTADO}"   # ETIQUETA, IMAGE_ID, RUNTIME_IMAGE_ID, RELACION

echo "== 2. Registro de la versión anterior =="
if [[ -f "${ESTADO}/actual.env" ]]; then
  cp "${ESTADO}/actual.env" "${ESTADO}/anterior.env"
  cat "${ESTADO}/anterior.env"
else
  echo "Sin versión anterior registrada en ${ENTORNO}."
fi

echo "== 3. Sustitución del contenedor (los datos en memoria se pierden) =="
docker rm -f "${CONTENEDOR}" >/dev/null 2>&1 || true
docker run -d --name "${CONTENEDOR}" --restart unless-stopped \
  -p "127.0.0.1:${PUERTO}:3000" \
  -e "APP_ENTORNO=${ENTORNO}" \
  --label "laboratorio.entorno=${ENTORNO}" \
  "${ETIQUETA}" >/dev/null

for _ in $(seq 1 30); do
  curl -fsS "http://127.0.0.1:${PUERTO}/health" >/dev/null 2>&1 && break
  sleep 1
done

echo "== 4. Aceptación posterior al despliegue =="
RESULTADO_ACEPTACION="aprobada"
bash "${AQUI}/verificar-aceptacion.sh" "http://127.0.0.1:${PUERTO}" "${SHA}" || RESULTADO_ACEPTACION="rechazada"

cat > "${ESTADO}/actual.env" <<ENV
SHA=${SHA}
RUN_ID=${RUN_ID}
ETIQUETA=${ETIQUETA}
IMAGE_ID=${IMAGE_ID}
RUNTIME_IMAGE_ID=${RUNTIME_IMAGE_ID}
ENV

RECIBO="${RECIBOS}/${ENTORNO}-$(date -u +%Y%m%dT%H%M%SZ)-${SHA:0:7}.json"
cat > "${RECIBO}" <<JSON
{
  "operacion": "promocion",
  "entorno": "${ENTORNO}",
  "puerto": ${PUERTO},
  "sha": "${SHA}",
  "run_id": "${RUN_ID}",
  "etiqueta": "${ETIQUETA}",
  "image_id": "${IMAGE_ID}",
  "runtime_image_id": "${RUNTIME_IMAGE_ID}",
  "relacion_identificadores": "${RELACION}",
  "aceptacion": "${RESULTADO_ACEPTACION}",
  "host": "$(hostname)",
  "fecha_utc": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "nota": "Almacenamiento en memoria: la promoción no conserva registros del proceso anterior."
}
JSON
echo "Recibo: ${RECIBO}"
cat "${RECIBO}"
mkdir -p recibos && cp "${RECIBO}" recibos/ 2>/dev/null || true

if [[ "${RESULTADO_ACEPTACION}" != "aprobada" ]]; then
  echo "La aceptación falló. Ejecute scripts/rollback.sh ${ENTORNO} para volver a la versión anterior." >&2
  exit 1
fi
