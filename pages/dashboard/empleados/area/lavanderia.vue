<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">🧺 Panel Lavandería</h1>
      <p class="text-body-2 text-medium-emphasis">Resumen de prendas y servicios del día</p>
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
              <div class="text-caption text-medium-emphasis mb-1">En proceso</div>
              <div class="text-h5 font-weight-bold text-info">{{ procesoCount }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-washing-machine" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Listos hoy</div>
              <div class="text-h5 font-weight-bold text-success">{{ listosHoy }}</div>
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
            <v-avatar color="indigo" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-tshirt-crew" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Prendas recientes -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-0">
        Prendas recientes
      </v-card-title>
      <v-card-text>
        <v-list v-if="prendasRecientes.length > 0" density="compact" class="bg-transparent">
          <v-list-item
            v-for="prenda in prendasRecientes"
            :key="prenda.id"
            :to="`/dashboard/empleados/area`"
          >
            <template #prepend>
              <v-icon
                :icon="getIconEstado(prenda.estadoPedido)"
                :color="getColorEstado(prenda.estadoPedido)"
                size="20"
                class="mr-2"
              />
            </template>
            <v-list-item-title class="text-body-2">
              Lote #{{ prenda.id }} — {{ prenda.items?.length || 0 }} prenda(s)
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ formatHora(prenda.fechaPedido) }} · Tipo: {{ prenda.tipoEntrega }}
            </v-list-item-subtitle>
            <template #append>
              <v-chip
                :color="getColorEstado(prenda.estadoPedido)"
                size="x-small"
                variant="tonal"
              >
                {{ prenda.estadoPedido }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <div v-else class="text-center py-8">
          <v-icon icon="mdi-washing-machine-alert" size="48" color="medium-emphasis" class="mb-2 opacity-40" />
          <p class="text-body-2 text-medium-emphasis">Sin servicios activos</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="primary" to="/dashboard/empleados/area" size="small">
          Ver todos los lotes →
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
  roles: [UserRole.LAVANDERIA, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Lavandería' })

const pedidosStore = usePedidosAreaStore()
const authStore = useAuthStore()

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    await pedidosStore.cargarPedidos(idHotel, 'lavanderia')
  }
})

const pendienteCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'pendiente').length)
const procesoCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'en_preparacion').length)
const listosHoy = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'listo').length)
const totalDia = computed(() => pedidosStore.pedidos.length)
const prendasRecientes = computed(() => pedidosStore.pedidos.slice(0, 5))

const getColorEstado = (estado: string): string => ({
  pendiente: 'warning',
  en_proceso: 'info',
  listo: 'success',
  entregado: 'primary',
  cancelado: 'error',
}[estado] || 'default')

const getIconEstado = (estado: string): string => ({
  pendiente: 'mdi-clock-outline',
  en_proceso: 'mdi-washing-machine',
  listo: 'mdi-check-circle',
  entregado: 'mdi-package-check',
  cancelado: 'mdi-close-circle',
}[estado] || 'mdi-help')

const formatHora = (fecha: string): string => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}

const formatFecha = (fecha: string): string => {
  if (!fecha) return 'Próximamente'
  return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}
</script>
