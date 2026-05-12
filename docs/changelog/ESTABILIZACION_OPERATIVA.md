# ADUS Hospitality OS - Estabilizacion operativa

## Objetivo

Convertir el sistema en un PMS hotelero estable, coherente y operable sin llevarlo todavia a un ERP enterprise. La prioridad es que recepcion, caja, facturacion y administracion trabajen con datos consistentes.

## Cambios aplicados

| Area | Cambio | Resultado |
| --- | --- | --- |
| Reservas | La creacion transaccional ahora bloquea contra reservas `reservada` y `confirmada`. | Reduce el riesgo de doble reserva de la misma habitacion. |
| Reservas | La edicion de fechas valida solapamientos contra reservas activas de la misma habitacion. | Evita inconsistencias al modificar estancias. |
| Check-in | Al confirmar check-in se marca la habitacion como `ocupada`. | Habitaciones y estadias quedan sincronizadas. |
| Check-out | Al confirmar check-out se marca la habitacion como `limpieza`. | El flujo queda listo para housekeeping. |
| Facturacion | El calculo tributario separa IVA/INC incluido en el precio final. | Un precio de $30.000 se mantiene como total $30.000. |
| Hotel/POS | Se agrego configuracion dinamica de razon social, logo, resolucion, prefijo, pie de factura, moneda y formato POS. | Los tickets usan datos del hotel, no el nombre del software. |

## Riesgos que siguen abiertos

- La caja aun no tiene apertura/cierre/arquez formal.
- La maquina de estados de reservas conserva nombres heredados (`reservada`, `completada`) aunque el lenguaje operativo deseado sea pendiente/check-in/check-out/no-show.
- No hay generacion PDF backend real.
- No hay reporte de reimpresiones.
- Los KPIs de `common/services/kpis.service.ts` siguen siendo placeholders.

## Siguiente estabilizacion recomendada

1. Crear caja basica con turno, movimientos y cierre.
2. Normalizar estados de reserva manteniendo compatibilidad hacia atras.
3. Conectar ticket POS al checkout/caja, no solo al listado admin.
4. Implementar KPIs basicos reales.
5. Remover logs de depuracion en login/reservas/servicios.
