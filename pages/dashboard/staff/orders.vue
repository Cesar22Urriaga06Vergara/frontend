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
          <router-link :to="`/dashboard/staff/orders/${item.id}`" class="font-weight-bold text-primary">
            #{{ item.id }}
          </router-link>
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
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import type { Pedido } from '~/types/servicios'

definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['cafeteria', 'lavanderia', 'spa', 'room_service'],
})

useHead({ title: 'Gestión de Pedidos' })

const authStore = useAuthStore()
const pedidosStore = usePedidosAreaStore()

const loading = ref(false)
const estadoFiltro = ref<string | null>(null)
const tipoEntregaFiltro = ref<string | null>(null)

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

const refrescarPedidos = async () => {
  loading.value = true
  try {
    // Cargar pedidos aquí
  } finally {
    loading.value = false
  }
}

const abrirDetalle = (pedido: Pedido) => {
  // Navegar a detalle o abrir modal
  navigateTo(`/dashboard/staff/orders/${pedido.id}`)
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
