# Seguridad y riesgos

## Acciones realizadas

- `src/main.ts` ahora toma CORS, puerto y Swagger desde variables de entorno.
- `ValidationPipe` ahora usa `forbidUnknownValues` y conversion implicita.
- `src/app.module.ts` deja `TYPEORM_SYNCHRONIZE=false` por defecto via configuracion.
- `.env.example` fue corregido para usar las variables reales esperadas por el codigo.
- Se agregaron parametros de IPC DANE sin hardcodear valores.
- Se corrigio el estado de pago parcial para que no marque `estadoFactura = PAGADA`.
- Se corrigio una consulta de morosidad que sobreescribia el filtro de hotel.
- Se reforzo validacion de DTOs de folio para montos positivos, categorias permitidas y longitudes.

## Riesgos encontrados

- `.env` local contiene secretos reales. Aunque no esta versionado, debe tratarse como material sensible.
- No hay rate limiting global ni proteccion anti brute force en login.
- Swagger puede exponer superficie de API si queda habilitado en produccion.
- Tokens JWT se manejan del lado cliente; revisar almacenamiento, expiracion y renovacion.
- Falta politica central para sanitizar texto que luego se usa en XML/PDF/facturas.
- Algunos endpoints dependen de middleware por ruta; conviene auditar guardas por controlador y rol.

## Recomendaciones

- Rotar Cloudinary API secret, JWT secret y credenciales DB si el `.env` fue compartido.
- Configurar `ENABLE_SWAGGER=false` en produccion.
- Agregar `@nestjs/throttler` para login y endpoints sensibles.
- Mover secretos a un gestor seguro o variables de entorno del host.
- Revisar autorizacion por hotel en todos los endpoints con datos financieros.
# Actualizacion ADUS Hospitality OS

Riesgos reducidos: doble reserva por estado `reservada`, inconsistencia de habitacion tras check-in/check-out, y datos hardcodeados en ticket POS. Riesgos abiertos: logs de depuracion, permisos granulares incompletos, caja sin cierre auditado y endpoints con estados string libres.
