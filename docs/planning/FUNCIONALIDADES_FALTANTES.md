# Funcionalidades faltantes - ADUS Hospitality OS

## Resumen ejecutivo

El sistema ya tiene una base importante de PMS: reservas, habitaciones, clientes, check-in/check-out, folios, pagos, facturas, servicios por areas, incidencias, reportes y roles. Sin embargo, aun no esta listo como software hotelero de produccion porque varios procesos criticos estan incompletos, simulados o no tienen cierre operativo.

## Brechas criticas

| Area | Problema | Impacto | Severidad | Solucion propuesta | Estado |
| --- | --- | --- | --- | --- | --- |
| Caja | No existe modulo formal de apertura, cierre, arqueo, diferencias, reversos y anulaciones por turno/cajero. | No hay control real de efectivo ni auditoria diaria. | Critica | Crear entidades `cajas`, `turnos_caja`, `movimientos_caja`, `arqueos_caja`, `reversos_caja`. | Pendiente |
| Facturacion POS | No existia endpoint ni vista reusable para ticket termico 58/80 mm. | Recepcion no podia imprimir comprobantes rapidos. | Alta | Se agrego base `GET /facturas/:id/ticket-pos` y componente `FacturaPosTicket.vue`. | Base implementada |
| PDF/ESC-POS | No hay generacion PDF backend ni adaptador ESC/POS. | La impresion depende de `window.print()` y no de cola termica real. | Alta | Agregar servicio PDF y adaptador local/agent para impresoras termicas. | Pendiente |
| Reportes | `pages/admin/reportes.vue` conserva graficos pendientes y botones de exportacion sin flujo real. | Administracion no puede analizar ocupacion/ingresos profesionalmente. | Alta | Implementar datasets reales, graficas y exportacion Excel/PDF. | Pendiente |
| KPIs backend | `common/services/kpis.service.ts` retorna placeholders. | Dashboards de recepcion/admin/superadmin pueden mostrar datos irreales. | Alta | Conectar KPIs a reservas, facturas, pagos, habitaciones y servicios. | Pendiente |
| Roles cajero/supervisor | No existen roles explicitos `cajero` ni `supervisor`. | Permisos operativos quedan mezclados entre admin/recepcionista. | Alta | Agregar roles, permisos granulares y navegacion dedicada. | Pendiente |
| Housekeeping | Hay estados de habitacion e incidencias, pero no tablero completo de limpieza. | Supervisores no pueden coordinar salida-limpieza-disponibilidad. | Alta | Crear modulo housekeeping con tareas, responsables, tiempos y bloqueos. | Pendiente |
| Sobrecupos/reasignacion | No hay flujo robusto para overbooking, cambios de habitacion y bloqueo temporal. | Riesgo operativo en ocupacion alta. | Alta | Servicio de disponibilidad con locks y movimientos historicos de habitacion. | Pendiente |
| Auditoria visible | Backend tiene audit logs, pero no hay consola administrativa completa para revisarlos. | Acciones sensibles no son trazables por usuario desde UI. | Media | Vista admin/superadmin de auditoria con filtros y exportacion. | Pendiente |
| Configuracion tributaria/DIAN | Se calcula IVA/INC y se simula XML, pero no hay integracion DIAN real. | Facturacion electronica no seria valida legalmente. | Critica | Integrar proveedor DIAN, numeracion, CUFE/CUDE, resoluciones y validaciones. | Pendiente |

## Brechas por experiencia de usuario

| Vista/modulo | Hallazgo | Impacto | Solucion |
| --- | --- | --- | --- |
| `pages/admin/reportes.vue` | Botones `Descargar PDF` y `Exportar Excel` sin handler funcional; graficos como texto pendiente. | Confianza baja en analitica. | Conectar exportadores y componente de graficas real. |
| `pages/cliente/mis-facturas.vue` | Descarga de factura solo muestra mensaje pendiente. | Cliente no obtiene soporte documental. | Usar endpoint PDF cuando exista; temporalmente permitir impresion POS/HTML. |
| `pages/recepcionista/caja.vue` | Estadisticas marcadas como mock. | Caja no refleja operacion real. | Alimentar con backend de caja/folios/pagos. |
| `pages/superadmin/planes/index.vue` | Crear plan deshabilitado. | SaaS incompleto. | CRUD de planes, limites y asignacion a hoteles. |
| `pages/superadmin/configuracion/index.vue` | Feature flags sin persistencia real de creacion. | Configuracion no auditable. | Backend de parametros/flags por hotel/plataforma. |
| `stores/auth.ts`, `LoginForm.vue`, reservas | `console.log` de depuracion. | Riesgo de exponer datos y ruido en produccion. | Remover logs o protegerlos por entorno. |

## Funcionalidades hoteleras recomendadas

- Tarifas por temporada, canal, ocupacion, fin de semana y excepciones.
- Motor de disponibilidad con bloqueo temporal al reservar.
- Historial completo del huesped: reservas, no-shows, consumos, observaciones y preferencias.
- Gestion de acompanantes y documentos por estadia.
- Pagos parciales, pagos mixtos, abonos, anticipos, devoluciones y conciliacion.
- Control de caja por turno y usuario.
- Facturacion electronica DIAN real, facturas POS, notas credito/debito.
- Housekeeping: habitaciones sucias, limpias, inspeccionadas, bloqueadas, mantenimiento.
- Mantenimiento preventivo y correctivo con SLA.
- Inventario operativo: minibar, lenceria, amenities, insumos de limpieza.
- Reportes: ocupacion, ADR, RevPAR, ingresos por area, cartera, impuestos, productividad.
- Exportaciones Excel/PDF, backups, logs, alertas, notificaciones.
- Multi-hotel/multi-sede con aislamiento estricto de datos.
