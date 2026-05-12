# Modulos incompletos

## Modulos visualmente presentes pero incompletos

| Modulo | Evidencia | Severidad | Accion requerida |
| --- | --- | --- | --- |
| Reportes admin | Textos de graficos pendientes y exportaciones sin implementacion. | Alta | Implementar datasets, graficas y exportadores. |
| Caja recepcionista | Turno basico implementado; descarga PDF placeholder. | Media | Agregar PDF real, reversos, arqueo por metodo/denominacion e historial detallado. |
| Facturas cliente | Descarga pendiente de implementacion. | Alta | Agregar PDF/HTML imprimible para cliente. |
| Superadmin planes | Boton crear plan deshabilitado. | Media | CRUD de planes y limites por hotel. |
| Superadmin configuracion | Crear feature flag cierra dialogo sin persistir. | Media | Endpoint y auditoria de parametros. |
| KPIs backend | KPIs basicos reales implementados; falta consumo completo en dashboards. | Media | Conectar pantallas restantes y agregar pruebas de regresion. |

## Modulos backend parciales

| Modulo | Estado actual | Faltante |
| --- | --- | --- |
| Factura | Estados, detalles, impuestos, pagos y XML simulado. | DIAN real, PDF, notas credito/debito, resoluciones, reimpresiones auditadas. |
| Pago | Registro de pagos y devolucion. | Reverso autorizado, pagos divididos UX y conciliacion por metodo. |
| Folio | Base de cargos/cobro, con movimiento de caja al cobrar. | Historial de cambios y autorizaciones. |
| Servicio | Catalogo, pedidos, estados y reportes por area. | SLA por area, stock/inventario, cobros automaticos con politicas. |
| Incidencia | Registro y seguimiento. | Priorizacion operacional, responsable, tiempos, tablero supervisor. |
| KPI | Controladores existen y devuelven datos reales basicos. | Pruebas, historicos y consolidacion visual. |

## Modulos ausentes para PMS real

- Caja y arqueo avanzado.
- Housekeeping dedicado.
- Inventario y compras.
- Mantenimiento preventivo.
- Tarifas dinamicas y temporadas.
- Politicas de cancelacion/no-show.
- Auditoria administrativa visible.
- Facturacion electronica DIAN real.
- Notificaciones operativas.
- Bitacora por turno.
- Bloqueos de habitacion con motivo y responsable.
- Calendario de ocupacion tipo rack hotelero.
- Multi-caja y multi-sede.

## Acciones de corto plazo

1. Madurar caja con reversos, anulaciones y arqueo por metodo.
2. Consumir KPIs reales desde dashboards donde aun existan mocks.
3. Conectar exportaciones de reportes.
4. Extender facturacion POS con PDF y registro de reimpresion.
5. Crear tablero housekeeping/supervisor.
# Actualizacion ADUS Hospitality OS

Se estabilizaron reservas/disponibilidad, estados de habitacion, calculo de IVA incluido, caja basica por turno y KPIs basicos reales. Siguen incompletos como prioridad: reversos/anulaciones de caja, PDF backend, reimpresiones auditadas, UI de configuracion fiscal del hotel y normalizacion completa de estados.
