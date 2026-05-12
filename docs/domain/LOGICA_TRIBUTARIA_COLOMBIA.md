# Logica tributaria Colombia

## Alcance actual

Esta fase no implementa DIAN real, CUFE real, XML validado ni proveedor tecnologico. El objetivo es corregir la logica base para que los montos sean coherentes.

## Reglas aplicadas

- IVA e INC se separan del precio final cuando hay tasa activa.
- IVA e INC no deben aplicarse simultaneamente sobre la misma linea.
- IPC no es impuesto y no debe aparecer en factura ni cobrarse al cliente.
- La moneda default es COP, configurable por hotel.

## Pendientes

- Configuracion visual de tasas por categoria desde admin.
- Resoluciones/prefijos por hotel.
- Regimen fiscal y responsabilidad tributaria del cliente/hotel.
- Notas credito/debito futuras.
