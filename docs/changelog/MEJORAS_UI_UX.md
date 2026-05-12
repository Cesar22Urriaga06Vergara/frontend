# Mejoras UI/UX

## Acciones realizadas

- Se instalo `@lucide/vue`, paquete oficial moderno de Lucide para Vue.
- Se configuro un set global de iconos Lucide en `plugins/vuetify.ts`, de forma que los `v-icon` existentes rendericen SVG Lucide mediante alias.
- Se retiro `@mdi/font` y su import global en `assets/styles/main.scss`, eliminando webfonts pesadas del bundle.
- Se ajusto la paleta del tema para un panel administrativo mas sobrio: primario verde-teal, secundario azul funcional, acento ambar.
- Se redujo el radio global de botones, chips y cards para una UI mas limpia y densa.
- Se agregaron estados de focus visibles en `assets/styles/design-system.scss`.
- Se reemplazaron emojis visibles en flujos de checkout, caja, servicios y cancelacion por iconos Lucide o texto limpio.
- `NUXT_PUBLIC_API_BASE` quedo configurable desde ambiente en `nuxt.config.ts`.

## Impacto

- La hoja principal del build bajo de aproximadamente 846 KB a 523 KB al retirar MDI.
- La iconografia queda unificada sin editar manualmente cada `v-icon` del proyecto.
- Las pantallas conservan comportamiento actual, pero ganan coherencia visual.

## Recomendaciones pendientes

- Convertir componentes grandes de administracion y caja en subcomponentes por responsabilidades.
- Agregar skeletons especificos en formularios de reserva, caja y facturacion.
- Revisar textos con encoding corrupto y normalizar todo el proyecto a UTF-8.
- Agregar estados vacios con acciones primarias en cada tabla administrativa.
- Introducir lazy loading por dominios grandes: facturas, reportes, superadmin y areas.
# Actualizacion ADUS Hospitality OS

La prioridad visual inmediata no es decorar, sino acelerar operacion: ticket POS reusable, salida clara desde caja/check-out, mensajes visibles y formularios menos largos. Se debe mantener estilo administrativo sobrio y evitar que documentos comerciales mezclen marca de software con nombre del hotel.
