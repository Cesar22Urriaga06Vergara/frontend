# 🔴 DEBUG REPORT - Dashboard Vue Import Issues

**Fecha:** 15/03/2026  
**Problema:** Vistas rotas después de refactor de arquitectura basado en roles

---

## 📋 RESUMEN EJECUTIVO

Se encontraron **problemas críticos de imports** en múltiples archivos. Varios archivos usan `ref()` y `computed()` sin importarlos de Vue, causando que las vistas no rendericen correctamente.

**Estado:** 🔴 CRÍTICO - 8+ archivos afectados  
**Impacto:** Las vistas no cargan datos, componentes vacíos, errores en consola

---

## 🔍 PROBLEMAS ENCONTRADOS

### IMPORT ERROR #1
**Archivo:** `pages/dashboard/staff/recepcionista/checkout.vue`  
**Línea:** 454-461  
**Problema:** Usa `ref()` y `computed()` pero NO los importa de Vue  
**Síntomas:**
- Línea 477-489: Define múltiples `const X = ref()`
- Línea 516-545: Define múltiples `const X = computed()`
- Error en compile: `ref is not defined` / `computed is not defined`

**Código problemático:**
```typescript
// ❌ INCORRECTO - FALTA IMPORT
<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'
// ... otros imports ...
// ❌ FLT: import { ref, computed } from 'vue'

// Pero luego usa:
const cedulaConfirm = ref('')  // ❌ ref no existe
const reservasConfirmadas = computed(() => {...}) // ❌ computed no existe
```

**Solución:**  
Agregar esta línea después de los imports del script:
```typescript
import { computed, ref, onMounted } from 'vue'
```

---

### IMPORT ERROR #2
**Archivo:** `pages/dashboard/staff/users.vue`  
**Línea:** 57  
**Problema:** Usa `ref()` y `computed()` sin importar  
**Síntomas:**
- Línea 72: `const selectedUser = ref<User | null>(null)`
- Línea 77-102: Múltiples `computed()` sin definir
- Vista de gestión de usuarios completamente no funcional

**Solución:**  
Agregar después de `<script setup lang="ts">`:
```typescript
import { computed, ref } from 'vue'
```

---

### IMPORT ERROR #3
**Archivo:** `pages/dashboard/staff/users-[id].vue`  
**Línea:** 222  
**Problema:** Usa `ref()` sin importar  
**Síntomas:**
- Línea 238-243: Define múltiples `ref()`
- No se pueden editar usuarios individuales

**Solución:**  
Agregar:
```typescript
import { computed, ref, onMounted } from 'vue'
```

---

### IMPORT ERROR #4
**Archivo:** `pages/dashboard/staff/rooms.vue`  
**Línea:** 8  
**Problema:** Script vacío o incompleto, probable que falta contenido  
**Síntomas:**
- La página de habitaciones no carga

**Recomendación:**  
Revisar estructura completa del archivo

---

### IMPORT ERROR #5
**Archivo:** `pages/dashboard/staff/room-types.vue`  
**Línea:** 8  
**Problema:** Similar a rooms.vue, script incompleto  
**Síntomas:**
- La página de tipos de habitación no carga

---

### IMPORT ERROR #6  
**Archivo:** `pages/dashboard/staff/services.vue`  
**Línea:** 229-230  
**Status:** ✅ CORRECTO  
Tiene imports correctos (`import { ref, computed, onMounted } from 'vue'`)

---

## 📊 SUMMARY TABLE

| Archivo | Línea | ref | computed | onMounted | Problema |
|---------|-------|-----|----------|-----------|----------|
| `pages/dashboard/staff/recepcionista/checkout.vue` | 454 | ❌ | ❌ | ❌ | **CRÍTICO** |
| `pages/dashboard/staff/users.vue` | 57 | ❌ | ❌ | ❌ | **CRÍTICO** |
| `pages/dashboard/staff/users-[id].vue` | 222 | ❌ | ❌ | ❌ | **CRÍTICO** |
| `pages/dashboard/staff/rooms.vue` | 8 | ❓ | ❓ | ❓ | INCOMPLETO |
| `pages/dashboard/staff/room-types.vue` | 8 | ❓ | ❓ | ❓ | INCOMPLETO |
| `pages/dashboard/staff/services.vue` | 229 | ✅ | ✅ | ✅ | OK |
| `pages/dashboard/staff/checkout.vue` | 160 | ✅ | ✅ | ✅ | OK |
| `pages/dashboard/staff/area.vue` | 304 | ✅ | ✅ | ✅ | OK |

