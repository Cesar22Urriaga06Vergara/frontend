# Ejemplo Completo: Control de Permisos para Gestión de Facturas

Este documento muestra **paso a paso y con código real** cómo implementar permisos para la sección de facturas.

---

## 🎯 Requisito

> Queremos que:
> - **SUPERADMIN** pueda: ver, crear, editar, anular, cambiar estado
> - **ADMIN** pueda: ver, crear, editar, anular, cambiar estado
> - **RECEPCIONISTA** pueda: ver y cambiar estado
> - **CLIENTE** pueda: ver solo sus propias facturas
> - **Otros roles** (cafetería, etc.): sin acceso

---

## 📝 Paso 1: Definir Permisos

**Archivo:** `composables/usePermissions.ts`

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
    'view_facturas',         // ✅ NUEVO
    'create_facturas',       // ✅ NUEVO
    'edit_facturas',         // ✅ NUEVO
    'delete_facturas',       // ✅ NUEVO
    'change_factura_estado', // ✅ NUEVO
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
    'view_facturas',         // ✅ NUEVO
    'create_facturas',       // ✅ NUEVO
    'edit_facturas',         // ✅ NUEVO
    'delete_facturas',       // ✅ NUEVO
    'change_factura_estado', // ✅ NUEVO
  ],
  
  recepcionista: [
    'manage_reservations',
    'checkin_checkout',
    'view_reports',
    'view_facturas',         // ✅ Agregar
    'change_factura_estado', // ✅ Agregar (solo estado)
  ],
  
  cafeteria: ['manage_orders'],
  lavanderia: ['manage_orders'],
  spa: ['manage_orders'],
  room_service: ['manage_orders'],
  
  cliente: [
    'view_facturas',  // ✅ Ver sus propias
  ],
}
```

---

## 🛣️ Paso 2: Crear página de facturas (nivel ADMIN)

**Archivo:** `pages/dashboard/empleados/admin/facturas.vue` (nueva)

```vue
<template>
  <div class="facturas-page">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Facturas</h1>
        <p class="text-body-2 text-medium-emphasis">
          {{ totalFacturas }} facturas registradas
        </p>
      </div>

      <!-- Botón Crear: solo si tiene permiso -->
      <v-btn
        v-if="can('create_facturas')"
        color="success"
        prepend-icon="mdi-file-document-plus"
        @click="openCreateDialog"
      >
        Crear Factura
      </v-btn>
    </div>

    <!-- Tabla de facturas -->
    <v-card class="card-glow">
      <v-card-text class="pb-0">
        <!-- Filtros -->
        <v-row align="center" class="ga-2 mb-4">
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Buscar factura..."
              clearable
              hide-details
              density="compact"
            />
          </v-col>

          <v-col cols="12" sm="6" md="3">
            <v-select
              v-model="filterEstado"
              :items="estadoOptions"
              label="Estado"
              clearable
              hide-details
              density="compact"
            />
          </v-col>

          <v-spacer class="d-none d-md-block" />

          <v-col cols="auto">
            <v-btn
              icon
              variant="text"
              size="small"
              :loading="loading"
              @click="loadFacturas"
            >
              <v-icon icon="mdi-refresh" />
              <v-tooltip activator="parent">Actualizar</v-tooltip>
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>

      <v-data-table
        :headers="headers"
        :items="filteredFacturas"
        :search="search"
        :loading="loading"
        :items-per-page="10"
        :sort-by="[{ key: 'createdAt', order: 'desc' }]"
        hover
      >
        <!-- Número de Factura -->
        <template #item.numeroFactura="{ item }">
          <v-chip size="small" variant="outlined">
            {{ item.numeroFactura }}
          </v-chip>
        </template>

        <!-- Cliente -->
        <template #item.cliente="{ item }">
          <div>
            <div class="font-weight-medium">{{ item.clienteNombre }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.clienteEmail }}</div>
          </div>
        </template>

        <!-- Monto -->
        <template #item.montoTotal="{ item }">
          <div class="font-weight-bold">
            {{ formatCurrency(item.montoTotal) }}
          </div>
        </template>

        <!-- Estado -->
        <template #item.estado="{ item }">
          <v-chip
            :color="getEstadoColor(item.estado)"
            size="small"
            variant="tonal"
          >
            {{ getEstadoLabel(item.estado) }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template #item.acciones="{ item }">
          <div class="d-flex ga-1">
            <!-- Ver -->
            <v-btn
              icon
              variant="text"
              size="x-small"
              color="primary"
              @click="viewFactura(item)"
            >
              <v-icon icon="mdi-eye-outline" size="18" />
              <v-tooltip activator="parent">Ver detalle</v-tooltip>
            </v-btn>

            <!-- Editar: mostrar solo si puede editar -->
            <v-btn
              v-if="can('edit_facturas') && canEditFactura(item)"
              icon
              variant="text"
              size="x-small"
              color="warning"
              @click="editFactura(item)"
            >
              <v-icon icon="mdi-pencil-outline" size="18" />
              <v-tooltip activator="parent">Editar</v-tooltip>
            </v-btn>

            <!-- Cambiar estado -->
            <v-btn
              v-if="can('change_factura_estado')"
              icon
              variant="text"
              size="x-small"
              color="info"
              @click="openEstadoDialog(item)"
            >
              <v-icon icon="mdi-state-machine" size="18" />
              <v-tooltip activator="parent">Cambiar estado</v-tooltip>
            </v-btn>

            <!-- Eliminar: solo ADMIN/SUPERADMIN -->
            <v-btn
              v-if="can('delete_facturas')"
              icon
              variant="text"
              size="x-small"
              color="error"
              @click="deleteFactura(item)"
            >
              <v-icon icon="mdi-trash-outline" size="18" />
              <v-tooltip activator="parent">Eliminar</v-tooltip>
            </v-btn>
          </div>
        </template>

        <!-- Empty state -->
        <template #no-data>
          <div class="text-center py-8">
            <v-icon
              icon="mdi-file-document-outline"
              size="48"
              color="medium-emphasis"
              class="mb-3"
            />
            <div class="text-body-2 text-medium-emphasis">
              No se encontraron facturas
            </div>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo de creación -->
    <DialogCrearFactura
      v-model="createDialog"
      @saved="onFacturaCreated"
    />

    <!-- Diálogo de edición -->
    <DialogEditarFactura
      v-model="editDialog"
      :factura="selectedFactura"
      @saved="onFacturaUpdated"
    />

    <!-- Diálogo de cambio de estado -->
    <DialogCambiarEstado
      v-model="estadoDialog"
      :factura="selectedFactura"
      @cambio="onEstadoCambiado"
    />

    <!-- Diálogo de confirmación de eliminación -->
    <v-dialog v-model="deleteDialog" persistent max-width="400">
      <v-card>
        <v-card-title>Eliminar Factura</v-card-title>
        <v-card-text>
          ¿Estás seguro de eliminar {{ selectedFactura?.numeroFactura }}?
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteDialog = false">Cancelar</v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="confirmDelete"
          >
            Eliminar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePermissions } from '~/composables/usePermissions'
