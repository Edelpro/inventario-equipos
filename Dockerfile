# Imagen del inventario de equipos tecnológicos.
# La revisión (SHA del commit) se fija en la construcción y no cambia entre entornos:
# staging y producción ejecutan la misma imagen; solo cambian APP_ENTORNO y el puerto publicado.
FROM node:22-alpine

ARG APP_REVISION=desconocida
ENV NODE_ENV=production \
    APP_REVISION=${APP_REVISION} \
    PORT=3000 \
    HOST=0.0.0.0

LABEL org.opencontainers.image.title="inventario-equipos" \
      org.opencontainers.image.revision="${APP_REVISION}" \
      org.opencontainers.image.description="API e interfaz del inventario de equipos tecnológicos (laboratorio)"

WORKDIR /app

# Instalación reproducible desde el bloqueo (package-lock.json).
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY src ./src
COPY public ./public

USER node
EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health > /dev/null || exit 1

CMD ["node", "src/server.js"]
