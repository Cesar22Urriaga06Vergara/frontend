# 📌 Referencia Rápida: Sistema de Permisos

## Vista de 30 segundos

```typescript
// 1. AGREGAR PERMISO
composables/usePermissions.ts:
  admin: ['manage_users', 'tu_permiso_aqui']  // ← Agrega aquí

// 2. USAR EN COMPONENTE
<v-btn v-if="can('tu_permiso_aqui')">Acción</v-btn>

// 3. PROTEGER PÁGINA
definePageMeta({
  roles: [UserRole.ADMIN]  // ← Solo ADMIN accede
})
```

---

## 🔑 Conceptos Clave

| Concepto | Archivo | Uso |
|----------|---------|-----|
| **Matriz de permisos** | `usePermissions.ts` | `ROLE_PERMISSIONS: { admin: ['...'] }` |
| **Verificar permiso** | Cualquier componente | `const { can } = usePermissions()` |
| **Verificar rol** | Cualquier componente | `const { hasRole } = usePermissions()` |
| **Proteger ruta** | `pages/*.vue` | `definePageMeta({ roles: [...] })` |
| **Datos del usuario** | `stores/auth.ts` | `authStore.user.role` |
| **Navegar según rol** | `useRoleNavigation.ts` | Items diferentes por rol |
| **Constantes** | `utils/constants.ts` | Labels, colores, iconos, rutas |

---

## 🎯 3 Niveles de Control

### Nivel 3: Proteger página (más seguro)
```typescript
definePageMeta({
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN]  // ← Redirige si no es ADMIN
})
```

### Nivel 2: Navegar según rol (invisible)
```typescript
useRoleNavigation() → items diferentes → usuario no ve opción
```

### Nivel 1: Mostrar según permiso (mejor UX)
```typescript
<v-btn v-if="can('permiso')">Acción</v-btn>
```

**Recomendación: Usa Nivel 3 para secciones, Nivel 1 para acciones**

---

## 🛠️ 3 Pasos para Agregar Nuevo Permiso

### Step 1: Agregar string
```typescript
// composables/usePermissions.ts
admin: ['manage_users', ..., 'mi_permiso']  // ← Agrega
```

### Step 2: Usar en el código
```typescript
// En .vue
<v-btn v-if="can('mi_permiso')">Hacer algo</v-btn>
```

### Step 3: Proteger ruta (si es página)
```typescript
// En pages/*.vue
definePageMeta({
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN]
})
```

---

## 📚 API usePermissions()

```typescript
const { 
  can,              // can('permiso') → boolean
  canAny,           // canAny('a', 'b') → boolean (OR)
  canAll,           // canAll('a', 'b') → boolean (AND)
  hasRole,          // hasRole('admin') → boolean
  hasAnyRole,       // hasAnyRole('admin', 'superadmin') → boolean
  userPermissions,  // computed → string[]
} = usePermissions()
```

---

## 🚨 Anti-Patrones

```typescript
// ❌ NO: Hardcodear rol
if (authStore.userRole === 'admin')

// ✅ SÍ: Usar permiso
if (can('manage_users'))

// ❌ NO: Olvidar validación en backend
frontend solo valida → Backend acepta a todos

// ✅ SÍ: Validar en ambos lados
frontend: can('permiso')
backend: @Roles(UserRole.ADMIN)
```

---

## 👥 Roles Disponibles

```typescript
SUPERADMIN     → Todos los permisos
ADMIN          → Casi todos (excluye manage_hotels)
RECEPCIONISTA  → manage_reservations, checkin_checkout, view_reports
CAFETERIA      → manage_orders
LAVANDERIA     → manage_orders
SPA            → manage_orders
ROOM_SERVICE   → manage_orders
CLIENTE        → Sin permisos especiales
```

---

## 📁 Archivos Clave

| Ruta | Para qué |
|------|----------|
| `composables/usePermissions.ts` | Matriz de permisos |
| `utils/constants.ts` | Labels, colores, iconos, rutas por rol |
| `composables/useRoleNavigation.ts` | Items de navegación por rol |
| `middleware/role.ts` | Guard que valida roles en rutas |
| `stores/auth.ts` | Datos del usuario logueado |
| `types/auth.ts` | Enum UserRole |

---

## 🧪 Quick Test

```typescript
// En componente o consola:
const { can, hasRole } = usePermissions()

console.log(can('manage_users'))          // ¿Tiene permiso?
console.log(hasRole('admin'))             // ¿Es admin?
console.log(can('permiso_inexistente'))   // Devuelve false (safe)
```

---

## 🔄 Checklist Implementación

- [ ] Agregar permiso en `ROLE_PERMISSIONS`
- [ ] Usar `can('permiso')` en componentes
- [ ] (Opcional) Agregar a `navigationSections`
- [ ] (Si es página) Usar `roles: [...]` en `definePageMeta`
- [ ] Test: cada rol debe ver/hacer lo correcto
- [ ] Backend: validar con `@Roles()`

---

## ⚠️ Importante

**Frontend = UX only, Backend = Security**

Cualquiera puede modificar localStorage o ejecutar `authStore.user.role = 'admin'` en consola.

**SIEMPRE validar en backend.**

---

