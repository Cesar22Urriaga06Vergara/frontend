# Reservas y disponibilidad

## Estado actual

El sistema cuenta con consulta de disponibilidad, creacion transaccional, confirmacion, cancelacion, check-in y check-out. El punto mas delicado encontrado era la diferencia entre consulta y creacion: la consulta excluia `reservada` y `confirmada`, pero la creacion solo bloqueaba `confirmada`.

## Cambios aplicados

- La busqueda transaccional de habitacion disponible en `ReservaService.create` ahora considera reservas `reservada` y `confirmada`.
- La edicion de fechas valida solapamiento de la misma habitacion contra reservas activas.
- Check-in sincroniza habitacion a `ocupada`.
- Check-out sincroniza habitacion a `limpieza`.

## Estados recomendados

| Dominio | Estados operativos recomendados | Compatibilidad actual |
| --- | --- | --- |
| Reserva | `pendiente`, `confirmada`, `check-in`, `check-out`, `cancelada`, `no-show` | Actualmente existen `reservada`, `confirmada`, `completada`, `cancelada`, `rechazada`. |
| Habitacion | `disponible`, `ocupada`, `limpieza`, `mantenimiento`, `bloqueada` | El sistema usa strings libres; debe formalizarse enum/constantes. |

## Pendientes criticos

- Agregar estado `no-show` con accion y auditoria.
- Agregar cambio de habitacion con validacion de disponibilidad.
- Agregar bloqueo temporal de habitacion.
- Agregar indice unico/compuesto preventivo por hotel/habitacion/rango si la base lo permite mediante estrategia auxiliar.
- Revisar que todos los endpoints usen los mismos estados canonicos.
