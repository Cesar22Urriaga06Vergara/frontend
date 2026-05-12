# Optimizacion y performance

## Acciones realizadas

- Se retiro `@mdi/font`, evitando descarga de fuentes MDI grandes.
- Se mantuvo Lucide tree-shakeable via `@lucide/vue`, aunque el adaptador global importa el namespace para compatibilidad de alias.
- Se agrego una utilidad monetaria central para reducir conversiones y redondeos repetidos.
- Se hizo parametrizable `NUXT_PUBLIC_API_BASE`, evitando recompilar codigo para cambiar backend.
- Se dejo TypeORM sin `synchronize` por defecto para evitar trabajo automatico riesgoso sobre esquema.

## Resultados de build

- Backend `npm.cmd run build`: exitoso.
- Frontend `npm.cmd run build`: exitoso con advertencia de chunks grandes.
- Frontend `npm.cmd run check:navigation`: exitoso, 49 rutas verificadas.
- Backend `npm.cmd test -- --runInBand`: exitoso, 43 pruebas.
- El bundle sigue teniendo un chunk grande de aproximadamente 1.35 MB minificado, principalmente por dependencias UI/framework.

## Recomendaciones pendientes

- Dividir rutas pesadas con imports dinamicos y revisar `manualChunks`.
- Revisar tablas grandes para paginacion server-side real.
- Cachear catalogos estables: tipos de habitacion, medios de pago, categorias, amenidades.
- Reducir `import * as Lucide` en el adaptador cuando se complete migracion a iconos importados explicitamente.
- Auditar consultas raw de reportes y agregar indices para `facturas`, `pagos`, `detalle_facturas`, `pedidos`.
