# Facturacion multisucursal

## Principio

Cada hotel/sucursal debe emitir documentos con sus propios datos comerciales y fiscales. ADUS Hospitality OS solo es la plataforma.

## Implementado

El payload POS toma datos desde `Hotel`:

- nombre
- razon social
- NIT
- direccion
- ciudad
- telefono
- email
- logo
- resolucion
- prefijo
- pie de factura
- moneda

La numeracion de facturas ahora se reserva desde `resoluciones_facturacion`, separada por hotel y prefijo. La factura guarda una copia historica de:

- `id_resolucion_facturacion`
- `prefijo_factura`
- `consecutivo_factura`
- `resolucion_numero`

Esto evita que una factura emitida cambie su informacion fiscal visible si luego se actualiza la configuracion del hotel.

## Pendientes

- Configuracion UI por sucursal.
- Historial de cambios fiscales por hotel.
- Validacion contra DIAN/proveedor tecnologico en produccion.
- Soporte de multiples resoluciones activas por tipo de documento cuando se agreguen notas credito/debito.

## Desarrollo con Hotel Valhalla

En desarrollo, `Hotel Valhalla` puede operar con resolucion ficticia marcada como ambiente `desarrollo`. Esta resolucion sirve para probar:

- reserva de consecutivos por hotel;
- prefijo visible en factura;
- ticket POS 58/80 mm;
- PDF POS;
- auditoria de reimpresion.

Antes de produccion, esa resolucion debe reemplazarse por los datos fiscales autorizados del hotel/sucursal.
