# Guía Práctica: Agregar Nuevas Reglas de Permiso

## 📋 Escenario: Agregar control de permisos para Gestión de Impuestos

Suponiendo que quieres:
- ✅ Que solo **ADMIN** y **SUPERADMIN** creen/editen tasas impositivas
- ✅ Que **RECEPCIONISTA** pueda ver reportes de impuestos pero no editarlos
- ✅ Un nuevo permiso granular: `manage_tax_rates`

---

## 🔧 Paso 1: Agregar permiso a la matriz

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
    'manage_tax_rates',      // ✅ NUEVO
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
    'manage_tax_rates',      // ✅ NUEVO
  ],
  
  recepcionista: [
    'manage_reservations',
    'checkin_checkout',
    'view_reports',
    // ❌ NO 'manage_tax_rates' — no puede editar
  ],
  
  // ...resto de roles sin 'manage_tax_rates'
}
```

---

## 🌐 Paso 2A: Proteger página a nivel de ruta

**Si quieres una página SOLO para ADMIN:**

**Archivo:** `pages/dashboard/empleados/admin/impuestos.vue` (nueva)

```typescript
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],  // ← Solo estos roles acceden
})
```

**Resultado:** Cualquier otro rol intentando acceder es redirigido a su `defaultRoute`

---

## 🌐 Paso 2B: Control granular en componentes

**Si quieres misma página pero diferente contenido:**

**Archivo:** En cualquier componente/página

```vue
<template>
  <div>
    <!-- Sección visible para ADMIN/SUPERADMIN -->
    <div v-if="can('manage_tax_rates')">
      <h2>Gestión de Tasas Impositivas</h2>
      
      <v-btn @click="openCreateDialog">
        Crear nueva tasa
      </v-btn>
      
      <table>
        <tr v-for="rate in taxRates">
          <td>{{ rate.categoria }}</td>
          <td>{{ rate.porcentaje }}%</td>
          <td>
            <v-btn @click="editRate(rate)">Editar</v-btn>
            <v-btn @click="deleteRate(rate)">Eliminar</v-btn>
          </td>
        </tr>
      </table>
    </div>

    <!-- Sección visible para RECEPCIONISTA (solo lectura) -->
    <div v-if="!can('manage_tax_rates') && hasRole('recepcionista')">
      <v-alert type="info">
        Contenido de solo lectura para recepcionistas
      </v-alert>
      
      <table>
        <tr v-for="rate in taxRates">
          <td>{{ rate.categoria }}</td>
          <td>{{ rate.porcentaje }}% (solo lectura)</td>
        </tr>
      </table>
    </div>

    <!-- Sección oculta para otros roles -->
    <div v-else>
      <v-alert type="warning">
        No tienes permiso para ver esta sección
      </v-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '~/composables/usePermissions'

const { can, hasRole } = usePermissions()
const taxRates = ref([])

// Cargar datos según permisos
onMounted(async () => {
  if (can('manage_tax_rates')) {
    // Cargar tasas editables
    await loadEditableTaxRates()
  } else if (hasRole('recepcionista')) {
    // Cargar tasas de solo lectura
    await loadReadOnlyTaxRates()
  }
})
</script>
```

---

## 🎨 Paso 3: Agregar a la navegación

**Archivo:** [composables/useRoleNavigation.ts](composables/useRoleNavigation.ts)

Busca el caso para `ADMIN` y agrega:

```typescript
case UserRole.ADMIN:
  return [
    {
      title: 'Principal',
      items: [
        { title: 'Inicio', icon: 'mdi-view-dashboard-outline', to: '/dashboard/empleados/admin' },
      ],
    },
    {
      title: 'Administración',  // ← O crear nueva sección
      items: [
        { title: 'Usuarios', icon: 'mdi-account-group-outline', to: '/dashboard/empleados/admin/usuarios' },
        { 
          title: 'Tasas Impositivas',  // ← NUEVO ITEM
          icon: 'mdi-calculator',
          to: '/dashboard/empleados/admin/impuestos'
        },
        { title: 'Pedidos', icon: 'mdi-clipboard-list-outline', to: '/dashboard/empleados/admin/pedidos' },
      ],
    },
    // ...
  ]
```

Haz lo mismo para `SUPERADMIN`.

---

## 🔔 Paso 4: Ejemplo de botón condicional

**En cualquier componente:**

```vue
<template>
  <!-- Botón: solo visible si tiene permiso -->
  <v-btn 
    v-if="can('manage_tax_rates')"
    color="success"
    @click="openDialog"
  >
    Crear Tasa Impositiva
  </v-btn>

  <!-- Botón deshabilitado como fallback -->
  <v-btn 
    v-else
    disabled
    title="No tienes permiso"
  >
    Crear Tasa (sin permiso)
  </v-btn>
