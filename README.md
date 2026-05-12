# ADUS Hospitality OS - Frontend

Aplicacion web SPA para la operacion hotelera de ADUS. Consume la API NestJS
del backend y ofrece pantallas por rol para autenticacion, administracion,
recepcion, cliente, areas operativas, facturacion, caja, reportes y dashboards.

## Stack

- Node.js 18 o superior
- Nuxt 3
- Vue 3
- TypeScript
- Vuetify 3
- Tailwind CSS
- Pinia
- Vite

## Arquitectura

```text
frontend/
  app.vue
  error.vue
  nuxt.config.ts
  assets/
  components/
  composables/
  layouts/
  middleware/
  pages/
  plugins/
  docs/
  scripts/
  stores/
  types/
  utils/
```

La aplicacion corre con `ssr: false`, por lo que se comporta como SPA. Las rutas
se definen en `pages/`, los layouts por rol estan en `layouts/`, el estado global
usa Pinia en `stores/` y las llamadas HTTP se concentran en composables como
`useApi`.

La documentacion tecnica complementaria vive en `docs/`, organizada por
auditorias, planificacion, operacion, dominio y changelog.

## Instalacion

```bash
npm install
cp .env.example .env
```

Edita `.env` con la URL real del backend.

## Variables De Entorno

```env
NUXT_PUBLIC_API_BASE=http://localhost:3001
NUXT_PUBLIC_DEBUG=false
```

No subas `.env` a Git. `.env.example` si debe versionarse.

## Scripts

```bash
npm run dev               # Servidor local de Nuxt
npm run build             # Build de produccion
npm run preview           # Preview de .output
npm run generate          # Generacion estatica si aplica
npm run check:navigation  # Valida rutas declaradas de navegacion
npm run postinstall       # Prepara Nuxt despues de instalar
```

## Ejecucion Local

1. Levanta el backend en `http://localhost:3001`.
2. Configura `NUXT_PUBLIC_API_BASE`.
3. Ejecuta:

```bash
npm run dev
```

El frontend queda disponible por defecto en:

```text
http://localhost:3000
```

## Produccion

```bash
npm run build
npm run preview
```

Para despliegue, configura `NUXT_PUBLIC_API_BASE` con la URL publica de la API y
manten fuera del repositorio cualquier archivo `.env` real.

## Seguridad

- `.env`, builds, caches, logs y archivos temporales estan ignorados por Git.
- La API base publica debe apuntar al backend autorizado.
- Los tokens de sesion se gestionan desde el flujo de autenticacion del frontend.
- No agregues secretos privados a archivos Vue, stores, composables ni documentos.
- Documenta nuevas variables publicas en `.env.example`.

## Convenciones

- Componentes Vue en PascalCase.
- Composables con prefijo `use`.
- Tipos compartidos en `types/`.
- Utilidades puras en `utils/`.
- Rutas protegidas mediante middleware Nuxt y validaciones de permisos.
- Mantener componentes visuales separados de llamadas HTTP reutilizables.

## Troubleshooting

- `Failed fetch` o CORS: valida `NUXT_PUBLIC_API_BASE` y `CORS_ORIGINS` del backend.
- Pantalla protegida redirige: revisa sesion, token y rol del usuario.
- Error de build por cache: elimina `.nuxt` y vuelve a ejecutar `npm run build`.
- Puerto ocupado en dev: cambia el puerto de Nuxt o deten el proceso existente.

## Licencia

Proyecto privado sin licencia publica declarada.
