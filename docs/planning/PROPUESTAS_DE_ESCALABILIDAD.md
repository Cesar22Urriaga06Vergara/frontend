# Propuestas de escalabilidad

## Multi-hotel y aislamiento

El modelo ya usa `idHotel` en entidades clave, pero se debe reforzar:

- Guard global de scope por hotel en todos los endpoints sensibles.
- Indices compuestos por `idHotel`, fecha y estado.
- Validaciones de pertenencia en reservas, habitaciones, facturas, pagos y servicios.
- Pruebas automatizadas de aislamiento entre hoteles.

## Concurrencia hotelera

Riesgos actuales:

- Dos usuarios pueden intentar reservar la misma habitacion si no hay bloqueo transaccional.
- Check-in/check-out y cobro pueden ejecutarse casi simultaneamente sin locks de negocio.
- Numero de factura secuencial basado en ultimo ID no es suficiente para facturacion fiscal concurrente.

Propuestas:

- Locks transaccionales para disponibilidad.
- Tabla de holds temporales de habitacion.
- Secuencias por hotel/prefijo para facturas.
- Idempotency keys para pagos, checkout y emision.
- Estados finitos con transiciones validadas en backend.

## Datos historicos y auditoria

Agregar:

- Auditoria uniforme para reservas, caja, pagos, facturas, descuentos, anulaciones y cambios de habitacion.
- Soft delete consistente y filtros por defecto.
- Historial de precios/tarifas aplicado a cada reserva.
- Snapshot fiscal de hotel/cliente al emitir factura.

## Rendimiento

Prioridades:

- Paginacion server-side en tablas grandes.
- Indices por fecha/estado/hotel.
- Agregaciones materializadas para reportes diarios.
- Cache controlada para catalogos: tipos habitacion, servicios, medios de pago.
- Jobs asincronos para PDFs, DIAN, emails y backups.

## Modularidad futura

Separar dominios:

- PMS core: reservas, habitaciones, huespedes, estadias.
- Caja: turnos, movimientos, arqueos.
- Facturacion: facturas, notas, DIAN, POS/PDF.
- Operaciones: housekeeping, mantenimiento, incidencias.
- Comercial: tarifas, temporadas, canales, promociones.
- BI: reportes, KPIs, exportaciones.

## Seguridad y permisos

- Crear matriz RBAC/ABAC por accion y hotel.
- Roles explicitos: `cajero`, `supervisor`, `housekeeping`.
- Permisos granulares: `caja:abrir`, `caja:cerrar`, `pago:reversar`, `factura:reimprimir`, `descuento:aprobar`.
- Auditoria de intentos denegados.
- Remover logs de datos sensibles en produccion.
