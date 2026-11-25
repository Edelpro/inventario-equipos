#!/usr/bin/env bash
# Verificación posterior al despliegue. La salud superficial no basta:
# además se comprueban operaciones críticas (RF-01, RF-02, RF-03 e interfaz).
# Uso: scripts/verificar-aceptacion.sh <url_base> <sha_esperado>
set -euo pipefail

# Nivel de aceptación del elemento de configuración en esta revisión:
#   salud    -> starter mínimo (solo /health)
#   api      -> RF-01, RF-02 y RF-03 de la API
#   completa -> API más interfaz
NIVEL_ACEPTACION="api"

BASE="${1:?Falta la URL base, por ejemplo http://127.0.0.1:3001}"
SHA="${2:?Falta el SHA esperado}"
FALLOS=0

comprobar() {
  local descripcion="$1" obtenido="$2" esperado="$3"
  if [[ "${obtenido}" == "${esperado}" ]]; then
    echo "  [OK]    ${descripcion}"
  else
    echo "  [FALLO] ${descripcion}: obtenido=${obtenido} esperado=${esperado}"
    FALLOS=$((FALLOS + 1))
  fi
}

json() { python3 -c "import json,sys; d=json.load(sys.stdin); print(eval(sys.argv[1]))" "$1"; }

echo "Aceptación (${NIVEL_ACEPTACION}) contra ${BASE}"

SALUD="$(curl -fsS "${BASE}/health")"
comprobar "/health estado" "$(echo "${SALUD}" | json 'd["estado"]')" "ok"
comprobar "/health revisión exacta" "$(echo "${SALUD}" | json 'd["revision"]')" "${SHA}"

if [[ "${NIVEL_ACEPTACION}" != "salud" ]]; then
  ANTES="$(curl -fsS "${BASE}/productos" | json 'len(d)')"

  CODIGO="$(curl -s -o /tmp/alta.json -w '%{http_code}' -H 'Content-Type: application/json' \
    -d '{"nombre":"Router","stock":2}' "${BASE}/productos")"
  comprobar "RF-01 alta Router/stock 2 -> 201" "${CODIGO}" "201"

  CODIGO="$(curl -s -o /dev/null -w '%{http_code}' -H 'Content-Type: application/json' \
    -d '{"nombre":"Router","stock":"2"}' "${BASE}/productos")"
  comprobar "RF-01 stock como texto -> 400" "${CODIGO}" "400"

  DESPUES="$(curl -fsS "${BASE}/productos" | json 'len(d)')"
  comprobar "RF-02 listado +1 tras alta y rechazo" "${DESPUES}" "$((ANTES + 1))"

  CON3="$(curl -fsS "${BASE}/productos/stock-bajo?umbral=3" | json '"Router" in [p["nombre"] for p in d]')"
  comprobar "RF-03 umbral 3 incluye Router" "${CON3}" "True"

  CON1="$(curl -fsS "${BASE}/productos/stock-bajo?umbral=1" | json '"Router" in [p["nombre"] for p in d]')"
  comprobar "RF-03 umbral 1 excluye Router" "${CON1}" "False"

  CODIGO="$(curl -s -o /dev/null -w '%{http_code}' "${BASE}/productos/stock-bajo?umbral=05")"
  comprobar "RF-03 umbral no canónico -> 400" "${CODIGO}" "400"
fi

if [[ "${NIVEL_ACEPTACION}" == "completa" ]]; then
  CODIGO="$(curl -s -o /tmp/interfaz.html -w '%{http_code}' "${BASE}/")"
  comprobar "Interfaz / -> 200" "${CODIGO}" "200"
  comprobar "Interfaz con umbral inicial 3" "$(grep -c 'id="umbral"[^>]*value="3"' /tmp/interfaz.html || true)" "1"
fi

if (( FALLOS > 0 )); then
  echo "Aceptación NO superada: ${FALLOS} fallo(s)."
  exit 1
fi
echo "Aceptación superada."
