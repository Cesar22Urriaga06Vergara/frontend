# 🚀 QUICK START: Agregar un Permiso en 5 Minutos

Este es el guía más rápida posible. Copia y pega.

---

## 📋 Requisito

Queremos que **solo ADMIN** pueda ver el botón "Crear Factura".

---

## 🔴 PASO 1: Agregar Permiso (2 min)

**Archivo:** `composables/usePermissions.ts`

Busca la sección:
```typescript
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
```

Agrega:
```typescript
admin: [
  'manage_users',
  'manage_rooms',
  'manage_reservations',
  'manage_orders',
  'manage_services',
  'view_reports',
  'checkin_checkout',
  'manage_amenities',
  'create_facturas',  // ← AGREGA AQUÍ
],
```

Haz lo mismo con `superadmin` si lo necesita:
```typescript
superadmin: [
  // ... otros permisos ...
  'create_facturas',  // ← AGREGA AQUÍ
],
```

---

## 🟢 PASO 2: Usar en Componente (2 min)

**Archivo:** `pages/dashboard/empleados/admin/facturas.vue`

En el template:
```vue
<template>
  <!-- Othercontenido aquí -->

  <!-- Botón: solo visible si tiene permiso -->
  <v-btn
    v-if="can('create_facturas')"  ← AGREGA ESTO
    color="success"
    prepend-icon="mdi-file-plus"
    @click="openCreateDialog"
  >
    Crear Factura
  </v-btn>
</template>

<script setup lang="ts">
import { usePermissions } from '~/composables/usePermissions'  ← IMPORT

export default {
  setup() {
    const { can } = usePermissions()  ← OBTÉN can()

    return {
      can,  ← EXPÓN para template
    }
  }
}
```

O con Composition API (más común):
```typescript
<script setup lang="ts">
import { usePermissions } from '~/composables/usePermissions'

const { can } = usePermissions()  ← Ya está disponible en template
</script>
```

---

## 🟡 PASO 3: Test (1 min)

En DevTools → Consola:
```javascript
// Abre la consola del navegador (F12)

// Test 1: Como ADMIN
authStore.user.role = 'admin'
// Recarga (F5)
// Espera que el botón APAREZCA ✅

// Test 2: Como RECEPCIONISTA
authStore.user.role = 'recepcionista'
// Recarga (F5)
// Espera que el botón NO APAREZCA ❌
```

---

## ⭐ RESULTADO

```
Antes:
┌──────────────────────────────────┐
│ Tabla de facturas                │
│ (sin botón de crear)             │
└──────────────────────────────────┘

Después (como ADMIN):
┌──────────────────────────────────┐
│ [✓ Crear Factura]                │  ← Aparece
│ Tabla de facturas                │
└──────────────────────────────────┘

Después (como RECEPCIONISTA):
┌──────────────────────────────────┐
│ Tabla de facturas                │
│ (sin botón de crear)             │  ← NO aparece
└──────────────────────────────────┘
```

---

## 🎯 Eso es Todo

Total: 5 minutos
Líneas de código: 5 (2 en composable + 3 en template)
Complejidad: Nada

---

## 💡 Próxima Escalada (Opcional)

### Si quieres PROTEGER LA PÁGINA ENTERA:

**Archivo:** `pages/dashboard/empleados/admin/facturas.vue`

```typescript
// Al tope del script:
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],  ← AGREGAR ESTO
})
```

**Resultado:** Si un RECEPCIONISTA intenta acceder a `/dashboard/empleados/admin/facturas`, es redirigido automáticamente a su ruta por defecto.

---

## 🔐 AGREGADO CRÍTICO: Backend

En tu NestJS:

```typescript
@Post('/facturas')
@UseGuards(AuthGuard('jwt'))
@Roles(UserRole.ADMIN, UserRole.SUPERADMIN)  ← AGREGAR
async create(@Body() dto: CreateFacturaDto) {
  // ...
}
```

**SIN ESTO:** Un atacante puede:
1. Cambiar `localStorage` en DevTools
2. Hacer POST a `/api/facturas` directamente
3. Crear facturas aunque sea CLIENTE

**CON ESTO:** Imposible falsificar el token JWT, backend rechaza.

---

## 🧪 Antes de Ir a Producción

- [ ] Frontend: botón aparece/desaparece correctly
- [ ] Backend: @Roles() está en el endpoint
- [ ] Test con ADMIN → crea factura ✅
- [ ] Test con RECEPCIONISTA → error 403 ❌
- [ ] Test con CLIENTE → error 403 ❌

---

## 📚 Si Necesitas Más Detalles

- Para entender qué pasa → [DIAGRAMAS_SISTEMA_PERMISOS.md](DIAGRAMAS_SISTEMA_PERMISOS.md)
- Para diferentes casos → [EJEMPLO_FACTURAS_PERMISOS.md](EJEMPLO_FACTURAS_PERMISOS.md)
- Para debugging → [ANALISIS_SISTEMA_PERMISOS.md](ANALISIS_SISTEMA_PERMISOS.md)
- Para rápida referencia → [REFERENCIA_RAPIDA_PERMISOS.md](REFERENCIA_RAPIDA_PERMISOS.md)

---

**Tiempo total:** 5 minutos  
**Dificultad:** Fácil  
**Líneas de código:** 5  
**Complejidad:** Nada  

Go build! 🚀

