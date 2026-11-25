# Inventario de equipos tecnológicos

Práctica del primer parcial de gestión de la configuración del software (línea base LB-PP1, cambio CHG-001, GitHub Actions). Esta revisión está en desarrollo; el README completo se publica con la interfaz (commit 3 de CHG-001).

> **Límites del laboratorio:** almacenamiento volátil en memoria; sin autenticación ni persistencia; servicios publicados solo en `127.0.0.1`.

## Requisitos

Node 22 o superior y npm 10. Para los entornos: VM Ubuntu 24.04 con Docker y runner autoalojado con etiqueta `laboratorio` (ver `docs/GUIA-PASO-A-PASO.md`).

## Instalar, probar e iniciar desde carpeta limpia

```bash
npm ci
npm test
npm start      # http://127.0.0.1:3000/health  (variables en .env.example)
```

## Entornos

| Entorno | URL en la VM |
|---|---|
| staging | `http://127.0.0.1:3001/health` |
| producción del laboratorio | `http://127.0.0.1:3002/health` |

`/health` informa la revisión exacta (SHA) en ejecución; no equivale a aceptación funcional.

Documentación de gestión de la configuración en `docs/` (plan, catálogo de elementos de configuración, ERS, diseño y CHG-001).
