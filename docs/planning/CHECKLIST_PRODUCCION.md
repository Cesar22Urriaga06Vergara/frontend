# Checklist de produccion - ADUS Hospitality OS

## Bloqueantes antes de produccion

- [x] Implementar caja formal base: apertura, cierre, arqueo y movimientos.
- [x] Implementar reverso backend de pago con movimiento inverso en caja.
- [ ] Implementar UI de reversos/anulaciones de caja con aprobacion.
- [ ] Integrar facturacion electronica DIAN real o proveedor certificado.
- [x] Implementar PDF POS basico para ticket termico.
- [ ] Implementar PDF A4 fiscal si se requiere factura formal descargable.
- [ ] Implementar impresion termica ESC/POS o agente local de impresion.
- [x] Reemplazar KPIs placeholder por datos reales basicos.
- [ ] Conectar exportaciones de reportes Excel/PDF.
- [x] Agregar rol `cajero` a flujos base de caja/pagos.
- [ ] Agregar rol `supervisor` con permisos dedicados.
- [ ] Crear tablero housekeeping.
- [ ] Implementar bloqueo transaccional de disponibilidad.
- [ ] Remover logs de depuracion con datos sensibles.

## Validaciones funcionales

- [ ] Reserva no permite habitacion duplicada en el mismo rango.
- [ ] Check-in valida documentos, saldo/politica y estado de habitacion desde backend.
- [x] Check-in tiene checklist operativo obligatorio en frontend.
- [x] Check-out bloquea salida con cargos pendientes no resueltos.
- [ ] Factura refleja todos los consumos entregados.
- [x] Pagos parciales calculan saldo contra total de factura.
- [x] Endpoint backend atomico para pagos mixtos con varias lineas/metodos.
- [x] UI operativa para capturar pagos mixtos desde caja/folio.
- [x] Pago mixto en efectivo calcula cambio correctamente.
- [ ] Anulacion exige motivo, permiso y auditoria.
- [x] Devolucion de pago exige caja abierta, motivo y movimiento inverso.
- [ ] Descuento exige autorizacion segun umbral.
- [x] Reimpresion POS PDF registra usuario, fecha y motivo.

## Validaciones tributarias Colombia

- [ ] IVA parametrizable por categoria/perfil.
- [ ] INC separado de IVA.
- [ ] Redondeo monetario centralizado.
- [x] Resolucion DIAN/desarrollo por hotel/prefijo.
- [ ] CUFE/CUDE real.
- [ ] XML UBL validado.
- [ ] Notas credito/debito.
- [ ] Reporte de impuestos exportable.

## UX operativa

- [ ] Recepcionista puede completar reserva-checkin-estadia-checkout sin cambiar innecesariamente de modulo.
- [ ] Caja muestra saldo, pagos, cambio, metodo y comprobante en una sola pantalla.
- [ ] Supervisor ve alertas de habitaciones, limpieza, mantenimiento y saldos.
- [ ] Admin ve reportes con filtros y exportacion.
- [ ] Cliente descarga factura/comprobante desde su portal.
- [x] Check-in/check-out usan estados, bloqueos y mensajes operativos claros.
- [ ] Estados y errores usan mensajes claros en todos los modulos.
- [ ] Tablas grandes tienen paginacion y filtros server-side.
- [ ] La interfaz funciona en tablet.

## Seguridad y auditoria

- [ ] JWT y refresh tokens revisados.
- [ ] Scope de hotel aplicado en todos los endpoints.
- [ ] Auditoria de acciones sensibles.
- [ ] Backups probados.
- [ ] Variables `.env` sin secretos en repo.
- [ ] CORS limitado por entorno.
- [ ] Rate limit para login y endpoints criticos.
- [ ] Recuperacion de contrasena probada.

## Verificacion tecnica

- [x] `npm run build` frontend.
- [x] `npm run build` backend.
- [ ] Tests unitarios de facturacion/pagos/reservas.
- [ ] Tests de integracion para checkout completo.
- [ ] Migraciones revisadas.
- [ ] Seed demo separado de datos productivos.
- [ ] Logs estructurados por entorno.
- [ ] Monitoreo de errores y disponibilidad.
# Actualizacion ADUS Hospitality OS

- [x] Separar branding de software vs datos del hotel en ticket POS.
- [x] Evitar doble reserva contra reservas `reservada` y `confirmada`.
- [x] Mantener precios finales con IVA/INC incluido en calculo tributario principal.
- [x] Sincronizar habitacion ocupada/limpieza en check-in/check-out.
- [x] Crear caja formal base con apertura/cierre/arqueo.
- [x] Implementar PDF POS backend.
- [x] Implementar KPIs reales sin placeholders en endpoints base.
- [x] Crear UI base de resoluciones de facturacion.
- [x] Crear UI base de configuracion fiscal/POS del hotel.
- [ ] Agregar previsualizacion fiscal/POS antes de guardar.
- [x] Crear tabla de resoluciones por hotel/prefijo y asociarla a facturas.
- [ ] Reemplazar resolucion ficticia de desarrollo por resolucion fiscal real antes de produccion.
