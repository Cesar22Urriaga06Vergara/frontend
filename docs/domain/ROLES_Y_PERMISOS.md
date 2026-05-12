# Roles y permisos

## Roles actuales

- `superadmin`
- `admin`
- `recepcionista`
- `cajero`
- `cliente`
- areas operativas: `cafeteria`, `lavanderia`, `spa`, `room_service`, `minibar`, `transporte`, `tours`, `eventos`, `mantenimiento`

## Mejora aplicada

El frontend ahora concede `manage_orders` tambien a `minibar`, `transporte`, `tours`, `eventos` y `mantenimiento`, alineandolos con los roles de area existentes.

El backend ya autoriza `cajero` en caja y en pagos de factura. Para recepcionista/cajero se aplica scope de hotel al registrar y consultar pagos.

## Pendientes

- Crear permisos granulares: `reserva:*`, `caja:*`, `factura:*`, `pago:*`.
- Evitar depender solo de frontend para permisos.
- Completar UI dedicada de cajero si caja queda separada de recepcion.
- Crear rol `supervisor` para aprobaciones operativas.
- Centralizar matriz de permisos compartida o generada desde backend.
