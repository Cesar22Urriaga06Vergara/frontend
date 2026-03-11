<template>
  <v-row class="mb-6">
    <v-col
      v-for="stat in stats"
      :key="stat.label"
      cols="6"
      sm="3"
      md
    >
      <v-card class="card-glow pa-4">
        <div class="d-flex align-center justify-space-between">
          <div>
            <div class="text-caption text-medium-emphasis mb-1">{{ stat.label }}</div>
            <div class="text-h5 font-weight-bold">{{ stat.value }}</div>
          </div>
          <v-avatar :color="stat.color" size="40" variant="tonal" rounded="lg">
            <v-icon :icon="stat.icon" size="20" />
          </v-avatar>
        </div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useReservasStore } from '~/stores/reservas'

const reservasStore = useReservasStore()

const stats = computed(() => [
  {
    label: 'Reservas confirmadas hoy',
    value: reservasStore.confirmedTodayCount,
    color: 'success',
    icon: 'mdi-check-circle-outline',
  },
  {
    label: 'Check-ins pendientes',
    value: reservasStore.pendingCheckinsCount,
    color: 'warning',
    icon: 'mdi-door-open-outline',
  },
  {
    label: 'Check-outs pendientes',
    value: reservasStore.pendingCheckoutsCount,
    color: 'info',
    icon: 'mdi-door-closed-outline',
  },
  {
    label: 'Total reservas',
    value: reservasStore.reservas.length,
    color: 'primary',
    icon: 'mdi-calendar-check-outline',
  },
])
</script>
