# Diagnostico general - ADUS Hospitality OS

Fecha de revision: 2026-05-09

## Alcance

Se revisaron dos aplicaciones del workspace:

- Backend NestJS: `../backend`
- Frontend Nuxt 3/Vue/Vuetify: `./frontend`

## Hallazgos criticos

1. El backend tenia `TypeORM synchronize: true` en `src/app.module.ts`, riesgoso para datos productivos porque puede alterar esquema sin migracion revisada.
2. El backend tenia CORS y puerto hardcodeados en `src/main.ts`, reduciendo control por ambiente.
3. Existe un archivo `.env` local con credenciales reales de base de datos y Cloudinary. No aparece versionado por `git ls-files`, pero debe rotarse si fue compartido o expuesto.
4. La logica de pago parcial marcaba `estadoFactura = PAGADA`, lo que podia mostrar como pagada una factura con saldo pendiente.
5. La consulta de morosidad en factura usaba dos `.where()`, perdiendo el filtro de hotel.
6. El frontend dependia de MDI y emojis mezclados para iconografia, con carga de webfonts pesadas y semantica visual inconsistente.
7. El IPC no estaba parametrizado como regla de negocio reutilizable.

## Backend

La estructura general sigue el patron de NestJS por modulo: controladores, servicios, DTOs y entidades. La separacion existe, pero algunos servicios concentran demasiadas responsabilidades, especialmente `FacturaService`, `ServicioService` y `FolioService`.

Fortalezas:

- DTOs con `class-validator` en varios modulos.
- `ValidationPipe` global ya existia.
- Repositorios TypeORM con parametros enlazados en la mayoria de consultas.
- Modulos por dominio para reservas, facturas, pagos, folios y servicios.

Riesgos:

- Swagger quedaba siempre expuesto.
- Falta rate limiting global.
- Falta politica central de secretos y validacion estricta de configuracion.
- Algunas consultas SQL raw existen en reportes/facturacion; usan parametros, pero requieren auditoria continua.
- Hay deuda de encoding en varios comentarios/textos.
- El folio muestra subtotal y total sin impuestos; la factura calcula impuestos por `tax_rates`, pero el flujo visual puede confundir si caja muestra valores sin IVA/INC.

## Frontend

La estructura por paginas, layouts, stores y componentes compartidos es razonable. Hay componentes reutilizables importantes: `PageHeader`, `StatCard`, `EmptyState`, `SectionCard`, `StandardDataTable`, `AppWorkspaceLayout`.

Fortalezas:

- Uso consistente de stores/composables.
- Layouts por rol.
- Estados vacios y tarjetas de metricas ya existen.
- Build SPA estable.

Riesgos:

- Dependencia visual previa de `mdi-*` en todas las vistas.
- Bundle grande por Vuetify/Nuxt y falta de code splitting mas fino.
- Algunos textos/logs tienen caracteres corruptos por encoding.
- Formularios criticos necesitan mas ayuda contextual y errores orientados al usuario.
- Persistencia de auth en cliente debe revisarse frente a XSS y expiracion.

## Referencias externas

- Lucide Vue oficial: https://lucide.dev/guide/vue/getting-started
- DIAN, tarifa general IVA 19%: https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_8857_2025.htm
- DANE IPC informacion tecnica consultada: https://www.dane.gov.co/index.php/estadisticas-por-tema/precios-y-costos/indice-de-precios-al-consumidor-ipc/ipc-informacion-tecnica
# ADUS Hospitality OS - Actualizacion de estabilizacion

Esta revision separa formalmente el branding del software de los datos fiscales del hotel. ADUS Hospitality OS es la plataforma; facturas, tickets y documentos comerciales deben usar los datos configurados del hotel/sucursal.

Cambios aplicados en esta fase:

- Reserva transaccional protegida contra solapes en estados `reservada` y `confirmada`.
- Edicion de fechas con validacion de solapamiento.
- Check-in marca habitacion como `ocupada`.
- Check-out marca habitacion como `limpieza`.
- Calculo tributario ajustado a precios finales con IVA/INC incluido.
- Configuracion fiscal/POS dinamica en hotel.
- Ticket POS sin hardcode de "Hotel SENA 2026".