import { useFacturas } from '~/composables/useFacturas'
import { useNotification } from '~/composables/useNotification'
import type { Factura } from '~/types/factura'
import { UserRole } from '~/types/auth'

// ✅ PROTEGER PÁGINA: solo ADMIN/SUPERADMIN
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ADMIN, UserRole.SUPERADMIN],
})

const { can } = usePermissions()
const facturasComposable = useFacturas()
const notification = useNotification()

// ── State ──
const search = ref('')
const filterEstado = ref<string | null>(null)
const loading = ref(false)
const facturas = ref<Factura[]>([])
const selectedFactura = ref<Factura | null>(null)

// Dialogs
const createDialog = ref(false)
const editDialog = ref(false)
const estadoDialog = ref(false)
const deleteDialog = ref(false)
const deleteLoading = ref(false)

// ── Opciones ──
const estadoOptions = [
  { title: 'Borrador', value: 'BORRADOR' },
  { title: 'Editable', value: 'EDITABLE' },
  { title: 'Emitida', value: 'EMITIDA' },
  { title: 'Pagada', value: 'PAGADA' },
  { title: 'Anulada', value: 'ANULADA' },
]

// Headers de tabla
const headers = [
  { title: 'Número', key: 'numeroFactura', sortable: true, width: '120px' },
  { title: 'Cliente', key: 'cliente', sortable: true, minWidth: '200px' },
  { title: 'Monto', key: 'montoTotal', sortable: true, width: '120px' },
  { title: 'Estado', key: 'estado', sortable: true, width: '120px' },
  { title: 'Acciones', key: 'acciones', sortable: false, width: '180px' },
]

