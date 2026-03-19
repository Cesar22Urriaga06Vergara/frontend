<template>
  <v-card title="Reservas pendientes de Check-in">
    <v-card-text>
      <v-empty-state
        v-if="!reservas || reservas.length === 0"
        icon="mdi-inbox-outline"
        title="Sin pendientes"
        text="No hay reservas pendientes de check-in hoy"
      ></v-empty-state>

      <v-table v-else density="compact" hover class="reservas-table">
        <thead>
          <tr>
            <th class="text-left">Habitación</th>
            <th class="text-left">Cliente</th>
            <th class="text-center">Huéspedes</th>
            <th class="text-right">Tarifa</th>
            <th class="text-center">Check-in</th>
            <th class="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="reserva in reservas" :key="reserva.id" class="cursor-pointer hover-row">
            <td class="font-weight-bold">#{{ reserva.numeroHabitacion }}</td>
            <td>
              <div class="font-weight-medium">{{ reserva.nombreCliente }}</div>
              <div class="text-caption text-medium-emphasis">{{ reserva.cedulaCliente }}</div>
            </td>
            <td class="text-center">
              <v-icon size="small" color="info">mdi-people</v-icon>
              {{ reserva.cantidadHuespedes }}
            </td>
            <td class="text-right">${{ reserva.tarifa.toLocaleString('es-CO') }}/noche</td>
            <td class="text-center">{{ formatearFecha(reserva.checkinFecha) }}</td>
            <td class="text-center">
              <v-btn
                size="small"
                color="success"
                icon
                @click="confirmarCheckin(reserva)"
                :loading="loadingReservaId === reserva.id"
              >
                <v-icon>mdi-login</v-icon>
                <v-tooltip activator="parent">Check-in</v-tooltip>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ReservaParaCheckin } from '~/types/checkinCheckout'

interface Props {
  reservas?: ReservaParaCheckin[] | null
  loading?: boolean
}

interface Emits {
  (e: 'confirmar-checkin', reserva: ReservaParaCheckin): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const loadingReservaId = ref<number | null>(null)

const formatearFecha = (fecha: string) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const confirmarCheckin = async (reserva: ReservaParaCheckin) => {
  loadingReservaId.value = reserva.id
  try {
    emit('confirmar-checkin', reserva)
  } finally {
    loadingReservaId.value = null
  }
}
</script>

<style scoped>
.reservas-table :deep(tbody tr.hover-row:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

.reservas-table :deep(td) {
  padding: 12px !important;
  vertical-align: middle;
}

.reservas-table :deep(th) {
  background-color: rgba(0, 0, 0, 0.04);
  font-weight: 600 !important;
}
</style>
