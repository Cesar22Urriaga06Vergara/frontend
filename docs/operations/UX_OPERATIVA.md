# UX operativa

## Objetivo

Que el recepcionista pueda reservar, hacer check-in, cobrar, imprimir y cerrar cuenta con la menor friccion posible.

## Hallazgos

- Hay varios flujos separados: reservas, check-in/out, caja y facturas. Funcionan, pero obligan a cambiar de contexto.
- Reportes admin aun tiene graficos pendientes y exportaciones sin implementacion.
- Caja muestra acciones de factura/PDF, pero parte del flujo sigue siendo placeholder.
- El ticket POS existe como base reusable, pero debe aparecer en checkout/caja.

## Mejoras aplicadas

- Vista POS reutilizable en facturas.
- Ticket deja de mostrar marca incorrecta del hotel y usa pie configurado.
- Estados de habitacion se sincronizan con operaciones reales.
- Check-in ahora tiene resumen compacto y checklist operativo obligatorio antes de confirmar.
- Check-out ahora bloquea salida con folio pendiente y ofrece accion directa a Caja.
- Caja ya permite pago mixto de folio desde la UI con validacion de suma exacta, referencia y cambio en efectivo.
- Horas y observaciones de check-in/check-out ya viajan al backend y quedan anexadas a la reserva.

## Siguientes mejoras UX

- Agregar panel unico de salida: folio, pagos, factura, ticket y checkout.
- Mostrar errores de caja/factura con acciones sugeridas.
- Reducir formularios largos en reserva con pasos compactos.
- Mostrar historial rapido del huesped desde recepcion.
- Mostrar historial de reimpresiones POS desde factura/check-out.
