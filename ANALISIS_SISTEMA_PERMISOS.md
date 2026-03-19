# Análisis: Sistema de Permisos del Dashboard

## 📋 Resumen Ejecutivo

El sistema de permisos usa un modelo **Role-Based Access Control (RBAC)** con:
- **Matriz de permisos** por rol (en `usePermissions`)
- **Guards de ruta** que verifican autenticación y rol (en middleware)
- **Estructura centralizada** de roles, labels, colores e iconos (en constants)

---

## 🔷 1. Estructura de Usuario

**Archivo:** [types/auth.ts](types/auth.ts)

```typescript
export enum UserRole {
  SUPERADMIN = 'superadmin'
  ADMIN = 'admin'
  RECEPCIONISTA = 'recepcionista'
  CLIENTE = 'cliente'
  CAFETERIA = 'cafeteria'
  LAVANDERIA = 'lavanderia'
  SPA = 'spa'
  ROOM_SERVICE = 'room_service'
}

export interface User {
  id: number
  fullName: string
  email: string
  role: UserRole           // ← Rol asignado
  isActive: boolean        // ← Control de activación
  lastLogin?: string
  idEmpleado?: number      // ← Referencias a entidades
  idCliente?: number
  idHotel?: number
}
```

**Puntos clave:**
- Un usuario tiene **UN SOLO ROL** (no soporta multi-rol actualmente)
- El rol viene del backend en la respuesta de login
- Se almacena en `authStore.user.role`

---

## 🔑 2. Matriz de Permisos por Rol

**Archivo:** [composables/usePermissions.ts](composables/usePermissions.ts)

```typescript
const ROLE_PERMISSIONS: Record<string, string[]> = {
  superadmin: [
    'manage_users',
    'manage_rooms',
    'manage_reservations',
    'manage_orders',
    'manage_services',
    'view_reports',
    'checkin_checkout',
    'manage_hotels',
    'manage_amenities',
  ],
  
  admin: [
    'manage_users',
    'manage_rooms',
    'manage_reservations',
    'manage_orders',
    'manage_services',
    'view_reports',
    'checkin_checkout',
    'manage_amenities',
  ],
  
  recepcionista: [
    'manage_reservations',
    'checkin_checkout',
    'view_reports',
  ],
  
  cafeteria: ['manage_orders'],
  lavanderia: ['manage_orders'],
  spa: ['manage_orders'],
  room_service: ['manage_orders'],
  
  cliente: [], // Sin permisos especiales
}
```

**Estructura:**
- Cada rol mapea a un array de strings de permisos
- Los permisos son **genéricos** (no tienen lógica, solo son nombres)
- Fácil de extender: agregar nueva permiso es una línea

---

## 🎯 3. API del Composable usePermissions

**Archivo:** [composables/usePermissions.ts](composables/usePermissions.ts)

### Métodos principales:

```typescript
const {
  can,        // ✅ Verificar UN permiso
  canAny,     // ✅ Verificar AL MENOS UNO de varios permisos
  canAll,     // ✅ Verificar TODOS los permisos
  hasRole,    // ✅ Verificar SI TIENE un rol específico
  hasAnyRole, // ✅ Verificar SI TIENE AL MENOS UN rol
  userPermissions, // ✅ Obtener array de permisos del usuario actual
} = usePermissions()
```

### Ejemplos de uso:

```typescript
// ✅ Verificar UN permiso
if (can('manage_users')) {
  // Mostrar panel de administración de usuarios
}

// ✅ Verificar múltiples permisos (OR lógico)
if (canAny('manage_users', 'manage_orders')) {
  // Mostrar botón si tiene al menos uno de estos permisos
}

// ✅ Verificar múltiples permisos (AND lógico)
if (canAll('manage_users', 'view_reports')) {
  // Mostrar dashboard avanzado solo si tiene AMBOS
}

// ✅ Verificar por rol
if (hasRole('admin')) {
  // Mostrar panel admin específico
}

if (hasAnyRole('admin', 'superadmin')) {
  // Mostrar para administradores superiores
}

// ✅ Obtener y listar permisos
const perms = userPermissions.value // Array de strings
```

---

## 🛡️ 4. Guards de Autorización (Middleware)

### 4A. Auth Middleware

**Archivo:** [middleware/auth.ts](middleware/auth.ts)

