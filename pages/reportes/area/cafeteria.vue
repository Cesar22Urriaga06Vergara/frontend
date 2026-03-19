<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">☕ Panel Cafetería</h1>
      <p class="text-body-2 text-medium-emphasis">Resumen del área y servicios del día</p>
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
              <div class="text-caption text-medium-emphasis mb-1">En preparación</div>
              <div class="text-h5 font-weight-bold text-info">{{ preparacionCount }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-coffee-maker" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Entregados hoy</div>
              <div class="text-h5 font-weight-bold text-success">{{ entregadosHoy }}</div>
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
            <v-avatar color="orange" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-coffee" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pedidos recientes -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-0">
        Pedidos recientes
      </v-card-title>
      <v-card-text>
        <v-list v-if="pedidosRecientes.length > 0" density="compact" class="bg-transparent">
          <v-list-item
            v-for="pedido in pedidosRecientes"
            :key="pedido.id"
            :to="`/reportes/area/cafeteria`"
          >
            <template #prepend>
              <v-icon
                :icon="getIconEstado(pedido.estadoPedido)"
                :color="getColorEstado(pedido.estadoPedido)"
                size="20"
                class="mr-2"
              />
            </template>
            <v-list-item-title class="text-body-2">
              Pedido #{{ pedido.id }} — {{ pedido.items?.length || 0 }} ítem(s)
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ formatHora(pedido.fechaPedido) }} · Entrega: {{ pedido.tipoEntrega }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip
                :color="getColorEstado(pedido.estadoPedido)"
                size="x-small"
                variant="tonal"
              >
                {{ pedido.estadoPedido }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <div v-else class="text-center py-8">
          <v-icon icon="mdi-coffee-off" size="48" color="medium-emphasis" class="mb-2 opacity-40" />
          <p class="text-body-2 text-medium-emphasis">Sin pedidos activos</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="primary" to="/reportes/area/cafeteria" size="small">
          Ver todos los pedidos →
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
  roles: [UserRole.CAFETERIA, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Cafetería' })

const pedidosStore = usePedidosAreaStore()
const authStore = useAuthStore()

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    await pedidosStore.cargarPedidos(idHotel, 'cafeteria')
  }
})

const pendienteCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'pendiente').length)
const preparacionCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'en_preparacion').length)
const entregadosHoy = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'entregado').length)
const totalDia = computed(() => pedidosStore.pedidos.length)
const pedidosRecientes = computed(() => pedidosStore.pedidos.slice(0, 5))

const getColorEstado = (estado: string): string => ({
  pendiente: 'warning',
  en_preparacion: 'info',
  listo: 'primary',
  entregado: 'success',
  cancelado: 'error',
}[estado] || 'default')

const getIconEstado = (estado: string): string => ({
  pendiente: 'mdi-clock-outline',
  en_preparacion: 'mdi-coffee-maker',
  listo: 'mdi-check',
  entregado: 'mdi-check-circle',
  cancelado: 'mdi-close-circle',
}[estado] || 'mdi-help')

const formatHora = (fecha: string): string => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
</script>
