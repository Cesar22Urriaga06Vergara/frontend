<template>
  <div>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6 flex-wrap ga-2">
      <div>
        <h1 class="text-h5 font-weight-bold mb-1">Gestión de Pedidos</h1>
        <p class="text-body-2 text-medium-emphasis">
          Área: {{ getAreaLabel(authStore.userRole) }}
        </p>
      </div>
      <v-btn
        prepend-icon="mdi-refresh"
        color="primary"
        variant="tonal"
        @click="refrescarPedidos"
        :loading="loading"
      >
        Actualizar
      </v-btn>
    </div>

    <!-- Filtros -->
    <v-card class="card-glow mb-6 pa-4">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="estadoFiltro"
            label="Filtrar por estado"
            :items="estadoOptions"
            item-title="label"
            item-value="value"
            clearable
            @update:model-value="filtrarPedidos"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="tipoEntregaFiltro"
            label="Tipo de entrega"
            :items="tipoEntregaOptions"
            item-title="label"
            item-value="value"
            clearable
            @update:model-value="filtrarPedidos"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Estadísticas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Pendientes</div>
              <div class="text-h6 font-weight-bold text-warning">{{ pendienteCount }}</div>
            </div>
            <v-avatar color="warning" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-clock-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">En Preparación</div>
              <div class="text-h6 font-weight-bold text-info">{{ enPreparacionCount }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-progress-clock" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Listos</div>
              <div class="text-h6 font-weight-bold text-success">{{ listosCount }}</div>
            </div>
            <v-avatar color="success" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-check-circle-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Total</div>
              <div class="text-h6 font-weight-bold">{{ totalCount }}</div>
            </div>
            <v-avatar color="primary" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-file-multiple-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de Pedidos -->
    <v-card class="card-glow">
      <v-data-table
        :headers="headers"
        :items="pedidosFiltrados"
        :loading="loading"
        :items-per-page="-1"
        class="elevation-0"
      >
        <template #item.id="{ item }">
          <span class="font-weight-bold text-primary cursor-pointer" @click="abrirDetalle(item)">
            #{{ item.id }}
          </span>
        </template>

        <template #item.estadoPedido="{ item }">
          <v-chip
            :color="getColorEstado(item.estadoPedido)"
            :text="formatearEstado(item.estadoPedido)"
            size="small"
            variant="tonal"
          />
        </template>

        <template #item.tipoEntrega="{ item }">
          <v-chip
            :icon="item.tipoEntrega === 'delivery' ? 'mdi-truck-fast' : 'mdi-store'"
            :text="item.tipoEntrega === 'delivery' ? 'Delivery' : 'Recogida'"
            size="small"
            variant="tonal"
          />
        </template>

        <template #item.acciones="{ item }">
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            @click="abrirDetalle(item)"
          />
        </template>
      </v-data-table>
    </v-card>

    <!-- Diálogo de Detalle -->
    <!-- Aquí irá el componente de detalle de pedido -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserRole } from '~/types/auth'
import { useAuthStore } from '~/stores/auth'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import type { Pedido } from '~/types/servicios'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.CAFETERIA, UserRole.LAVANDERIA, UserRole.SPA, UserRole.ROOM_SERVICE],
})

useHead({ title: 'Gestión de Pedidos' })

const authStore = useAuthStore()
const pedidosStore = usePedidosAreaStore()

const loading = ref(false)
const estadoFiltro = ref<string | null>(null)
const tipoEntregaFiltro = ref<string | null>(null)
let refreshInterval: ReturnType<typeof setInterval> | null = null

// Opciones de filtros
const estadoOptions = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'En Preparación', value: 'en_preparacion' },
  { label: 'Listo', value: 'listo' },
  { label: 'Entregado', value: 'entregado' },
  { label: 'Cancelado', value: 'cancelado' },
]

const tipoEntregaOptions = [
  { label: 'Delivery', value: 'delivery' },
  { label: 'Recogida', value: 'recogida' },
]

// Headers de tabla
const headers = [
  { title: 'ID', key: 'id' },
  { title: 'Items', key: 'items', width: '100px' },
  { title: 'Estado', key: 'estadoPedido' },
  { title: 'Entrega', key: 'tipoEntrega' },
  { title: 'Hora', key: 'createdAt', width: '150px' },
  { title: 'Acciones', key: 'acciones', width: '80px' },
]

// Contadores
const pendienteCount = computed(() =>
  pedidosFiltrados.value.filter(p => p.estadoPedido === 'pendiente').length
)

const enPreparacionCount = computed(() =>
  pedidosFiltrados.value.filter(p => p.estadoPedido === 'en_preparacion').length
)

const listosCount = computed(() =>
  pedidosFiltrados.value.filter(p => p.estadoPedido === 'listo').length
)

const totalCount = computed(() => pedidosFiltrados.value.length)

// Filtrado
const pedidosFiltrados = computed(() => {
  let result = pedidosStore.pedidos

  if (estadoFiltro.value) {
    result = result.filter(p => p.estadoPedido === estadoFiltro.value)
  }

  if (tipoEntregaFiltro.value) {
    result = result.filter(p => p.tipoEntrega === tipoEntregaFiltro.value)
  }

  return result
})

// Funciones
const getAreaLabel = (role: string | null): string => {
  const labels: Record<string, string> = {
    'cafeteria': 'Cafetería',
    'lavanderia': 'Lavandería',
    'spa': 'Spa',
    'room_service': 'Room Service',
  }
  return labels[role?.toLowerCase() || ''] || 'Área Desconocida'
}

const getColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    'pendiente': 'warning',
    'en_preparacion': 'info',
    'listo': 'success',
    'entregado': 'success',
    'cancelado': 'error',
  }
  return colores[estado] || 'secondary'
}

const formatearEstado = (estado: string): string => {
  const estados: Record<string, string> = {
    'pendiente': 'Pendiente',
    'en_preparacion': 'En Preparación',
    'listo': 'Listo',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado',
  }
  return estados[estado] || estado
}

const filtrarPedidos = () => {
  // El computed se actualiza automáticamente
}

const getCategoria = (): string | null => {
  const role = authStore.userRole
  const roleCategoryMap: Record<string, string> = {
    cafeteria: 'cafeteria',
    lavanderia: 'lavanderia',
    spa: 'spa',
    room_service: 'room_service',
  }

  if (!role) return null
  return roleCategoryMap[String(role).toLowerCase()] || null
}

const cargarPedidosDelArea = async (): Promise<void> => {
  const hotelId = authStore.user?.idHotel
  const categoria = getCategoria()

  if (!hotelId || !categoria) {
    return
  }

  await pedidosStore.cargarPedidos(hotelId, categoria)
}

const refrescarPedidos = async () => {
  loading.value = true
  try {
    await cargarPedidosDelArea()
  } finally {
    loading.value = false
  }
}

const abrirDetalle = (pedido: Pedido) => {
  // Abrir modal o mostrar detalles en la misma página
  // Por ahora, simplemente abre un alert con información
  console.log('Detalles del pedido:', pedido)
  // TODO: Implementar modal de detalles
}

onMounted(async () => {
  await refrescarPedidos()

  refreshInterval = setInterval(async () => {
    try {
      await cargarPedidosDelArea()
    } catch (error) {
      console.error('Error refrescando pedidos del área:', error)
    }
  }, 20000)
})

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>