// ── Computed ──
const filteredFacturas = computed(() => {
  let result = facturas.value

  if (filterEstado.value) {
    result = result.filter((f) => f.estado === filterEstado.value)
  }

  return result
})

const totalFacturas = computed(() => facturas.value.length)

// ── Métodos ──
const loadFacturas = async () => {
  loading.value = true
  try {
    // Si es RECEPCIONISTA, solo carga facturas de su rango
    if (can('change_factura_estado') && !can('edit_facturas')) {
      // RECEPCIONISTA: acceso limitado
      facturas.value = await facturasComposable.getFacturasPendientes()
    } else {
      // ADMIN/SUPERADMIN: acceso completo
      facturas.value = await facturasComposable.getAllFacturas()
    }
  } catch (error: any) {
    notification.error(error?.message || 'Error al cargar facturas')
  } finally {
    loading.value = false
  }
}

const canEditFactura = (factura: Factura): boolean => {
  // Solo se pueden editar si están en BORRADOR o EDITABLE
  return ['BORRADOR', 'EDITABLE'].includes(factura.estado)
}

const viewFactura = (factura: Factura) => {
  selectedFactura.value = factura
  // Abrir modal de lectura
}

const openCreateDialog = () => {
  createDialog.value = true
}

const openEstadoDialog = (factura: Factura) => {
  selectedFactura.value = factura
  estadoDialog.value = true
}

const editFactura = (factura: Factura) => {
  selectedFactura.value = { ...factura }
  editDialog.value = true
}

const deleteFactura = (factura: Factura) => {
  selectedFactura.value = factura
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedFactura.value) return

  deleteLoading.value = true
  try {
    await facturasComposable.deleteFactura(selectedFactura.value.id)
    notification.success('Factura eliminada')
    deleteDialog.value = false
    await loadFacturas()
  } catch (error: any) {
    notification.error(error?.message || 'Error al eliminar factura')
  } finally {
    deleteLoading.value = false
  }
}

// ── Handlers de diálogos ──
const onFacturaCreated = () => {
  createDialog.value = false
  loadFacturas()
}

const onFacturaUpdated = () => {
  editDialog.value = false
  loadFacturas()
}

const onEstadoCambiado = () => {
  estadoDialog.value = false
  loadFacturas()
}

// ── Utilidades ──
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(amount)
}

const getEstadoColor = (estado: string): string => {
  const colors: Record<string, string> = {
    BORRADOR: 'grey',
    EDITABLE: 'warning',
    EMITIDA: 'info',
    PAGADA: 'success',
    ANULADA: 'error',
  }
  return colors[estado] || 'default'
}

const getEstadoLabel = (estado: string): string => {
  const labels: Record<string, string> = {
    BORRADOR: 'Borrador',
    EDITABLE: 'Editable',
    EMITIDA: 'Emitida',
    PAGADA: 'Pagada',
    ANULADA: 'Anulada',
  }
  return labels[estado] || estado
}

// ── Carga inicial ──
onMounted(() => {
  loadFacturas()
})
</script>