```typescript
export default defineNuxtRouteMiddleware((_to, _from) => {
  const authStore = useAuthStore()

  // Inicializar sesión si no está cargada
  if (!authStore.isAuthenticated) {
    authStore.initSession()
  }

  // Redirigir a login si no está autenticado
  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }
})
```

**Propósito:** Verificar que el usuario está logueado

---

### 4B. Role Middleware

**Archivo:** [middleware/role.ts](middleware/role.ts)

```typescript
export default defineNuxtRouteMiddleware((to, _from) => {
  const authStore = useAuthStore()

  // Paso 1: Verificar autenticación
  if (!authStore.isAuthenticated) {
    authStore.initSession()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Paso 2: Verificar roles permitidos (de meta de la ruta)
  const allowedRoles = to.meta.roles as UserRole[] | undefined

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = authStore.userRole
    
    if (!userRole) {
      return navigateTo('/login')
    }

    // Normalizar a minúsculas y comparar
    const allowed = allowedRoles.map((r) => String(r).toLowerCase())
    const normalizedUserRole = String(userRole).toLowerCase()
    
    if (!allowed.includes(normalizedUserRole)) {
      // ❌ Sin acceso → redirigir a ruta por defecto del rol
      return navigateTo(authStore.defaultRoute)
    }
  }
})
```

**Propósito:** Verificar que el usuario tiene uno de los roles permitidos en la ruta

---

### 4C. Cómo usar en páginas

**Patrón estándar en `definePageMeta`:**

```typescript
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],  // ← Solo ADMIN puede acceder
})
```

**Ejemplo con múltiples roles:**

```typescript
definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],  // ← O ADMIN o SUPERADMIN
})
```

**Ejemplo: Página de usuarios** [dashboard/empleados/admin/usuarios.vue](pages/dashboard/empleados/admin/usuarios.vue)

```typescript
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],  // Solo ADMIN puede acceder
})
```

Si un usuario con rol `cliente` intenta acceder:
1. Role middleware intercepta la ruta
2. Compara `cliente` con `[ADMIN]`
3. No coincide → redirige a `authStore.defaultRoute` (que para cliente es `/dashboard/cliente`)

---

## 🎨 5. Configuraciones de Rol

**Archivo:** [utils/constants.ts](utils/constants.ts)

### 5A. Labels (Etiquetas legibles)

```typescript
export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'SuperAdministrador',
  admin: 'Administrador',
  recepcionista: 'Recepcionista',
  cliente: 'Cliente',
  cafeteria: 'Cafetería',
  lavanderia: 'Lavandería',
  spa: 'Spa',
  room_service: 'Room Service',
}
```

### 5B. Colores (Para UI)

```typescript
export const ROLE_COLORS: Record<string, string> = {
  superadmin: 'success',
  admin: 'error',
  recepcionista: 'warning',
  cliente: 'primary',
  cafeteria: 'orange',
  // ...
}
```

### 5C. Iconos (Para UI)

```typescript
export const ROLE_ICONS: Record<string, string> = {
  superadmin: 'mdi-shield-admin',
  admin: 'mdi-shield-crown',
  recepcionista: 'mdi-account-tie',
  cliente: 'mdi-account',
  // ...
}
```

### 5D. Rutas por defecto

```typescript
export const ROLE_DEFAULT_ROUTE: Record<string, string> = {
  superadmin: '/dashboard/empleados/superadmin',
  admin: '/dashboard/empleados/admin',
  recepcionista: '/dashboard/empleados/recepcionista',
  cliente: '/dashboard/cliente',
  cafeteria: '/dashboard/empleados/area',
  // ...
}
```

**Uso:** Cuando rediriges sin destino específico, se va a la ruta por defecto de su rol

---

## 🗺️ 6. Navegación por Rol

**Archivo:** [composables/useRoleNavigation.ts](composables/useRoleNavigation.ts)

El composable define qué items. aparecen en el sidebar según el rol:

```typescript
const navigationSections = computed((): NavSection[] => {
  const role = authStore.userRole

  switch (role) {
    case UserRole.SUPERADMIN:
      return [
        {
          title: 'Principal',
          items: [
            { title: 'Dashboard', icon: '...', to: '...' },
          ],
        },
        {
          title: 'Operaciones',
          items: [/* ... */],
        },
        // ...
      ]

    case UserRole.ADMIN:
      return [
        // Menos opciones que SUPERADMIN
      ]

    case UserRole.RECEPCIONISTA:
      return [
        // Solo items relevantes para recepción
      ]
    
    // ...
  }
})
```

