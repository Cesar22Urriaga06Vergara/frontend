# 📊 Diagramas: Sistema de Permisos

## 1. Flujo de Autenticación y Autorización

```
┌─────────────────────────────────────────────────────────────┐
│ Usuario intenta acceder a /dashboard/empleados/admin/facturas│
└──────────────────────┬──────────────────────────────────────┘
                       ↓
        ┌─────────────────────────────────┐
        │ Vue Router intercepta la ruta   │
        │ → Ejecuta middleware            │
        └──────────┬──────────────────────┘
                   ↓
        ┌─────────────────────────────────┐
        │ Middleware: 'auth'              │
        │ ¿Token + user existen?          │
        └──────────┬──────────────────────┘
                   ↓
          ┌────────┴────────┐
          NO               SÍ
          ↓                 ↓
       /login          Continuar (2)
                           ↓
        ┌─────────────────────────────────┐
        │ Middleware: 'role'              │
        │ Lee meta.roles de la ruta       │
        │ = [UserRole.ADMIN]              │
        └──────────┬──────────────────────┘
                   ↓
        ┌─────────────────────────────────┐
        │ Compara:                        │
        │ user.role.toLowerCase()         │
        │ vs roles en meta                │
        └──────────┬──────────────────────┘
                   ↓
              ┌────┴────┐
              NO       SÍ
              ↓        ↓
         Ir a      Cargar
      defaultRoute página
      para su rol   ✅
```

---

## 2. Matriz de Permisos por Rol

```
┌─────────────────────────────────────────────────────────────┐
│ SUPERADMIN (Todos menos manage_hotels)    ADMIN (Menos)    │
│  ├─ manage_users                          ├─ manage_users  │
│  ├─ manage_rooms                          ├─ manage_rooms  │
│  ├─ manage_reservations       ────────→  ├─ manage_reser. │
│  ├─ manage_orders                        ├─ manage_orders │
│  ├─ manage_services                      ├─ manage_servic │
│  ├─ view_reports                         ├─ view_reports  │
│  ├─ checkin_checkout                     ├─ checkin_chuck │
│  ├─ manage_hotels             ─────────✗ ├─ manage_ameniti│
│  └─ manage_amenities                     └─ (sin manage_ho│
├─────────────────────────────────────────────────────────────┤
│ RECEPCIONISTA (Limitado)                 CLIENTE (Ninguno)│
│  ├─ manage_reservations                  ├─ (lista vacía) │
│  ├─ checkin_checkout                     │  Solo ver      │
│  └─ view_reports                         │  facturas      │
├─────────────────────────────────────────────────────────────┤
│ CAFETERIA, LAVANDERIA, SPA, ROOM_SERVICE (Solo manage_orde│
│  └─ manage_orders                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Arquitectura de Permisos

```
                    ┌──────────────────────┐
                    │  User en localStorage │
                    │  + Pinia auth.store   │
                    └──────────┬───────────┘
                               ↓
          ┌────────────────────────────────────┐
          │ authStore.user.role: UserRole      │
          │ (normalizado a minúsculas)         │
          └────────────┬───────────────────────┘
                       ↓
       ┌───────────────────────────────────────┐
       │ composables/usePermissions.ts         │
       │                                       │
       │ ROLE_PERMISSIONS = {                │
       │   'admin': ['manage_users', ...],  │
       │   'recepcionista': [...],         │
       │   ...                             │
       │ }                                   │
       │                                    │
       │ can(permiso)     ← Lee matriz     │
       │ canAny(...)                       │
       │ canAll(...)                       │
       │ hasRole(rol)                      │
       │ userPermissions (computed)        │
       └───────────┬───────────────────────┘
                   ↓
       ┌───────────────────────────────────────┐
       │ Uso en componentes:                   │
       │                                       │
       │ <v-btn v-if="can('manage_users')">  │
       │ <div v-if="hasRole('admin')">       │
       │ <v-alert v-if="canAny(...)">        │
       └───────────────────────────────────────┘
