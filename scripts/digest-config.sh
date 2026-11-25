#!/usr/bin/env bash
# Imprime el digest de configuración (sha256:...) contenido en un archivo de `docker save`.
# Admite el formato clásico ("<hex>.json") y el formato OCI ("blobs/sha256/<hex>").
# Uso: scripts/digest-config.sh <imagen.tar | imagen.tar.gz>
set -euo pipefail

ARCHIVO="${1:?Falta el archivo de imagen}"

if [[ "${ARCHIVO}" == *.gz ]]; then
  MANIFIESTO="$(tar -xzOf "${ARCHIVO}" manifest.json)"
else
  MANIFIESTO="$(tar -xOf "${ARCHIVO}" manifest.json)"
fi

python3 - "${MANIFIESTO}" <<'PY'
import json, re, sys
manifiesto = json.loads(sys.argv[1])
if len(manifiesto) != 1:
    sys.exit(f"Se esperaba una sola imagen en el archivo y hay {len(manifiesto)}")
config = manifiesto[0]["Config"]
coincidencia = re.search(r"([0-9a-f]{64})", config)
if not coincidencia:
    sys.exit(f"No se reconoce el campo Config: {config}")
print(f"sha256:{coincidencia.group(1)}")
PY
