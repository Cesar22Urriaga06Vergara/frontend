<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">🔔 Panel Room Service</h1>
      <p class="text-body-2 text-medium-emphasis">Entregas a habitaciones y servicios del día</p>
    </div>

    <!-- Stats rápidas -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Pendientes</div>
              <div class="text-h5 font-weight-bold text-warning">{{ pendienteCount }}</div>
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
              <div class="text-caption text-medium-emphasis mb-1">En ruta</div>
              <div class="text-h5 font-weight-bold text-info">{{ enRutaCount }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-route" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Entregadas hoy</div>
              <div class="text-h5 font-weight-bold text-success">{{ entregadasHoy }}</div>
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
              <div class="text-caption text-medium-emphasis mb-1">Total del día</div>
              <div class="text-h5 font-weight-bold">{{ totalDia }}</div>
            </div>
            <v-avatar color="teal" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-bell-service-outline" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Entregas recientes -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-0">
        Entregas recientes
      </v-card-title>
      <v-card-text>
        <v-list v-if="entregasRecientes.length > 0" density="compact" class="bg-transparent">
          <v-list-item
            v-for="entrega in entregasRecientes"
            :key="entrega.id"
            :to="`/dashboard/empleados/area`"
          >
            <template #prepend>
              <v-icon
                :icon="getIconEstado(entrega.estadoPedido)"
                :color="getColorEstado(entrega.estadoPedido)"
                size="20"
                class="mr-2"
              />
            </template>
            <v-list-item-title class="text-body-2">
              Pedido #{{ entrega.id }} — {{ entrega.items?.length || 0 }} ítem(s)
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ formatHora(entrega.fechaPedido) }} · {{ entrega.tipoEntrega }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip
                :color="getColorEstado(entrega.estadoPedido)"
                size="x-small"
                variant="tonal"
              >
                {{ entrega.estadoPedido }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <div v-else class="text-center py-8">
          <v-icon icon="mdi-bell-off" size="48" color="medium-emphasis" class="mb-2 opacity-40" />
          <p class="text-body-2 text-medium-emphasis">Sin entregas activas</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="primary" to="/dashboard/empleados/area" size="small">
          Ver todas las entregas →
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { UserRole } from '~/types/auth'
import { usePedidosAreaStore } from '~/stores/pedidosArea'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
  middleware: ['auth', 'role'],
  roles: [UserRole.ROOM_SERVICE, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Room Service' })

const pedidosStore = usePedidosAreaStore()
const authStore = useAuthStore()

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    await pedidosStore.cargarPedidos(idHotel, 'room_service')
  }
})

const pendienteCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'pendiente').length)
const enRutaCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'en_preparacion').length)
const entregadasHoy = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'entregado').length)
const totalDia = computed(() => pedidosStore.pedidos.length)
const entregasRecientes = computed(() => pedidosStore.pedidos.slice(0, 5))

const getColorEstado = (estado: string): string => ({
  pendiente: 'warning',
  en_ruta: 'info',
  entregada: 'success',
  rechazada: 'error',
}[estado] || 'default')

const getIconEstado = (estado: string): string => ({
  pendiente: 'mdi-clock-outline',
  en_ruta: 'mdi-route',
  entregada: 'mdi-check-circle',
  rechazada: 'mdi-close-circle',
}[estado] || 'mdi-help')

const formatHora = (fecha: string): string => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
</script>