```

---

## 4. Flujo de Componente con Permisos

```
┌─────────────────────────────────────────────────────────────┐
│ Componente: EmpleadosUsersTable.vue                         │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
        ┌─────────────────────────────────┐
        │ const { can } = usePermissions()│
        │ can('manage_users') = ?         │
        └──────────┬──────────────────────┘
                   ↓
              ┌────┴────┐
              YES       NO
              ↓         ↓
    ┌──────────────────┐  ┌──────────────────┐
    │ Mostrar:         │  │ Ocultar:         │
    │ - Tabla datos    │  │ - Botón crear    │
    │ - Botón crear    │  │ - Botón editar   │
    │ - Botón editar   │  │ - Botón eliminar │
    │ - Botón eliminar │  │                  │
    │ - Botón acciones │  │ O mostrar alert  │
    │                  │  │ "Sin permiso"    │
    └──────────────────┘  └──────────────────┘
```

---

## 5. 3 Niveles de Validación (Capas)

```
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 3: RUTA (Hard constraint - Más Seguro)              │
│                                                             │
│ definePageMeta({                                           │
│   middleware: ['auth', 'role'],                            │
│   roles: [UserRole.ADMIN]  ← Si no eres ADMIN, redirige   │
│ })                                                          │
│                                                             │
│ + Imposible acceder sin rol correcto                       │
│ - Menos flexible                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 2: NAVEGACIÓN (Invisible - Medium)                  │
│                                                             │
│ const navigationSections = computed((): NavSection[] => {  │
│   switch(role) {                                           │
│     case ADMIN: return [item1, item2, ...]                │
│     case RECEPCIONISTA: return [item1, ...]               │
│   }                                                         │
│ })                                                          │
│                                                             │
│ + Usuario no ve opciones que no puede usar                 │
│ + Reduces cognitive load                                   │
│ - Requiere mantener 2 fuentes de verdad                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ NIVEL 1: COMPONENTE (Best UX - Visible)                   │
│                                                             │
│ <v-btn v-if="can('manage_users')">                        │
│   Gestionar Usuarios                                       │
│ </v-btn>                                                   │
│                                                             │
│ + Usuario ve por qué no puede hacer algo                   │
│ + Una sola fuente de verdad (matriz de permisos)          │
│ - Más verboso en templates                                 │
└─────────────────────────────────────────────────────────────┘

RECOMENDACIÓN: Nivel 3 para secciones → Nivel 1 para acciones
```

---

## 6. Ciclo de Agregar Nuevo Permiso

```
┌─────────────────────────────────────────────────┐
│ PASO 1: Definir                                 │
│                                                  │
│ composables/usePermissions.ts:                  │
│ admin: [                                        │
│   ...,                                          │
│   'manage_tax_rates'  ← Agrega aquí            │
│ ]                                               │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│ PASO 2: Usar en Componente                      │
│                                                  │
│ <v-btn v-if="can('manage_tax_rates')">         │
│   Crear Tasa                                    │
│ </v-btn>                                        │
│                                                  │
│ const { can } = usePermissions()               │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│ PASO 3: (Opcional) Proteger Ruta                │
│                                                  │
│ definePageMeta({                                │
│   middleware: ['auth', 'role'],                 │
│   roles: [UserRole.ADMIN]                       │
│ })                                              │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│ PASO 4: (Opcional) Agregar a Navegación         │
│                                                  │
│ composables/useRoleNavigation.ts:               │
│ case UserRole.ADMIN:                            │
│   return [{                                     │
│     items: [{                                   │
│       title: 'Tasas',                           │
│       to: '/dashboard/admin/tax-rates'          │
│     }]                                          │
│   }]                                            │
└────────────┬────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────┐
│ PASO 5: Test + Backend Validation               │
│                                                  │
│ 1. Test con ADMIN → ve botón                    │
│ 2. Test con RECEPCIONISTA → no ve               │
│ 3. Backend: @Roles(UserRole.ADMIN)              │
└─────────────────────────────────────────────────┘
```

---

## 7. Seguridad: Frontend vs Backend

```
┌──────────────────────────────────────────────────────────────┐
│ FRONTEND (navegador)                                         │
│                                                              │
│ usePermissions() → can('permiso')                           │
│ ├─ ✅ Mejora UX: oculta botones innecesarios               │
│ ├─ ✅ Reduce confusión: no offers imposibles               │
│ ├─ ✅ Mejora percepción de seguridad                       │
│ └─ ❌ PERO: Cualquiera puede cambiar localStorage          │
│    → dev console: authStore.user.role = 'admin'            │
│    → localStorage.setItem('auth', ...)                    │
└──────────────────────┬───────────────────────────────────────┘
                       ↓
        ⚠️  NO CONFIAR EN FRONTEND ⚠️
                       ↓
