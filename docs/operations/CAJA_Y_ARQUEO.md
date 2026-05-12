# Caja y arqueo

## Actualizacion implementada

Se agrego una caja operativa basica para ADUS Hospitality OS:

- Backend: nuevo modulo `caja` con turnos, movimientos y cierre.
- Endpoints: abrir turno, obtener turno actual, registrar movimiento, listar turnos y cerrar turno.
- Cobro de folio: ahora exige caja abierta y registra un movimiento de ingreso con origen `FOLIO`.
- Frontend: `/recepcionista/caja` muestra turno activo, base inicial, ingresos, egresos, esperado, movimientos recientes, apertura, movimiento manual y cierre.
- Rol `cajero`: agregado en frontend y autorizado en backend para caja/folios.
- Pagos de factura: ahora exigen turno de caja abierto y registran movimiento `INGRESO` con origen `FACTURA`.
- Devoluciones de pagos de factura: ahora exigen turno abierto y registran movimiento `EGRESO` con origen `DEVOLUCION`.
- Pagos mixtos de factura: backend atomico con una linea/movimiento por metodo de pago.

Esto no reemplaza aun auditoria avanzada, reversos controlados ni arqueos por denominacion, pero ya evita el problema principal: cobrar sin una caja abierta.

## Estado actual

Hay folios, cargos, pagos, cambio en efectivo y devoluciones. Ya existe una caja operativa minima por turno/hotel; falta madurar reversos, anulaciones, denominaciones y aprobaciones.

## Caja minima recomendada

Entidades:

- `CajaTurno`: hotel, usuario, fecha apertura, monto inicial, estado.
- `CajaMovimiento`: turno, tipo, origen, monto, metodo, referencia.
- Cierre en `CajaTurno`: esperado, contado, diferencia, observaciones.

## Flujo

1. Abrir caja.
2. Registrar pagos de folio y movimientos manuales.
3. Registrar pagos de factura desde facturacion/check-out.
4. Calcular esperado por metodo.
5. Registrar conteo real.
6. Guardar diferencia.
7. Cerrar turno.

## Reglas

- No registrar pagos sin caja abierta si el rol es cajero/recepcion.
- No registrar pagos de facturas de otro hotel desde recepcion/caja.
- Reversos requieren permiso.
- Cierres quedan bloqueados y auditados.

## Pendiente inmediato

La devolucion backend ya crea movimiento inverso y recalcula el turno. Falta construir la UI operativa de reversos con:

- motivo obligatorio;
- referencia de devolucion;
- autorizacion visible;
- confirmacion fuerte;
- historial de reversos por turno/factura.

Tambien falta permitir devoluciones parciales de forma contable; por ahora se exige devolucion total del pago.

El siguiente paso UX es crear un formulario de cobro con varias lineas para usar el endpoint `POST /pagos/mixto` desde caja/check-out.