</template>

<script setup lang="ts">
const { can } = usePermissions()
</script>
```

---

## 🧪 Paso 5: Testing - Verificar que funciona

### Test 1: Como ADMIN

1. Login como usuario con `role: 'admin'`
2. Ir a `/dashboard/empleados/admin/impuestos`
3. ✅ Debe cargar la página
4. ✅ Botones de crear/editar/eliminar deben aparecer

### Test 2: Como RECEPCIONISTA

1. Login como usuario con `role: 'recepcionista'`
2. Ir a `/dashboard/empleados/admin/impuestos`
3. ✅ Debe redirigir a `/dashboard/empleados/recepcionista` (defaultRoute)
4. En dashboard de recepcionista, si existe sección de reportes:
   - ✅ Debe ver datos pero sin botones de edición

### Test 3: Como CLIENTE

1. Login como usuario con `role: 'cliente'`
2. Toolbar de navegación
   - ✅ NO debe haber item "Tasas Impositivas"
3. Si accedes directamente a URL:
   - ✅ Redirige a `/dashboard/cliente`

---

## 📐 Estructura Mental: Niveles de Control

```
┌─────────────────────────────────────────────────────────┐
│ NIVEL 3: Rutas (Hard constraint)                        │
│ definePageMeta({ roles: [ADMIN] })                      │
│ → Acceso rechazado → Redirige                           │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ NIVEL 2: Navegación (Unawareness)                       │
│ useRoleNavigation() → Items específicos por rol          │
│ → Item no aparece en sidebar → Usuario no sabe existe   │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ NIVEL 1: UI (Best UX)                                   │
│ <btn v-if="can('permiso')"> → Botón muestra/oculta     │
│ → Usuario ve por qué no puede hacer algo                │
└─────────────────────────────────────────────────────────┘
```

**Recomendación:** Usa NIVEL 3 para secciones completas, NIVEL 1 para acciones granulares

---

## 🔍 Verificación Rápida: ¿Está funcionando?

En Vue DevTools, Pinia tab, busca `auth` store:
```
authStore.user.role = 'admin'  ← Tu rol actual
```

En componente:
```typescript
const { can } = usePermissions()
console.log(can('manage_tax_rates'))  // true si admin/superadmin
```

---

## ❌ Anti-Patrones: Qué NO hacer

### ❌ NO: Hardcodear rol en componente

```typescript
// ❌ MALO
<btn v-if="authStore.userRole === 'admin'">
  Crear
</btn>

// ✅ BIEN
<btn v-if="can('manage_tax_rates')">
  Crear
</btn>
```

**Por qué:** Si necesitas cambiar qué roles tienen permisos, necesitas editar múltiples componentes

---

### ❌ NO: Olvidar validación en backend

```typescript
// ❌ MALO: Frontend dice "tienes permiso", pero backend acepta a cualquiera
frontend: can('manage_tax_rates') = true
backend: POST /tax-rates aceptado para cualquier rol

// ✅ BIEN: Backend también valida
frontend: can('manage_tax_rates') = true
backend: @Roles(UserRole.ADMIN) en el controller
```

---

### ❌ NO: Mezclar permisos con características de producto

```typescript
// ❌ MALO
admin: ['manage_users', 'is_beta_tester', 'get_discount']

// ✅ BIEN
// Tabla separada: User → Flags o Features
admin: ['manage_users']  // permisos
user.flags = ['beta_tester']  // características
```

---

## 🎯 Checklist de Implementación

Para agregar un nuevo permiso:

- [ ] 1. Agrega string a `ROLE_PERMISSIONS` en `usePermissions.ts`
- [ ] 2. Usa `can('permiso')` en componentes
- [ ] 3. (Opcional) Agrega a `navigationSections` en `useRoleNavigation.ts`
- [ ] 4. (Si es página dedicada) Usa `roles: [...]` en `definePageMeta`
- [ ] 5. Test con cada rol afectado
- [ ] 6. **Agrega validación en backend** (CRITICAL!)

---

## 📚 Referencias en el código

| Necesidad | Archivo | Qué mirar |
|-----------|---------|-----------|
| Ver todos los permisos | `usePermissions.ts` | `ROLE_PERMISSIONS` |
| Usar permiso en componente | `*.vue` | `const { can } = usePermissions()` |
| Proteger página | `pages/dashboard/*.vue` | `definePageMeta({ roles: [...] })` |
| Cambiar navegación | `useRoleNavigation.ts` | `navigationSections` computed |
| Constantes rol | `utils/constants.ts` | `ROLE_LABELS`, `ROLE_COLORS` |
| Datos del usuario | `stores/auth.ts` | `userRole` getter |

---