<style scoped lang="scss">
.facturas-page {
  padding: 20px;

  .card-glow {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
```

---

## 🧭 Paso 3: Agregar a navegación

**Archivo:** `composables/useRoleNavigation.ts`

En la sección de `ADMIN`:

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
      title: 'Operaciones',
      items: [
        { title: 'Gestión de Reservas', icon: 'mdi-calendar-check-outline', to: '/dashboard/empleados/admin/reservas' },
        { 
          title: 'Facturas',  // ✅ NUEVO
          icon: 'mdi-file-document-outline',
          to: '/dashboard/empleados/admin/facturas'
        },
      ],
    },
    // ... resto
  ]
```

También para `SUPERADMIN`:

```typescript
case UserRole.SUPERADMIN:
  return [
    // ... mismo cambio
  ]
```

**NOTA:** NO agregar para `RECEPCIONISTA` si quieres usar guarding a nivel de página.
Si quieres que recepcionista tenga acceso limitado, agrega pero cambia `roles` en `definePageMeta` para incluirlo.

---

## 👥 Paso 4: Página para RECEPCIONISTA (opcional)

Si `RECEPCIONISTA` debe acceder pero con funcionalidad limitada:

**Archivo:** `pages/dashboard/empleados/recepcionista/facturas.vue`

```typescript
definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.RECEPCIONISTA],  // ← Solo recepcionista
})

// ... template igual al anterior pero:
// - Bot

ón "Crear" no aparece (v-if="can('create_facturas')" = false)
// - Botón "Editar" no aparece (v-if="can('edit_facturas')" = false)
// - Botón "Eliminar" no aparece (v-if="can('delete_facturas')" = false)
// Solo quedan: "Ver" y "Cambiar estado"
```

---

## 🏠 Paso 5: Cliente ve sus propias facturas

**Archivo:** `pages/dashboard/cliente/mis-facturas.vue`

```typescript
definePageMeta({
  layout: 'default',
  middleware: ['auth'],  // Solo auth, no role para flexibilidad
})

// ── Script ──
const { can } = usePermissions()

// Solo mostrar si cliente tiene permiso
<div v-if="can('view_facturas')">
  <!-- Mostrar solo facturas del cliente actual -->
  <v-alert type="info">
    Estas son tus facturas. Contacta a la recepción para cambios.
  </v-alert>

  <!-- Tabla sin botones de edición -->
  <v-data-table
    :headers="headersCliente"  // Sin columna Acciones
    :items="misFacturas"
  />
</div>

<div v-else>
  <v-alert type="error">
    No tienes acceso a esta sección.
  </v-alert>
</div>
```

---

## 🔍 Paso 6: Componentes inteligentes

**Archivo:** `components/facturas/DialogCambiarEstado.vue`

El componente ya existe. Es resistente porque usa el composable:

```typescript
import { usePermissions } from '~/composables/usePermissions'

const { can } = usePermissions()

// En template:
<p v-if="can('change_factura_estado')">
  Permiso verificado
</p>
```

---

## 🧪 Testing Checklist

### Test 1: ADMIN accede a /admin/facturas

```
✅ Página carga
✅ Tabla muestra todas las facturas
✅ Botón "Crear Factura" visible
✅ Botones "Editar" visibles para facturas editables
✅ Botón "Eliminar" visible
✅ Botón "Cambiar estado" visible
```

### Test 2: RECEPCIONISTA accede a /admin/facturas

```
❌ Redirige a /dashboard/empleados/recepcionista
   (porque roles: [ADMIN, SUPERADMIN] en definePageMeta)
```

Alternativa: Si quieres que vea pero limitado:

```typescript
// definePageMeta
roles: [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.RECEPCIONISTA]

// En template
✅ Página carga
✅ Tabla muestra solo facturas pendientes
❌ Botón "Crear Factura" NO visible (can('create_facturas') = false)
❌ Botones "Editar" NO visibles
❌ Botón "Eliminar" NO visible
✅ Botón "Cambiar estado" visible
```

### Test 3: CLIENTE accede a /cliente/mis-facturas

```
✅ Página carga
✅ Tabla muestra solo SUS facturas
❌ Botones de edición NO visibles
✅ Puede ver detalle (permiso 'view_facturas')
```

### Test 4: CAFETERIA intenta acceder a /admin/facturas

```
❌ Redirige a /dashboard/empleados/area/cafeteria
   (su defaultRoute)
```

---

## 📋 Resumen de cambios

| Archivo | Cambio |
|---------|--------|
| `composables/usePermissions.ts` | Agregar permisos: `view_facturas`, `create_facturas`, `edit_facturas`, `delete_facturas`, `change_factura_estado` |
| `pages/dashboard/empleados/admin/facturas.vue` | Crear página con tabla + dialogs |
| `composables/useRoleNavigation.ts` | Agregar item "Facturas" en secciones ADMIN/SUPERADMIN |
| `pages/dashboard/cliente/mis-facturas.vue` | Página de cliente (ya existe probablemente) |
| Backend | Validar permisos en endpoints POST, PUT,DELETE de facturas |

---

## ⚠️ Recuerda

1. **Backend DEBE validar también:**
   ```typescript
   @Post('/facturas')
   @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
   create(@Body() dto: CreateFacturaDto) { }
   ```

2. **Los permisos en frontend son solo UX**, no seguridad

3. **Normalización de caso:** Todo se compara en minúsculas

4. **Usa `can()` para granulares, `roles` en `definePageMeta` para páginas completas**

---

