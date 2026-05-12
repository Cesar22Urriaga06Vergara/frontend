# Refactor backend/frontend

## Backend

Prioridades:

- Extraer logica tributaria a contratos mas claros: `precioFinal`, `baseGravable`, `impuestoIncluido`.
- Separar `FacturaService` en calculo, persistencia, reportes y POS.
- Formalizar constantes de estados de habitacion.
- Remover logs de depuracion.
- Agregar DTOs para payload POS.

## Frontend

Prioridades:

- Reducir componentes grandes de caja/check-in.
- Reusar `FacturaPosTicket` en caja y checkout.
- Centralizar formateo monetario.
- Reemplazar placeholders de reportes.
- Eliminar logs de autenticacion.

## Regla

Refactor incremental, sin romper flujos existentes.
