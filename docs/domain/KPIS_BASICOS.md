# KPIs basicos reales

## Actualizacion implementada

`common/services/kpis.service.ts` dejo de devolver placeholders en los flujos principales:

- Recepcion: check-ins pendientes, check-outs pendientes, check-ins realizados y check-outs realizados del dia.
- Caja recepcion: movimientos del dia, ingresos, egresos, saldo y turno abierto.
- Admin hotel: ocupacion actual, habitaciones por estado, reservas proximos 7 dias e ingresos del mes.
- Superadmin: hoteles activos, usuarios totales, ingresos totales y facturas emitidas.
- Crecimiento plataforma: hoteles nuevos, usuarios nuevos e ingresos por periodo.

Tambien se corrigio `servicios/stats/:idHotel` para calcular estadisticas por agregacion SQL y evitar fallos con `periodo=anio_actual`.
Refuerzo aplicado: la consulta de servicios usa nombres reales de columnas MySQL (`id_hotel`, `estado_pedido`, `total_pedido`, `fecha_pedido`) para evitar errores de resolucion en TypeORM.

## KPIs objetivo

- Habitaciones disponibles.
- Habitaciones ocupadas.
- Reservas activas.
- Ingresos del dia.
- Check-ins de hoy.
- Check-outs de hoy.

## Estado actual

El backend ya tiene KPIs basicos reales en `common/services/kpis.service.ts`. Algunos modulos mantienen estadisticas parciales propias (`reservas/stats`, `servicios/stats`, facturas/reportes), que pueden consolidarse gradualmente.

## Plan recomendado

1. Consumir los KPIs nuevos desde dashboards donde aun haya mocks.
2. Unificar nombres de campos.
3. Agregar pruebas de regresion para reportes.
4. Agregar pruebas con datos semilla.
