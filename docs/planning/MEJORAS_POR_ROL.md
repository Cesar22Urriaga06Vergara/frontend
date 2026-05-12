# Mejoras por rol

## Recepcionista

| Necesidad | Estado | Mejora |
| --- | --- | --- |
| Crear/modificar/cancelar reservas | Parcial | Unificar vista de reserva operativa con disponibilidad, historial y penalidades. |
| Check-in/check-out | Parcial | Mostrar requisitos, saldo, documentos, acompanantes y alertas en una sola pantalla. |
| Reasignar habitacion | No completo | Flujo con disponibilidad, motivo y auditoria. |
| Registrar consumos | Parcial | Cargos rapidos por habitacion, minibar y servicios frecuentes. |
| Cobrar servicios | Parcial | Pagos mixtos, parciales, cambio y recibos por pago. |
| Factura POS | Base implementada | Vista POS, impresion navegador y PDF POS auditado; replicar acceso directo en caja/check-out. |
| Historial huesped | Parcial | Panel lateral con estadias, preferencias, alertas y cartera. |

## Administrador

| Necesidad | Estado | Mejora |
| --- | --- | --- |
| Tarifas/temporadas | Parcial/no claro | CRUD de temporadas, tarifas por tipo, canal e impuestos. |
| Usuarios/permisos | Parcial | Permisos granulares, roles cajero/supervisor y matriz editable. |
| Reportes | Parcial | Ocupacion, ADR, RevPAR, ingresos por area, impuestos y exportacion. |
| Caja | No completo | Cierres por turno, diferencias, auditoria, aprobaciones. |
| Inventario/mantenimiento | Parcial | Inventario hotelero y mantenimiento preventivo/correctivo. |
| Auditoria | Parcial backend | Vista con filtros por usuario, modulo, hotel y fechas. |

## Cajero

Ya existe base de rol `cajero` en caja/pagos. Falta convertirlo en experiencia completa separada de recepcion.

Capacidades esperadas:

- Abrir caja con base inicial.
- Registrar ingresos/egresos no asociados a factura.
- Cobrar facturas con caja abierta.
- Cobrar facturas con pago mixto. Backend listo; falta formulario visual multilinea.
- Registrar cambio, referencia, voucher y observaciones.
- Cerrar caja y comparar esperado vs contado.
- Solicitar autorizacion para anulaciones/reversos. El backend ya registra egreso por devolucion de pago; falta UI de solicitud/aprobacion.
- Ver historial propio y cierres anteriores.

## Supervisor

Actualmente no existe como rol independiente. Debe agregarse para control operativo sin privilegios administrativos completos.

Capacidades esperadas:

- Ver ocupacion, check-ins/check-outs, incidencias y habitaciones bloqueadas.
- Aprobar descuentos, sobrecupos, reasignaciones y reversos segun reglas.
- Gestionar housekeeping y mantenimiento.
- Revisar alertas de saldo, documentos faltantes y habitaciones fuera de servicio.
- Auditar movimientos sensibles del turno.

## Roles de areas

Se corrigio el composable de permisos para que `minibar`, `transporte`, `tours`, `eventos` y `mantenimiento` tambien puedan usar `manage_orders`, igual que `cafeteria`, `lavanderia`, `spa` y `room_service`.

Pendiente:

- Configurar permisos por accion, no solo `manage_orders`.
- Separar ver pedidos, cambiar estado, cancelar, reportar incidencia y cerrar entrega.
- Validar las mismas reglas en backend y frontend.
# Actualizacion ADUS Hospitality OS

Recepcion gana coherencia operativa porque check-in/check-out ya sincronizan estados de habitacion. Administracion necesita ahora una pantalla de configuracion fiscal/POS del hotel. Caja sigue siendo el modulo faltante principal para cajero/recepcion.

## Actualizacion pagos, caja y POS

- Cajero puede registrar pagos de factura si tiene caja abierta.
- Recepcionista/cajero no pueden registrar pagos de facturas de otro hotel.
- El pago de factura crea movimiento de caja `FACTURA`.
- El ticket POS ya tiene PDF backend y auditoria de reimpresion.
