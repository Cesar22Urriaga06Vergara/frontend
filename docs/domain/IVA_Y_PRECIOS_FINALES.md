# IVA y precios finales

## Regla de ADUS Hospitality OS

Los precios operativos normalmente son precios finales. El sistema debe separar internamente la base gravable y el IVA/INC incluido, sin aumentar el total visible al cliente.

## Implementado

Se agrego utilidad monetaria:

- `calculateIncludedPercentageAmount(grossAmount, percentage)`

Y `ImpuestoService.calculateLineaImpuestos` ahora devuelve:

- `baseGravable`
- `iva`
- `inc`
- `total`
- `precioIncluyeImpuestos: true`

## Soporte tributario esperado

- Gravado 19%.
- Gravado 5%.
- Exento.
- Excluido.
- No gravado.

La diferencia se modela mediante tasas activas por categoria/perfil tributario. Si no hay tasa activa, la base es igual al total y el impuesto es 0.

## Advertencia

Algunos metodos heredados todavia tienen nombres como `subtotal`, aunque ahora representan base gravable despues del calculo incluido. Debe limpiarse gradualmente para evitar confusion.
