<template>
  <div>
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">Dashboard Empleado</h1>
      <p class="text-body-2 text-medium-emphasis">
        Bienvenido {{ authStore.user?.fullName || 'Empleado' }}
      </p>
    </div>

    <!-- Estadísticas Rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Pedidos Pendientes</div>
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
              <div class="text-caption text-medium-emphasis mb-1">Entregados</div>
              <div class="text-h6 font-weight-bold text-success">{{ entregadosCount }}</div>
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
              <div class="text-caption text-medium-emphasis mb-1">Total Pedidos</div>
              <div class="text-h6 font-weight-bold">{{ totalCount }}</div>
            </div>
            <v-avatar color="primary" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-file-multiple-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Acciones Rápidas -->
    <v-card class="card-glow mb-6 pa-4">
      <v-card-text>
        <h3 class="text-subtitle-2 font-weight-bold mb-3">Acciones Rápidas</h3>
        <div class="d-flex gap-2 flex-wrap">
          <v-btn
            to="/dashboard/empleado/pedidos"
            prepend-icon="mdi-clipboard-list-outline"
            color="primary"
            variant="tonal"
          >
            Ver Todos los Pedidos
          </v-btn>
          <v-btn
            prepend-icon="mdi-refresh"
            color="primary"
            variant="tonal"
            @click="refrescar"
            :loading="loading"
          >
            Actualizar
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Pedidos Recientes -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold">
        <v-icon icon="mdi-clock-outline" class="mr-2" />
        Pedidos Recientes
      </v-card-title>
      <v-card-text v-if="pedidosRecientes.length > 0" class="pa-0">
        <v-timeline dense class="pa-4">
          <v-timeline-item v-for="pedido in pedidosRecientes" :key="pedido.id" size="small">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="font-weight-bold">Pedido #{{ pedido.id }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ pedido.items?.length || 0 }} artículo(s)
                </div>
              </div>
              <v-chip
                :color="getColorEstado(pedido.estadoPedido)"
                size="small"
                variant="tonal"
              >
                {{ formatearEstado(pedido.estadoPedido) }}
              </v-chip>
            </div>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
      <v-card-text v-else class="text-center text-medium-emphasis py-6">
        No hay pedidos para mostrar
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const pedidosStore = usePedidosAreaStore()

const loading = ref(false)

// Contadores por estado
const pendienteCount = computed(() => 
  pedidosStore.pedidos.filter(p => p.estadoPedido === 'pendiente').length
)

const enPreparacionCount = computed(() => 
  pedidosStore.pedidos.filter(p => p.estadoPedido === 'en_preparacion').length
)

const entregadosCount = computed(() => 
  pedidosStore.pedidos.filter(p => p.estadoPedido === 'entregado').length
)

const totalCount = computed(() => pedidosStore.pedidos.length)

const pedidosRecientes = computed(() => pedidosStore.pedidos.slice(0, 5))

// Obtener color según estado
const getColorEstado = (estado: string): string => {
  const colores: Record<string, string> = {
    'pendiente': 'warning',
    'en_preparacion': 'info',
    'listo': 'success',
    'entregado': 'success',
    'cancelado': 'error'
  }
  return colores[estado] || 'secondary'
}

// Formatear estado para mostrar
const formatearEstado = (estado: string): string => {
  const estados: Record<string, string> = {
    'pendiente': 'Pendiente',
    'en_preparacion': 'En Preparación',
    'listo': 'Listo',
    'entregado': 'Entregado',
    'cancelado': 'Cancelado'
  }
  return estados[estado] || estado
}

// Refrescar pedidos
const refrescar = async () => {
  loading.value = true
  try {
    if (pedidosStore.idHotel > 0 && pedidosStore.categoria) {
      await pedidosStore.refrescarPedidos()
    }
  } catch (error) {
    console.error('Error al refrescar:', error)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  // Cargar pedidos iniciales si es necesario
  if (pedidosStore.pedidos.length === 0) {
    await refrescar()
  }
})
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
