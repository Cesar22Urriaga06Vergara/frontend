# Changelog de refactorizacion

## Cambios aplicados

- Agregado `@lucide/vue` y removido `@mdi/font`.
- `plugins/vuetify.ts`: nuevo set global de Lucide, alias para iconos MDI existentes y tema visual actualizado.
- `assets/styles/main.scss`: eliminado import de MDI.
- `assets/styles/design-system.scss`: radios mas consistentes, focus visible, sin letter spacing negativo.
- `nuxt.config.ts`: `apiBase` configurable con `NUXT_PUBLIC_API_BASE`.
- `src/main.ts`: CORS, Swagger y puerto parametrizados; validacion global endurecida.
- `src/app.module.ts`: `TYPEORM_SYNCHRONIZE` y `TYPEORM_LOGGING` por entorno.
- `.env.example`: variables corregidas y agregados parametros DANE IPC.
- `src/common/utils/money.util.ts`: utilidades para redondeo y porcentajes monetarios.
- `src/common/services/rate-adjustment.service.ts`: servicio para IPC parametrizable.
- `src/impuesto/impuesto.service.ts`: calculo tributario usa utilidad monetaria central.
- `src/pago/pago.service.ts`: pagos parciales dejan factura como `EMITIDA`, no `PAGADA`.
- `src/factura/factura.service.ts`: corregido filtro de morosidad y KPI de pendientes.
- `src/folio/dto/folio.dto.ts`: validaciones reforzadas.
- Limpieza visual de emojis en checkout, caja, servicios, configuracion y cancelacion de reserva.
- `scripts/validate-navigation-routes.mjs`: restaurado chequeo de rutas declarado en `package.json`.

## Validacion

- Backend build: aprobado.
- Frontend build: aprobado.
- Frontend `check:navigation`: aprobado, 49 rutas verificadas.
- Backend Jest: aprobado, 43 pruebas.
- Advertencias restantes: chunks frontend grandes, vulnerabilidades reportadas por `npm audit`, y deprecacion transitoria en dependencia de Nuxt/Vue durante build.
