# Control transaccional

## Escenario critico

Dos recepcionistas intentan reservar la misma habitacion o tipo de habitacion al mismo tiempo.

## Medida implementada

`ReservaService.create` usa `QueryRunner` y bloqueo pesimista al seleccionar habitacion disponible. La condicion de conflicto ahora cubre reservas `reservada` y `confirmada`.

## Medidas actuales

- Transaccion en creacion de reserva.
- Transaccion en checkout.
- Validacion de solapamiento por fechas en edicion.
- Estados de habitacion sincronizados en check-in/check-out.

## Pendientes

- Usar transaccion tambien en edicion cuando cambien fechas/habitacion.
- Agregar `idempotencyKey` para pagos, checkout y facturacion.
- Formalizar locks o holds temporales para reservas iniciadas desde cliente.
- Evitar generar numeros de factura con ultimo ID en escenarios concurrentes.
