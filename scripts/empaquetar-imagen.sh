#!/usr/bin/env bash
# Construye la imagen una sola vez y la empaqueta como artefacto identificado.
# Uso: scripts/empaquetar-imagen.sh <sha> <run_id> [directorio_salida]
# Salida: imagen.tar.gz, imagen.tar.gz.sha256, image-id.txt, manifiesto-artefacto.json
set -euo pipefail

SHA="${1:?Falta el SHA del commit}"
RUN_ID="${2:?Falta el run_id de GitHub Actions}"
SALIDA="${3:-artefacto}"
ETIQUETA="inventario-equipos:${SHA}"

mkdir -p "${SALIDA}"

docker build --pull --build-arg "APP_REVISION=${SHA}" -t "${ETIQUETA}" .

# Exportación reproducible del contenido construido.
docker save "${ETIQUETA}" | gzip -n > "${SALIDA}/imagen.tar.gz"
( cd "${SALIDA}" && sha256sum imagen.tar.gz > imagen.tar.gz.sha256 )

# Digest canónico = digest de la configuración de la imagen, leído del propio archivo exportado
# (manifest.json). Es independiente del almacén de imágenes de Docker del equipo que lo cargue.
CANONICO="$(bash "$(dirname "$0")/digest-config.sh" "${SALIDA}/imagen.tar.gz")"
echo "${CANONICO}" > "${SALIDA}/image-id.txt"

ID_LOCAL_CI="$(docker image inspect --format '{{.Id}}' "${ETIQUETA}")"

cat > "${SALIDA}/manifiesto-artefacto.json" <<JSON
{
  "aplicacion": "inventario-equipos",
  "sha": "${SHA}",
  "run_id": "${RUN_ID}",
  "ref": "${GITHUB_REF:-local}",
  "etiqueta": "${ETIQUETA}",
  "image_id_canonico": "${CANONICO}",
  "image_id_local_ci": "${ID_LOCAL_CI}",
  "sha256_archivo": "$(cut -d' ' -f1 "${SALIDA}/imagen.tar.gz.sha256")",
  "imagen_base": "node:22-alpine",
  "node_ci": "$(node --version 2>/dev/null || echo no-disponible)",
  "fecha_utc": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
JSON

echo "Artefacto listo en ${SALIDA}:"
cat "${SALIDA}/manifiesto-artefacto.json"