┌──────────────────────────────────────────────────────────────┐
│ BACKEND (NestJS)                                             │
│                                                              │
│ @Post('/facturas')                                           │
│ @UseGuards(AuthGuard('jwt'))                                │
│ @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)  ← Guard     │
│ async create(@Body() dto: CreateFacturaDto) {              │
│   // Token JWT verificado                                  │
│   // Role validado desde token (no puede falsificarse)     │
│   // ✅ SEGURO: Imposible crear sin rol correcto           │
│ }                                                            │
│                                                              │
│ ✅ Backend SIEMPRE valida                                  │
│ ✅ Token JWT es signed (no puede alterarse)                │
│ ✅ Rol viene del token (verificado)                        │
└──────────────────────────────────────────────────────────────┘

REGLA DE ORO: Frontend = UX, Backend = SEGURIDAD
```

---

## 8. Diagrama de Datos del Usuario

```
┌─────────────────────────────────────────────────────┐
│ Server Response (POST /login)                       │
├─────────────────────────────────────────────────────┤
│ {                                                   │
│   user: {                                           │
│     id: 1,                                          │
│     fullName: "Juan García",                        │
│     email: "juan@hotel.com",                        │
│     role: "ADMIN",  ← Se almacena aquí            │
│     isActive: true,                                 │
│     lastLogin: "2024-03-19T..."                     │
│   },                                                │
│   token: "eyJhbGciOi..."  ← JWT firmado           │
│ }                                                   │
└────────────┬─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────┐
│ Pinia Store (auth.ts)                               │
├─────────────────────────────────────────────────────┤
│ authStore.user = {        authStore.token = JWT    │
│   id: 1                                             │
│   fullName: "Juan"                                  │
│   role: "ADMIN"  ────────────────→ Se consulta     │
│ }                                 para verificar    │
└────────────┬─────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────┐
│ usePermissions()                                    │
├─────────────────────────────────────────────────────┤
│ const role = authStore.user.role.toLowerCase()      │
│                                                     │
│ ROLE_PERMISSIONS[role] = ['manage_users', ...]    │
│                                                     │
│ can('manage_users') → true                         │
│ can('manage_hotels') → false (no en array)         │
└─────────────────────────────────────────────────────┘
```

---

## 9. Flujo Completo de una Acción

```
Usuario hace clic en "Crear Usuario"
    ↓
<v-btn @click="openCreateDialog" v-if="can('manage_users')">
    ↓
can('manage_users') = true?
    ↓
SÍ → Mostrar botón
    ↓
Usuario clica → openCreateDialog()
    ↓
Dialog abre (frontend)
    ↓
Usuario llena form y clica "Guardar"
    ↓
Composable: usersStore.createUser(data)
    ↓
Fetch POST /api/users + JWT token
    ↓
BACKEND:
  1. Verifica JWT (¿token válido?)
  2. Extrae user.role del token
  3. Verifica @Roles(ADMIN, SUPERADMIN)
  4. ¿Role coincide? 
     SÍ → crea usuario
     NO → 403 Forbidden
    ↓
Backend responde
    ↓
Frontend: if (success) notification.success()
         else notification.error()
    ↓
Actualizar tabla de usuarios
```

---

## 10. Checklist Rápido

```
✅ ¿Agregué permiso en ROLE_PERMISSIONS?
✅ ¿Lo tengo en los roles correctos?
✅ ¿Usé can('permiso') en template?
✅ ¿Testé con múltiples roles?
✅ ✅ ✅ ¿Backend también valida? (MÁS IMPORTANTE)
```

---

