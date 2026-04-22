# Hotel Sena 2026 - Dashboard Frontend

<div align="center">

**Interfaz web moderna y responsiva** para el sistema de gestión hotelera Hotel Sena 2026.

Construido con **Nuxt 3**, **Vue 3**, **Vuetify** y **Tailwind CSS**.

[![Node.js](https://img.shields.io/badge/node.js-v18+-brightgreen)](https://nodejs.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-3.14+-green)](https://nuxt.com/)
[![Vue](https://img.shields.io/badge/Vue-3.5+-brightgreen)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4+-blue)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-UNLICENSED-red)](#license)

</div>

---

## 📋 Descripción

Dashboard web completo para la gestión del hotel con interfaces específicas para cada rol:

- 👥 **SuperAdmin** - Administración completa del sistema
- 🏨 **Admin Hotel** - Gestión de su respectivo hotel
- 📅 **Recepcionista** - Check-in/Check-out y reservas
- 💼 **Gerente de Área** - Reportes y KPIs de su área
- 💰 **Facturación** - Gestión de facturas y pagos
- 👤 **Cliente** - Visualización de reservas y servicios

### Características

- ✨ Interfaz moderna y responsive
- 🎨 Temas personalizables con Vuetify
- 📊 Dashboards con gráficas e indicadores KPI
- 🔐 Sistema RBAC integrado
- 📱 Optimizado para mobile y desktop
- ⚡ Rendimiento optimizado con Nuxt 3
- 🗂️ Composables reutilizables
- 📈 Reportes interactivos

---

## 🚀 Requisitos Previos

- **Node.js** v18+
- **npm** o **yarn**
- **Backend API** ejecutándose (Hotel Sena 2026)
- Variables de entorno configuradas (`.env`)

---

## 📦 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd dashboard
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con la URL de la API backend.

---

## 🛠️ Scripts Disponibles

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Validar navegación y rutas
npm run check:navigation
```

### Producción
```bash
# Compilar para producción
npm run build

# Preview de la build
npm run preview

# Generar sitio estático
npm run generate
```

---

## 📁 Estructura del Proyecto

```
dashboard/
├── components/              # Componentes Vue reutilizables
│   ├── auth/               # Componentes de autenticación
│   ├── shared/             # Componentes compartidos
│   ├── admin/              # Componentes para admin
│   ├── recepcionista/      # Componentes para recepción
│   ├── empleados/          # Componentes para empleados
│   ├── facturas/           # Componentes de facturación
│   ├── reportes/           # Componentes de reportes
│   └── superadmin/         # Componentes para super admin
├── composables/             # Composables (lógica reutilizable)
│   ├── useApi.ts           # Llamadas HTTP a API
│   ├── usePermissions.ts   # Gestión de permisos
│   ├── useReservas.ts      # Lógica de reservas
│   ├── useFacturas.ts      # Lógica de facturas
│   └── ...                 # Otros composables
├── layouts/                 # Layouts principales
│   ├── admin.vue
│   ├── recepcion.vue
│   ├── operacion.vue
│   └── ...
├── pages/                   # Páginas/rutas de la aplicación
│   ├── index.vue           # Home
│   ├── login.vue           # Login
│   ├── admin/              # Rutas admin
│   ├── areas/              # Rutas de áreas
│   ├── dashboard/          # Dashboards
│   └── ...
├── stores/                  # Stores Pinia
├── middleware/              # Middlewares Nuxt
├── plugins/                 # Plugins globales
├── assets/                  # Estilos y recursos
├── types/                   # Tipos TypeScript
├── utils/                   # Utilidades
└── nuxt.config.ts          # Configuración de Nuxt
```

---

## 🔑 Variables de Entorno

Crear archivo `.env` con:

```env
# URL de la API Backend
NUXT_PUBLIC_API_URL=http://localhost:3000

# Modo debug
NUXT_PUBLIC_DEBUG=false
```

---

## 🎨 Tecnologías Principales

- **Nuxt 3** - Framework Vue meta
- **Vue 3** - Composición API
- **Vuetify 3** - Componentes Material Design
- **Tailwind CSS** - Estilos utilitarios
- **Pinia** - Gestión de estado
- **TypeScript** - Tipado estático
- **Vite** - Build tool

---

## 📚 Estructura de Componentes

### Composables (`composables/`)
Lógica reutilizable para componentes:

```typescript
// useApi.ts
const { data, loading, error } = await useApi('/endpoint')

// usePermissions.ts
const hasPermission = usePermissions('crear:reservas')

// useReservas.ts
const { createReserva, updateReserva } = useReservas()
```

### Stores Pinia (`stores/`)
Gestión centralizada de estado:

```typescript
// authStore
const auth = useAuthStore()
auth.login(credentials)
```

### Layouts (`layouts/`)
Diferentes layouts para diferentes roles:

- `admin.vue` - Layout para administrador
- `recepcion.vue` - Layout para recepcionista
- `operacion.vue` - Layout para operaciones
- `cliente.vue` - Layout para clientes
- `superadmin.vue` - Layout para super admin
- `auth.vue` - Layout para autenticación

---

## 🔐 Autenticación y Autorización

- **Login con JWT** token
- **Google OAuth2** integrado
- **RBAC** (Role-Based Access Control)
- **Middleware de autenticación** en rutas protegidas
- **Middleware de roles** para control de acceso

---

## 📊 Dashboards Disponibles

- **SuperAdmin** - Estadísticas globales del sistema
- **Admin** - Estadísticas de su hotel
- **Recepcionista** - Reservas del día y check-ins
- **Gerente de Área** - KPIs de su área
- **Facturación** - Estado de facturas y cobros

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📋 Convenciones

### Nombres de Componentes
- PascalCase: `DialogCompletarPerfil.vue`
- Específicos por contexto: `useNombreRecurso.ts`

### Estructura de Rutas
- `/admin/*` - Rutas de administración
- `/recepcion/*` - Rutas de recepción
- `/areas/*` - Rutas de reportes por área
- `/dashboard/*` - Dashboards personalizados
- `/facturas/*` - Gestión de facturas
- `/reportes/*` - Reportes

### Estilos
- Usar clases de Tailwind CSS
- Componentes Vuetify para UI
- SCSS en scope de componentes cuando sea necesario

---

## 📄 Licencia

Este proyecto es **UNLICENSED** y es propiedad privada.

---

## 🔗 Enlaces Útiles

- [Documentación Nuxt 3](https://nuxt.com/)
- [Documentación Vue 3](https://vuejs.org/)
- [Documentación Vuetify 3](https://vuetifyjs.com/)
- [Documentación Tailwind CSS](https://tailwindcss.com/)
- [Documentación Pinia](https://pinia.vuejs.org/)

---

Desarrollado para Hotel Sena 2026 ©2026
