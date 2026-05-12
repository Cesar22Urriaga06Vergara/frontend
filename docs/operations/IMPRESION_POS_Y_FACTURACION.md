# Impresion POS y facturacion

## Estado encontrado

Antes de esta revision, el sistema tenia modulo de facturas con estados, detalles, pagos, calculo de IVA/INC y XML simulado para preparacion DIAN. No se encontro soporte real para:

- Plantilla POS reutilizable.
- Endpoint de ticket termico.
- Generacion PDF backend.
- ESC/POS.
- Integracion con impresoras termicas.
- Historial de reimpresion.

## Base implementada

### Backend

Se agrego:

- `GET /facturas/:id/ticket-pos?formato=58mm|80mm`
- `GET /facturas/:id/ticket-pos/pdf?formato=58mm|80mm`
- `GET /facturas/:id/reimpresiones`
- Validacion de acceso por rol/hotel/cliente.
- Payload normalizado con hotel, factura, estancia, detalles, totales, pagos y `qrData`.
- PDF POS basico generado en backend con ancho termico.
- Auditoria de reimpresiones/descargas PDF en `factura_reimpresiones`.

Archivo:

- `c:\Users\urria\backend\src\factura\factura.controller.ts`
- `c:\Users\urria\backend\src\factura\factura.service.ts`

### Frontend

Se agrego:

- Tipo `FacturaPosTicket`.
- Metodo `obtenerTicketPos` en `useFacturas`.
- Componente `components/facturas/FacturaPosTicket.vue`.
- Boton de vista POS en `pages/admin/facturas.vue`.
- Selector 58 mm / 80 mm.
- Accion de imprimir usando navegador.
- Accion de descargar/abrir PDF POS contra backend.

## Datos cubiertos en ticket

- Logo preparado por contrato (`logoUrl`, pendiente de configurar).
- Nombre hotel, NIT, direccion, ciudad, telefono.
- Resolucion de facturacion tomada de la factura/resolucion activa del hotel.
- Numero de factura.
- Fecha/hora.
- Habitacion.
- Huesped/documento.
- Detalle de consumos.
- Subtotal, descuento, IVA, INC, total, pagado y saldo.
- Metodo de pago.
- QR textual basado en CUFE/UUID/numero de factura.

## Pendientes para produccion

| Requisito | Estado | Recomendacion |
| --- | --- | --- |
| PDF POS basico | Implementado | Genera PDF 58/80 mm desde backend; falta mejorar diseno visual si se requiere mayor fidelidad. |
| PDF A4 fiscal | Pendiente | Usar pdfkit/pdfmake/Playwright para factura carta/A4 si el hotel lo necesita. |
| ESC/POS | Pendiente | Implementar adaptador local con `escpos` o servicio puente instalado en caja. |
| Impresion automatica | Pendiente | Requiere agente local o integracion navegador/kiosko; no depender solo de web. |
| Codigo QR grafico | Pendiente | Generar QR desde CUFE/URL DIAN con libreria dedicada. |
| Resolucion DIAN | Base implementada | Existe `resoluciones_facturacion` por hotel/prefijo. En desarrollo puede usarse una resolucion ficticia; en produccion debe cargarse la resolucion real autorizada. |
| Facturacion electronica | Parcial/simulada | Integrar proveedor DIAN y validar CUFE, XML UBL, eventos y numeracion. |
| Reimpresiones | Implementado base | Registra factura, usuario, rol, formato, tamano, motivo, IP, user agent y fecha. |
| Notas credito/debito | Pendiente | Requeridas para anulaciones fiscales reales. |

## Arquitectura propuesta

```text
FacturaService
  -> calcula y persiste factura fiscal
  -> expone payload normalizado

TicketPosService
  -> convierte payload a HTML termico
  -> genera PDF 58/80 mm
  -> registra reimpresiones

EscPosAdapter
  -> transforma payload a comandos ESC/POS
  -> envia a agente local o cola de impresion

DianProvider
  -> emite XML UBL
  -> consulta estado
  -> conserva CUFE/CUDE/respuestas
```

## Consideraciones Colombia

- IVA no debe asumirse siempre como 19%; el sistema ya avanza hacia calculo por categoria y perfil tributario.
- INC debe separarse de IVA.
- Redondeos deben centralizarse con utilidades monetarias y persistirse con dos decimales.
- La resolucion DIAN, prefijos, rangos, CUFE/CUDE y XML UBL no pueden ser simulados en produccion.
# Actualizacion ADUS Hospitality OS

El ticket POS ya no debe usar el nombre del software como emisor. El backend entrega datos dinamicos desde la entidad Hotel: razon social, logo, resolucion, prefijo, pie de factura, moneda y formato POS. Queda pendiente crear UI administrativa para editarlos y PDF backend real.

## Resoluciones de facturacion

Se agrego la tabla `resoluciones_facturacion` y la relacion opcional desde `facturas.id_resolucion_facturacion`.

- Endpoint admin: `GET /facturacion/resoluciones`
- Endpoint admin: `GET /facturacion/resoluciones/activa`
- Endpoint admin: `POST /facturacion/resoluciones`
- Endpoint admin: `PATCH /facturacion/resoluciones/:id`

En desarrollo se dejo activa para `Hotel Valhalla` la resolucion ficticia `DEV-VALHALLA-2026`, prefijo `FV`, rango `1-999999`, ambiente `desarrollo`. Esta configuracion permite probar numeracion, tickets y PDFs sin datos DIAN reales. No debe usarse como dato fiscal productivo.

## Como probar en desarrollo

1. Confirmar que existe una resolucion activa para `Hotel Valhalla` en `resoluciones_facturacion`.
2. Generar una factura desde una reserva.
3. Abrir `/admin/facturas`.
4. Usar el boton `Vista POS`.
5. Cambiar entre `58 mm` y `80 mm`.
6. Usar `Imprimir` para impresion del navegador.
7. Usar `Descargar PDF`; esto debe abrir el PDF y crear un registro en `factura_reimpresiones`.

La factura/ticket debe mostrar `Hotel Valhalla` y sus datos de base de datos, no `ADUS Hospitality OS`.