**Uso en NavigationDrawer:**
```typescript
<v-list nav>
  <template v-for="item in navigationSections.value">
    <v-list-item :to="item.to" />
  </template>
</v-list>
```

---

## 🔄 7. Auth Store

**Archivo:** [stores/auth.ts](stores/auth.ts) — Getters importantes:

```typescript
getters: {
  isAuthenticated: (state): boolean => !!state.token && !!state.user,
  userRole: (state): UserRole | null => {
    if (!state.user?.role) return null
    return state.user.role.toLowerCase() as UserRole
  },
  userName: (state) => state.user?.fullName || '',
  userEmail: (state) => state.user?.email || '',
  defaultRoute(): string {
    const role = this.user?.role?.toLowerCase()
    return ROLE_DEFAULT_ROUTE[role as UserRole] || '/dashboard'
  },
}
```

---

## 📊 Flujo Completo: Cómo Funciona

```
┌─────────────────────────────────────────────────────────────┐
│ Usuario accede a /dashboard/empleados/admin/usuarios        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
        ┌──────────────────────────────┐
        │ 1. Router procesa la ruta    │
        │    definePageMeta ejecuta    │
        └──────────────────┬───────────┘
                           ↓
        ┌──────────────────────────────┐
        │ 2. Middleware 'auth' corre   │
        │    ¿authStore.isAuthenticated? │
        └──────────────────┬───────────┘
                           ↓
                  ┌────────┴────────┐
                  NO               SÍ
                  ↓                 ↓
            Ir a /login    Continuar (3)
                           ↓
        ┌──────────────────────────────┐
        │ 3. Middleware 'role' corre   │
        │    Lee meta.roles             │
        │    = [UserRole.ADMIN]        │
        └──────────────────┬───────────┘
                           ↓
        ┌──────────────────────────────┐
        │ 4. Compara con user.role     │
        │    user.role = 'recepcionista'│
        └──────────────────┬───────────┘
                           ↓
              ¿'recepcionista' in ['admin']?
                           ↓
                  ┌────────┴────────┐
                  NO               SÍ
                  ↓                 ↓
        Ir a defaultRoute    Cargar página
        p/su rol             /dashboard/empleados/
        (/dashboard/         admin/usuarios
         empleados/
         recepcionista)
```

---

## 💡 Patrones Actuales de Validación

### Patrón 1: En rutas (más restrictivo)

```typescript
// Página de usuarios — solo ADMIN
definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],  // ← Hard constraint
})
```

**Ventaja:** Imposible que un usuario sin permiso vea la página
**Desventaja:** No tan flexible, el rol es rígido

---

### Patrón 2: En componentes (más flexible)

```typescript
// Dentro de un componente
const { can, hasRole } = usePermissions()

// Mostrar botón solo si tiene permiso
<v-btn v-if="can('manage_users')">
  Gestionar Usuarios
</v-btn>

// O mostrar para ciertos roles
<v-alert v-if="hasRole('admin')">
  Contenido solo para admins
</v-alert>
```

**Ventaja:** Misma página, diferente contenido según permisos
**Desventaja:** Requiere validación manual, más código

---

### Patrón 3: Combinado (Recomendado)

```typescript
// Nivel 1: Guardar la página
definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})

// Nivel 2: Dentro, mostrar según permisos granulares
const { can } = usePermissions()

// Admin ve básico
// SuperAdmin ve avanzado
<div v-if="can('manage_hotels')">
  Configuración de hoteles (solo SUPERADMIN)
</div>
```

---

## 🚀 Cómo Agregar Nuevas Reglas de Permiso

### Paso 1: Agregar permiso a la matriz

**Archivo:** `composables/usePermissions.ts`

```typescript
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'manage_users',
    'manage_rooms',
    // ...
    'manage_tax_profiles',  // ← NUEVO PERMISO
  ],
  recepcionista: [
    'manage_reservations',
    // ← NO agregar si solo admin debe tenerlo
  ],
  // ...
}
```

### Paso 2: Usar en componentes/páginas

```typescript
import { usePermissions } from '~/composables/usePermissions'

const { can } = usePermissions()

// En componente
<v-btn v-if="can('manage_tax_profiles')">
  Gestionar Perfiles Tributarios
</v-btn>

// O en página meta
definePageMeta({
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})
```

