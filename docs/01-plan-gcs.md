# Plan de gestión de la configuración del software (GCS) · Inventario de equipos tecnológicos

| Campo | Valor |
|---|---|
| Identificador | EC-DOC-01 · PLAN-GCS |
| Versión | 1.0 |
| Alcance | Primer parcial (PP1): Unidad 1 y temas 2.1 identificación, 2.2 control de versiones y 2.3 control de cambios |
| Equipo | [Integrante A] · [Integrante B] · [Integrante C] |
| Repositorio | `https://github.com/[organizacion-o-usuario]/inventario-equipos` |

## 1. Propósito y proporcionalidad

Este plan establece cómo el equipo identifica, controla, registra y audita los elementos de configuración (EC) del inventario de equipos tecnológicos. Se adopta un plan proporcional al tamaño del producto: una API (interfaz de programación de aplicaciones) Node sin dependencias externas, una interfaz web estática, pruebas automatizadas, dos entornos de laboratorio y un único cambio funcional controlado (CHG-001). La proporcionalidad responde a la recomendación de ajustar el rigor de la gestión de la configuración al riesgo y a la complejidad del sistema (IEEE, 2012; Bourque y Fairley, 2014).

## 2. Roles y responsabilidades (rotación semanal)

| Semana | Análisis y configuración | Implementación | Verificación |
|---|---|---|---|
| 1 | [A] | [B] | [C] |
| 2 | [B] | [C] | [A] |
| 3 | [C] | [A] | [B] |

- **Análisis y configuración:** mantiene el catálogo de EC, el expediente CHG-001, las ramas, la protección de ramas y los entornos de GitHub.
- **Implementación:** escribe pruebas y código en `feature/registro-equipos` mediante commits incrementales.
- **Verificación:** revisa pull requests (solicitudes de integración), ejecuta `npm ci` y `npm test` en carpeta limpia, comprueba los pipelines y firma el acta.
- Los tres revisan el conjunto y deben poder explicarlo; nadie aprueba su propio pull request.

## 3. Identificación (tema 2.1)

- Cada EC tiene identificador `EC-<tipo>-<nn>`, ruta relativa en el repositorio y responsable (ver `02-catalogo-ec.md`).
- Cada versión candidata se identifica por **SHA (identificador criptográfico del commit) más manifiesto**; las etiquetas (`git tag`) son referencias auxiliares y no sustituyen la revisión ni la aprobación de una línea base.
- Cada imagen se identifica por el SHA de origen, el `run_id` de GitHub Actions, el digest canónico `image-id.txt` y la suma sha256 del archivo exportado.

## 4. Control de versiones (tema 2.2)

Modelo de ramas:

| Rama | Propósito | Protección |
|---|---|---|
| `main` | Línea base aprobada; solo recibe fusiones desde `develop` con *merge commit* | Pull request obligatorio, una aprobación de otra persona, CI en verde |
| `develop` | Integración y despliegue automático a staging; **no se elimina** | Pull request obligatorio, CI en verde |
| `feature/registro-equipos` | Desarrollo de CHG-001 en tres commits incrementales | Sin protección; se fusiona por pull request |

Convención de mensajes: `tipo(alcance): descripción` (por ejemplo, `test(rf): pruebas RF-01..RF-03 en rojo con 404 intencional`).

Se excluyen del repositorio `node_modules/`, caches, artefactos generados y secretos; las variables se documentan en `.env.example` sin valores sensibles.

## 5. Control de cambios (tema 2.3)

1. **Registro:** toda solicitud funcional o técnica se registra como expediente `CHG-nnn` antes de implementarse.
2. **Análisis:** se evalúa problema, impacto en EC, riesgos y pruebas previstas.
3. **Decisión:** el equipo aprueba, rechaza o difiere. No se exige aceptar toda solicitud; se documenta la justificación.
4. **Implementación y verificación:** en rama `feature/*`, con pruebas que fallan primero (rojo) y pasan después (verde).
5. **Cierre:** se registran commits, pull requests, run de CI, artefacto promovido y resultado. Se conserva la versión anterior y la evidencia.

## 6. Línea base LB-PP1

La línea base se declara aprobada solo después de comparar los EC reales con el manifiesto (`07-manifiesto-lb-pp1.md`) y registrar el acta (`08-acta-revision-lb-pp1.md`). Los pendientes y las contingencias quedan visibles en el acta.

## 7. Entornos de laboratorio

| Entorno | Puerto en la máquina virtual | Origen | Publicación |
|---|---|---|---|
| staging | 3001 | push a `develop` (automático) o promoción manual del artefacto de `main` | Solo `127.0.0.1` |
| producción del laboratorio | 3002 | promoción manual del mismo artefacto de `main`, después de staging | Solo `127.0.0.1` |

No se publica ningún servicio institucional en Internet. El almacenamiento es volátil: reiniciar, desplegar o hacer rollback no conserva registros.

## 8. Clasificación de evidencias

Toda evidencia se rotula como **real** (ejecutada por el equipo), **suministrada** (entregada por el docente como contingencia), **simulada** (ensayo fuera del entorno oficial) o **pendiente**. Una indisponibilidad del laboratorio nunca se presenta como éxito.

## Referencias

Bourque, P., y Fairley, R. E. (Eds.). (2014). *Guide to the software engineering body of knowledge (SWEBOK), version 3.0*. IEEE Computer Society.

Chacon, S., y Straub, B. (2014). *Pro Git* (2.ª ed.). Apress.

Humble, J., y Farley, D. (2010). *Continuous delivery: Reliable software releases through build, test, and deployment automation*. Addison-Wesley.

IEEE. (2012). *IEEE standard for configuration management in systems and software engineering* (IEEE Std 828-2012). Institute of Electrical and Electronics Engineers.

ISO/IEC/IEEE. (2017). *Systems and software engineering: Software life cycle processes* (ISO/IEC/IEEE 12207:2017). International Organization for Standardization.
