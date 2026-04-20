<template>
  <div>
    <div v-if="!reservas || reservas.length === 0" class="text-center py-12">
      <v-icon icon="mdi-calendar-off" size="48" class="mb-4 opacity-50" />
      <p class="text-body-1 text-medium-emphasis">
        {{ emptyMessage }}
      </p>
    </div>

    <v-row v-else>
      <v-col v-for="reserva in reservas" :key="reserva.id" cols="12" md="6">
        <v-card class="card-glow h-100 d-flex flex-column">
          <!-- Header con estado -->
          <div class="d-flex align-center justify-space-between pa-4 pb-0">
            <div>
              <p class="text-caption text-medium-emphasis mb-1">
                Código: <strong>{{ reserva.codigoConfirmacion }}</strong>
              </p>
              <h3 class="text-subtitle-1 font-weight-bold">
                {{ reserva.tipoHabitacion?.nombreTipo }} - Habitación {{ reserva.habitacion?.numeroHabitacion }}
              </h3>
            </div>
            <div class="d-flex flex-column gap-2">
              <v-chip
                :color="getEstadoColor(reserva.estadoReserva)"
                variant="tonal"
                size="small"
              >
                {{ reserva.estadoReserva }}
              </v-chip>
              <v-chip
                v-if="reserva.estadoReserva?.toLowerCase() === 'confirmada'"
                :color="reserva.checkinReal ? 'success' : 'warning'"
                variant="tonal"
                size="small"
                :prepend-icon="reserva.checkinReal ? 'mdi-check-circle' : 'mdi-clock-outline'"
              >
                {{ reserva.checkinReal ? 'Check-in realizado' : 'Pendiente check-in' }}
              </v-chip>
            </div>
          </div>

          <v-divider class="my-3" />

          <!-- Contenido -->
          <v-card-text class="pb-2 flex-grow-1">
            <!-- Fechas -->
            <div class="mb-3">
              <p class="text-caption text-medium-emphasis mb-1">Fechas</p>
              <p class="text-body-2">
                <v-icon icon="mdi-calendar" size="16" />
                {{ formatDate(reserva.checkinPrevisto) }} - {{ formatDate(reserva.checkoutPrevisto) }}
              </p>
            </div>

            <!-- Detalles -->
            <div class="mb-3">
              <v-row>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis mb-1">Huéspedes</p>
                  <p class="text-body-2 font-weight-bold">{{ reserva.numeroHuespedes }}</p>
                </v-col>
                <v-col cols="6">
                  <p class="text-caption text-medium-emphasis mb-1">Precio/Noche</p>
                  <p class="text-body-2 font-weight-bold">${{ Number(reserva.precioNocheSnapshot).toLocaleString() }}</p>
                </v-col>
              </v-row>
            </div>

            <!-- Observaciones -->
            <div v-if="reserva.observaciones" class="mb-3">
              <p class="text-caption text-medium-emphasis mb-1">Observaciones</p>
              <p class="text-body-2">{{ reserva.observaciones }}</p>
            </div>
          </v-card-text>

          <!-- Acciones -->
          <v-divider class="my-2" />

          <v-card-actions class="pa-3 pt-2">
            <v-btn
              variant="text"
              size="small"
              @click="handleVerDetalle(reserva)"
            >
              <v-icon start icon="mdi-eye" />
              Ver Detalle
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="['reservada', 'confirmada'].includes(reserva.estadoReserva)"
              variant="text"
              size="small"
              color="error"
              @click="handleCancelar(reserva)"
            >
              <v-icon start icon="mdi-close" />
              Cancelar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import type { Reserva } from '~/types/api'

interface Props {
  reservas?: Reserva[]
  loading?: boolean
  emptyMessage?: string
}

withDefaults(defineProps<Props>(), {
  reservas: undefined,
  loading: false,
  emptyMessage: 'No hay reservas',
})

const emit = defineEmits<{
  'ver-detalle': [reserva: Reserva]
  'cancelar': [reserva: Reserva]
}>()

const formatDate = (fecha?: Date | string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getEstadoColor = (estado?: string): string => {
  const colores: Record<string, string> = {
    reservada: 'warning',
    confirmada: 'success',
    cancelada: 'error',
    completada: 'info',
  }
  return colores[estado || 'reservada'] || 'grey'
}

// Debug logging
const handleVerDetalle = (reserva: Reserva) => {
  console.log('✓ Ver Detalle clicked:', reserva)
  emit('ver-detalle', reserva)
}

const handleCancelar = (reserva: Reserva) => {
  console.log('✓ Cancelar clicked:', reserva)
  emit('cancelar', reserva)
}
</script>

<style scoped>
.card-glow {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card-glow:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
</style>
