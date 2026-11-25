#!/usr/bin/env bash
# Verifica la integridad del artefacto, lo carga en Docker y comprueba la relación entre
# el digest canónico (image-id.txt) y el identificador local que muestra Docker.
# No fuerza igualdad entre identificadores de naturaleza distinta: si difieren en formato,
# reexporta la imagen cargada y compara su digest de configuración con el canónico.
# Uso: scripts/verificar-artefacto.sh <directorio_artefacto> <sha_esperado>
# Escribe en stdout líneas clave=valor: ETIQUETA, IMAGE_ID, RUNTIME_IMAGE_ID, RELACION
set -euo pipefail

DIR="${1:?Falta el directorio del artefacto}"
SHA="${2:?Falta el SHA esperado}"
AQUI="$(cd "$(dirname "$0")" && pwd)"

for archivo in imagen.tar.gz imagen.tar.gz.sha256 image-id.txt manifiesto-artefacto.json; do
  [[ -f "${DIR}/${archivo}" ]] || { echo "ERROR: falta ${DIR}/${archivo}" >&2; exit 1; }
done

( cd "${DIR}" && sha256sum --check --quiet imagen.tar.gz.sha256 ) >&2 \
  || { echo "ERROR: la suma sha256 del archivo no coincide" >&2; exit 1; }

CANONICO="$(tr -d '[:space:]' < "${DIR}/image-id.txt")"
DEL_ARCHIVO="$(bash "${AQUI}/digest-config.sh" "${DIR}/imagen.tar.gz")"
if [[ "${CANONICO}" != "${DEL_ARCHIVO}" ]]; then
  echo "ERROR: image-id.txt (${CANONICO}) no corresponde al archivo (${DEL_ARCHIVO})" >&2
  exit 1
fi

SHA_MANIFIESTO="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["sha"])' "${DIR}/manifiesto-artefacto.json")"
if [[ "${SHA_MANIFIESTO}" != "${SHA}" ]]; then
  echo "ERROR: el manifiesto pertenece a ${SHA_MANIFIESTO} y se esperaba ${SHA}" >&2
  exit 1
fi

ETIQUETA="inventario-equipos:${SHA}"
gunzip -c "${DIR}/imagen.tar.gz" | docker load >&2

REVISION_ETIQUETA="$(docker image inspect --format '{{ index .Config.Labels "org.opencontainers.image.revision" }}' "${ETIQUETA}")"
if [[ "${REVISION_ETIQUETA}" != "${SHA}" ]]; then
  echo "ERROR: la etiqueta OCI de revisión es ${REVISION_ETIQUETA} y se esperaba ${SHA}" >&2
  exit 1
fi

RUNTIME_ID="$(docker image inspect --format '{{.Id}}' "${ETIQUETA}")"
if [[ "${RUNTIME_ID}" == "${CANONICO}" ]]; then
  RELACION="identico"
else
  TEMPORAL="$(mktemp --suffix=.tar)"
  trap 'rm -f "${TEMPORAL}"' EXIT
  docker save "${ETIQUETA}" -o "${TEMPORAL}"
  REEXPORTADO="$(bash "${AQUI}/digest-config.sh" "${TEMPORAL}")"
  if [[ "${REEXPORTADO}" != "${CANONICO}" ]]; then
    echo "ERROR: la imagen cargada (${REEXPORTADO}) no corresponde al artefacto (${CANONICO})" >&2
    exit 1
  fi
  RELACION="formato_distinto_config_verificada"
fi

echo "ETIQUETA=${ETIQUETA}"
echo "IMAGE_ID=${CANONICO}"
echo "RUNTIME_IMAGE_ID=${RUNTIME_ID}"
echo "RELACION=${RELACION}"
