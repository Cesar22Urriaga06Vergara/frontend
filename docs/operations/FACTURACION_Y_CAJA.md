# Facturacion y caja

## Estado actual

Facturacion tiene entidades, estados, detalles, pagos, impuestos, historial, ticket POS base y PDF POS basico. Caja ya tiene apertura/cierre formal y movimientos por turno.

## Cambio financiero aplicado

El calculo de impuestos ahora trata los precios como finales con IVA/INC incluido. Esto evita duplicar IVA sobre tarifas visibles al cliente.

Ejemplo:

```text
Precio visible: 30.000
Base gravable: 25.210
IVA incluido 19%: 4.790
Total final: 30.000
```

## Integracion pagos-caja aplicada

- Registrar pagos de factura ahora exige caja abierta del hotel.
- Cada pago completado crea un `CajaMovimiento` con origen `FACTURA`.
- El turno actual recalcula `totalIngresos` y `totalEsperado`.
- Recepcionista y cajero quedan limitados al hotel asignado.
- Cajero puede registrar pagos y consultar pagos de factura.
- Devolver un pago ahora exige caja abierta y crea un `CajaMovimiento` de tipo `EGRESO` con origen `DEVOLUCION`.
- La devolucion recalcula `totalEgresos`, `totalEsperado` y el estado de la factura.
- `POST /pagos/mixto` registra varias lineas de pago en una sola transaccion.
- El pago mixto crea un movimiento de caja por linea y actualiza la factura una sola vez.
- `POST /folios/:idHabitacion/cobrar-mixto` permite cobrar folios con varias lineas/metodos.
- La UI de Caja ahora tiene pestanas para cobro simple y cobro mixto, con validacion de total exacto, referencia en medios no efectivo y calculo de cambio.

Impacto operativo: ya no es posible cobrar una factura por fuera de caja, que era un riesgo fuerte para arqueo y auditoria.

## Pendientes factura

- PDF backend POS basico.
- Reimpresion auditada.
- Notas credito/debito mas adelante.
- DIAN real queda fuera de esta fase por decision de alcance.

## Pendientes caja

- UI de reversos/anulaciones de pagos con motivo, referencia y autorizacion visible.
- Arqueo por denominacion.
- Totales por metodo de pago.
- Cierre con aprobacion de supervisor cuando hay diferencia.
- Reporte exportable de turno.
- Devoluciones parciales; por ahora se exige devolver el pago completo para no romper consistencia contable.
- Consolidar pago mixto de factura y folio bajo el mismo motor transaccional compartido.