### Paso 3: (Opcional) Mapear a ruta de navegación

**Archivo:** `composables/useRoleNavigation.ts`

```typescript
case UserRole.ADMIN:
  return [
    {
      title: 'Administración',
      items: [
        { 
          title: 'Impuestos',
          icon: 'mdi-calculator',
          to: '/dashboard/empleados/admin/impuestos'  // ← NUEVA RUTA
        },
      ],
    },
  ]
```

---

## 🔍 Ejemplos de Uso Real en el Código

### Ejemplo 1: Guard en ruta

[pages/dashboard/empleados/admin/usuarios.vue](pages/dashboard/empleados/admin/usuarios.vue)

```typescript
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN],  // Solo ADMIN accede
})
```

---

### Ejemplo 2: Switch en useRoleNavigation

[composables/useRoleNavigation.ts](composables/useRoleNavigation.ts)

```typescript
const navigationSections = computed((): NavSection[] => {
  const role = authStore.userRole

  switch (role) {
    case UserRole.SUPERADMIN:
      return [/* Todas las opciones */]
    case UserRole.ADMIN:
      return [/* Menos opciones */]
    case UserRole.RECEPCIONISTA:
      return [/* Solo lo relevante */]
    // ...
  }
})
```

---

### Ejemplo 3: Mostrar componente según rol

[components/shared/NavigationDrawer.vue](components/shared/NavigationDrawer.vue)

```typescript
<v-list nav>
  <template v-for="(section, sIndex) in nav.navigationSections.value">
    <v-list-item
      v-for="item in section.items"
      :key="item.to"
      :to="item.to"
      :title="item.title"
    />
  </template>
</v-list>
```

Los items mostrados dependen del rol → `navigationSections` es diferente por rol

---

## 🎯 Resumen de Puntos Clave

| Aspecto | Ubicación | Patrón |
|---------|-----------|--------|
| **Matriz de permisos** | `composables/usePermissions.ts` | `ROLE_PERMISSIONS: Record<role, string[]>` |
| **Verificar permisos** | En componentes | `can('permiso')`, `canAny(...)`, `canAll(...)` |
| **Verificar rol** | En páginas/componentes | `hasRole(role)`, `hasAnyRole(...)` |
| **Guard de actividad** | `middleware/role.ts`, `definePageMeta` | `roles: [UserRole.ADMIN]` |
| **Navegación** | `composables/useRoleNavigation.ts` | Switch por role |
| **Etiquetas/Colores** | `utils/constants.ts` | `ROLE_LABELS`, `ROLE_COLORS`, etc. |
| **Almacén** | `stores/auth.ts` | `authStore.user.role` |

---

## 📝 Próximos Pasos para Agregar Nuevas Reglas

1. **Identifica el nivel:**
   - ¿A nivel de ruta (página completa)? → Usa `roles: [...]` en `definePageMeta`
   - ¿A nivel granular (botón/componente)? → Usa `usePermissions()`

2. **Agrega a la matriz:**
   ```typescript
   // usePermissions.ts
   admin: ['manage_users', ..., 'tu_nuevo_permiso']
   ```

3. **Usa en el código:**
   ```typescript
   <v-btn v-if="can('tu_nuevo_permiso')">Acción</v-btn>
   ```

4. **Testa con diferentes roles:** Verifica que solo el rol correcto ve la opción

---

## ⚠️ Consideraciones Importantes

### Seguridad Backend

⚠️ **IMPORTANTE:** Los permisos en el frontend son **solo para UX**. El backend DEBE validar:

```typescript
// En backend (NestJS)
@UseGuards(AuthGuard('jwt'))
@Post('/admin/usuarios')
@Roles(UserRole.ADMIN)  // ← Guard de rol en backend
createUser(@Body() dto: CreateUserDto) {
  // ...
}
```

**NO confiar en frontend.** Un usuario malintencionado puede:
- Cambiar localStorage
- Modificar JavaScript en DevTools
- Hacer requests directamente a la API

---

### Consistencia Caso

Todos los roles se normalizan a **minúsculas**:
```typescript
const userRole = authStore.userRole?.toLowerCase()
```

Esto evita bugs por inconsistencia `'Admin'` vs `'admin'` vs `'ADMIN'`

---

