<template>
  <div>
    <div class="mb-6">
      <h1 class="text-h5 font-weight-bold mb-1">💆 Panel Spa</h1>
      <p class="text-body-2 text-medium-emphasis">Calendario de citas y servicios del día</p>
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
              <div class="text-caption text-medium-emphasis mb-1">En curso</div>
              <div class="text-h5 font-weight-bold text-info">{{ enCursoCount }}</div>
            </div>
            <v-avatar color="info" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-spa" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="card-glow pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-caption text-medium-emphasis mb-1">Completadas hoy</div>
              <div class="text-h5 font-weight-bold text-success">{{ completadasHoy }}</div>
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
            <v-avatar color="pink" size="40" variant="tonal" rounded="lg">
              <v-icon icon="mdi-flower" size="20" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Citas recientes -->
    <v-card class="card-glow">
      <v-card-title class="text-subtitle-1 font-weight-bold pa-4 pb-0">
        Citas de hoy
      </v-card-title>
      <v-card-text>
        <v-list v-if="citasRecientes.length > 0" density="compact" class="bg-transparent">
          <v-list-item
            v-for="cita in citasRecientes"
            :key="cita.id"
            :to="`/reportes/area/spa`"
          >
            <template #prepend>
              <v-icon
                :icon="getIconEstado(cita.estadoPedido)"
                :color="getColorEstado(cita.estadoPedido)"
                size="20"
                class="mr-2"
              />
            </template>
            <v-list-item-title class="text-body-2">
              Cita #{{ cita.id }} — Spa
            </v-list-item-title>
            <v-list-item-subtitle class="text-caption">
              {{ formatHora(cita.fechaPedido) }} · Cliente
            </v-list-item-subtitle>
            <template #append>
              <v-chip
                :color="getColorEstado(cita.estadoPedido)"
                size="x-small"
                variant="tonal"
              >
                {{ cita.estadoPedido }}
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <div v-else class="text-center py-8">
          <v-icon icon="mdi-calendar-blank" size="48" color="medium-emphasis" class="mb-2 opacity-40" />
          <p class="text-body-2 text-medium-emphasis">Sin citas agendadas</p>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn variant="text" color="primary" to="/reportes/area/spa" size="small">
          Ver calendario completo →
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
  roles: [UserRole.SPA, UserRole.ADMIN, UserRole.SUPERADMIN],
})

useHead({ title: 'Mi Área — Spa' })

const pedidosStore = usePedidosAreaStore()
const authStore = useAuthStore()

onMounted(async () => {
  const idHotel = authStore.user?.idHotel
  if (idHotel) {
    await pedidosStore.cargarPedidos(idHotel, 'spa')
  }
})

const pendienteCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'pendiente').length)
const enCursoCount = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'en_preparacion').length)
const completadasHoy = computed(() => pedidosStore.pedidos.filter(p => p.estadoPedido === 'entregado').length)
const totalDia = computed(() => pedidosStore.pedidos.length)
const citasRecientes = computed(() => pedidosStore.pedidos.slice(0, 5))

const getColorEstado = (estado: string): string => ({
  pendiente: 'warning',
  en_curso: 'info',
  completada: 'success',
  cancelada: 'error',
}[estado] || 'default')

const getIconEstado = (estado: string): string => ({
  pendiente: 'mdi-clock-outline',
  en_curso: 'mdi-spa',
  completada: 'mdi-check-circle',
  cancelada: 'mdi-close-circle',
}[estado] || 'mdi-help')

const formatHora = (fecha: string): string => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
}
</script>
