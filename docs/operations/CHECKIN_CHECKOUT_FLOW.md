# Flujo check-in/check-out

## Check-in

Validaciones actuales:

- Reserva debe existir.
- Estado debe ser `reservada` o `confirmada`.
- Se registra `checkinReal`.
- Se abre folio si no existe.

Mejora aplicada:

- La habitacion se marca como `ocupada` al confirmar check-in.
- El modal de check-in ahora muestra resumen operativo de reserva, noches, tarifa, habitacion y documento.
- Se agrego checklist obligatorio: identificacion validada, huespedes/acompanantes confirmados y acceso entregado.
- Frontend envia `horaCheckin`, `documentoHuespedPrincipal` y `observacionesCheckin`.
- Backend acepta `horaCheckin`, ajusta `checkinReal` con esa hora y anexa observaciones operativas en `reservas.observaciones`.
- Backend permite actualizar `numeroHuespedesActual` cuando se envie desde el flujo.

Pendientes:

- Validar explicitamente que la habitacion no este ocupada por otra estadia.
- Validar documentos/acompanantes con entidad propia desde backend; hoy queda como checklist operativo y observacion.
- Mostrar saldo/anticipo requerido antes de confirmar.

## Check-out

Validaciones actuales:

- Reserva debe existir.
- Debe tener check-in.
- Debe tener habitacion.
- Debe existir folio.
- Si el folio tiene saldo, debe estar pagado antes de salir.

Mejora aplicada:

- La habitacion queda en `limpieza` tras checkout.
- El modal de check-out ahora muestra estado del folio, saldo, total y resumen de estadia.
- Si el folio no esta pagado, la salida queda bloqueada y muestra accion directa para ir a Caja.
- Se agrego checklist obligatorio de revision de habitacion y novedades.
- Frontend envia `estadoLimpieza`, `horaCheckout` y `observacionesCheckout`.
- Backend acepta DTO de check-out, ajusta `checkoutReal` con la hora enviada, anexa observaciones y marca la habitacion como `disponible` si el estado operativo es `LIMPIO`; en los demas casos queda en `limpieza`.

Pendientes:

- Botones directos en la salida: generar factura, vista POS, descargar PDF y reimprimir.
- Registro de reimpresiones ya existe para PDF POS; falta exponer historial desde la salida.
- Flujo de excepcion con autorizacion para saldos o descuentos.
