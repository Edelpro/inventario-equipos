#!/usr/bin/env bash
# Preparación de la máquina virtual Ubuntu 24.04 dedicada al laboratorio.
# Ejecutar una sola vez con un usuario con sudo. Revise cada paso antes de ejecutarlo.
# No abre puertos hacia Internet: los contenedores se publican solo en 127.0.0.1.
set -euo pipefail

. /etc/os-release
if [[ "${ID}" != "ubuntu" || "${VERSION_ID}" != "24.04" ]]; then
  echo "AVISO: este script está pensado para Ubuntu 24.04 (detectado: ${PRETTY_NAME})."
fi

sudo apt-get update
sudo apt-get install -y ca-certificates curl git python3 jq unzip zip rsync

# Docker Engine desde el repositorio oficial de Docker
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

# El usuario que ejecutará el runner necesita usar Docker sin sudo
sudo usermod -aG docker "$USER"

# Node 22 para ejecutar npm ci / npm test localmente en la VM (opcional para el runner)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

mkdir -p "$HOME/inventario-estado/recibos"

echo
echo "Versiones instaladas:"
git --version; docker --version; node --version; npm --version; python3 --version
echo
echo "Cierre sesión y vuelva a entrar para aplicar el grupo docker."
echo "Después registre el runner autoalojado con la etiqueta 'laboratorio' (ver docs/GUIA-PASO-A-PASO.md, paso 3)."
