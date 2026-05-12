# Configuracion financiera global

## Implementado en backend

El hotel ahora puede almacenar:

- `razonSocial`
- `logoUrl`
- `resolucionFacturacion`
- `prefijoFacturacion`
- `pieFactura`
- `moneda`
- `posFormatoDefault`

Ademas, las resoluciones ya no deben depender solo de un texto libre en `hoteles.resolucionFacturacion`. Se agrego `resoluciones_facturacion` para manejar:

- numero de resolucion
- prefijo
- rango autorizado
- consecutivo actual
- vigencia
- ambiente `desarrollo` o `produccion`
- estado `activa`, `inactiva`, `vencida` o `agotada`

Para pruebas locales, `Hotel Valhalla` tiene una resolucion ficticia `DEV-VALHALLA-2026`. Sirve para validar flujos de facturacion sin credenciales ni resolucion DIAN real.

## Regla de branding

ADUS Hospitality OS es el software. No debe aparecer como nombre del hotel emisor en facturas, tickets o documentos comerciales.

## Pendiente UI

- Formulario superadmin agregado en `superadmin/configuracion` para editar datos fiscales/POS del hotel.
- Validar formato de NIT, prefijo, resolucion y moneda.
- Mostrar previsualizacion de factura/POS por hotel.
- Pantalla superadmin creada para listar, crear, activar e inactivar resoluciones de facturacion.