---

## 🚨 ARCHIVOS CRÍTICOS QUE NECESITAN REPARACIÓN

### 1. `pages/dashboard/staff/recepcionista/checkout.vue`

**Current (❌ BROKEN):**
```typescript
<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'
import { useServiciosStore } from '~/stores/servicios'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import type { Reserva } from '~/types/api'
import type { CuentaReserva } from '~/types/servicios'
// ❌ FALTA: import { computed, ref, onMounted } from 'vue'
```

**Fixed (✅ CORRECT):**
```typescript
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useReservasStore } from '~/stores/reservas'
import { useServiciosStore } from '~/stores/servicios'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
import type { Reserva } from '~/types/api'
import type { CuentaReserva } from '~/types/servicios'
```

---

### 2. `pages/dashboard/staff/users.vue`

**Current (❌ BROKEN):**
```typescript
<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import type { User } from '~/types/auth'
// ❌ FALTA: import { computed, ref } from 'vue'
```

**Fixed (✅ CORRECT):**
```typescript
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUsersStore } from '~/stores/users'
import { useNotification } from '~/composables/useNotification'
import { UserRole } from '~/types/auth'
import type { User } from '~/types/auth'
```

---

### 3. `pages/dashboard/staff/users-[id].vue`

**Current (❌ BROKEN):**
```typescript
<script setup lang="ts">
import { useUsersStore } from '~/stores/users'
import type { User } from '~/types/auth'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
// ❌ FALTA: import { computed, ref, onMounted } from 'vue'
```

**Fixed (✅ CORRECT):**
```typescript
<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useUsersStore } from '~/stores/users'
import type { User } from '~/types/auth'
import { useNotification } from '~/composables/useNotification'
import { useAuthStore } from '~/stores/auth'
import { UserRole } from '~/types/auth'
```

---

## 🔧 PLAN DE ACCIÓN  

### Paso 1: Reparar imports críticos (INMEDIATO)
- [ ] `pages/dashboard/staff/recepcionista/checkout.vue` - AGREGAR: `import { computed, ref, onMounted } from 'vue'`
- [ ] `pages/dashboard/staff/users.vue` - AGREGAR: `import { computed, ref } from 'vue'`
- [ ] `pages/dashboard/staff/users-[id].vue` - AGREGAR: `import { computed, ref, onMounted } from 'vue'`

### Paso 2: Investigar archivos incompletos
- [ ] `pages/dashboard/staff/rooms.vue` - Revisar estructura completa
- [ ] `pages/dashboard/staff/room-types.vue` - Revisar estructura completaEste es un bug silencioso: los archivos compilan pero Vue no puede renderizar porque falta la función `ref()` en el scope.

### Paso 3: Validación
- [ ] Ejecutar `npm run build` después de los cambios
- [ ] Recargar navegador y verificar que las vistas cargan datos
- [ ] Abrir consola del navegador y confirmar que NO hay errores de "ref/computed is not defined"

---

## 📝 NOTAS IMPORTANTES

1. **Componentes duplicados:** Hay archivos en dos ubicaciones:
   - `pages/dashboard/staff/checkout.vue` ✅ CORRECTO
   - `pages/dashboard/staff/recepcionista/checkout.vue` ❌ ROTO
   
   Es probable quequerías mover la lógica de uno a otro durante el refactor de arquitectura basado en roles.

2. **Refactor incompleto:** Parece que en el refactor se mudaron archivos pero no se actualizaron completamente los imports.

3. **Auto-import de Vue deshabilitado:** Los archivos confían en que Vue auto-importa `ref` y `computed`, pero eso pueden no estar habilitado en tu `nuxt.config.ts`.

---

## ✅ VERIFICACIÓN POST-FIX

Después de hacer los cambios, verifica lo siguiente:

```bash
# 1. Reconstruir el proyecto
npm run build

# 2. En desarrollo
npm run dev

# 3. En consola del navegador (F12):
# - NO debe haber errores "is not defined"
# - Las vistas deben cargar con datos
# - No debe haber advertencias de componentes no registrados
```

---

**Generado:** Script de análisis automático  
**Próximo paso:** Ejecutar fixes de immediatamente
