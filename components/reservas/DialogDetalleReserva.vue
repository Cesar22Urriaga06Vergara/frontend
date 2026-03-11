<template>
  <v-dialog v-model="isOpen" max-width="700">
    <v-card v-if="reserva">
      <v-card-title class="d-flex align-center justify-space-between bg-primary-lighten-5">
        <span>
          <v-icon icon="mdi-information" color="primary" class="mr-2" />
          Detalle de Reserva
        </span>
        <v-btn icon="mdi-close" size="small" variant="text" @click="isOpen = false" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- Código de confirmación -->
        <div class="mb-6 pa-4 rounded bg-info-lighten-5">
          <p class="text-caption text-medium-emphasis mb-1">Código de confirmación</p>
          <p class="text-h6 font-weight-bold font-mono">{{ reserva.codigoConfirmacion }}</p>
        </div>

        <!-- Estado -->
        <div class="mb-6">
          <p class="text-caption text-medium-emphasis mb-2">Estado</p>
          <v-chip
            :color="getEstadoColor(reserva.estadoReserva)"
            variant="tonal"
            size="large"
          >
            {{ reserva.estadoReserva }}
          </v-chip>
        </div>

        <v-divider class="my-4" />

        <!-- Habitación -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Habitación</h4>

          <v-row>
            <v-col v-if="getImagenes(reserva.habitacion?.imagenes).length > 0" cols="12" md="5">
              <v-img
                :src="getImagenes(reserva.habitacion?.imagenes)[0]"
                height="200"
                cover
                class="rounded"
              />
            </v-col>

            <v-col cols="12" :md="getImagenes(reserva.habitacion?.imagenes).length > 0 ? 7 : 12">
              <div class="mb-3">
                <p class="text-h6 font-weight-bold">{{ reserva.tipoHabitacion?.nombreTipo }}</p>
                <p class="text-caption text-medium-emphasis">
                  Habitación {{ reserva.habitacion?.numeroHabitacion }}
                  <span v-if="reserva.habitacion?.piso">- Piso {{ reserva.habitacion.piso }}</span>
                </p>
              </div>

              <div class="mb-2">
                <p class="text-body-2 mb-1">
                  <v-icon icon="mdi-account-multiple" size="16" />
                  Capacidad: {{ reserva.tipoHabitacion?.capacidadPersonas }} personas
                </p>
              </div>

              <div v-if="reserva.tipoHabitacion?.amenidades && reserva.tipoHabitacion.amenidades.length > 0">
                <p class="text-caption font-weight-bold mb-1">Servicios incluidos:</p>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="amenidad in reserva.tipoHabitacion.amenidades.slice(0, 3)"
                    :key="amenidad.id"
                    size="x-small"
                    variant="tonal"
                    color="primary"
                  >
                    {{ amenidad.nombre }}
                  </v-chip>
                </div>
              </div>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4" />

        <!-- Fechas y detalles -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Fechas y Detalles</h4>

          <v-row class="mb-3">
            <v-col cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Check-in previsto</p>
              <p class="text-body-2 font-weight-bold">{{ formatDate(reserva.checkinPrevisto) }}</p>
            </v-col>
            <v-col cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Check-out previsto</p>
              <p class="text-body-2 font-weight-bold">{{ formatDate(reserva.checkoutPrevisto) }}</p>
            </v-col>
            <v-col cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Noches</p>
              <p class="text-body-2 font-weight-bold">{{ numeroNoches }}</p>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Huéspedes</p>
              <p class="text-body-2 font-weight-bold">{{ reserva.numeroHuespedes }}</p>
            </v-col>
            <v-col cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Precio/Noche</p>
              <p class="text-body-2 font-weight-bold">${{ Number(reserva.precioNocheSnapshot).toLocaleString() }}</p>
            </v-col>
            <v-col cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Total</p>
              <p class="text-h6 font-weight-bold text-primary">${{ calcularTotal().toLocaleString() }}</p>
            </v-col>
          </v-row>
        </div>

        <!-- Check-in/Check-out real -->
        <div v-if="reserva.checkinReal || reserva.checkoutReal" class="mb-6">
          <v-divider class="my-4" />

          <h4 class="text-subtitle-1 font-weight-bold mb-3">Check-in/Check-out Real</h4>

          <v-row>
            <v-col v-if="reserva.checkinReal" cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Check-in real</p>
              <p class="text-body-2 font-weight-bold">{{ formatDateTime(reserva.checkinReal) }}</p>
            </v-col>
            <v-col v-if="reserva.checkoutReal" cols="6" md="4">
              <p class="text-caption text-medium-emphasis mb-1">Check-out real</p>
              <p class="text-body-2 font-weight-bold">{{ formatDateTime(reserva.checkoutReal) }}</p>
            </v-col>
          </v-row>
        </div>

        <!-- Observaciones -->
        <div v-if="reserva.observaciones" class="mb-6">
          <v-divider class="my-4" />
          <h4 class="text-subtitle-1 font-weight-bold mb-2">Observaciones</h4>
          <v-sheet color="surface-variant" class="pa-3 rounded">
            <p class="text-body-2 mb-0">{{ reserva.observaciones }}</p>
          </v-sheet>
        </div>

        <!-- Fechas de creación/actualización -->
        <div class="text-caption text-medium-emphasis pt-4 border-t">
          <p class="mb-1">Creada: {{ formatDateTime(reserva.createdAt) }}</p>
          <p>Actualizada: {{ formatDateTime(reserva.updatedAt) }}</p>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn color="primary" @click="isOpen = false">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import type { Reserva } from '~/types/api'

interface Props {
  modelValue: boolean
  reserva?: Reserva
}

const props = withDefaults(defineProps<Props>(), {})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Computed para manejar v-model correctamente
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  },
})

const numeroNoches = computed(() => {
  if (!props.reserva) return 0
  const checkin = new Date(props.reserva.checkinPrevisto)
  const checkout = new Date(props.reserva.checkoutPrevisto)
  return Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
})

const formatDate = (fecha?: Date | string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (fecha?: Date | string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getImagenes = (imagenes?: string): string[] => {
  if (!imagenes || !imagenes.trim()) return []
  return imagenes.split(',').map(img => img.trim()).filter(img => img)
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

const calcularTotal = (): number => {
  if (!props.reserva) return 0
  const checkin = new Date(props.reserva.checkinPrevisto)
  const checkout = new Date(props.reserva.checkoutPrevisto)
  const noches = Math.ceil((checkout.getTime() - checkin.getTime()) / (1000 * 60 * 60 * 24))
  return (props.reserva.precioNocheSnapshot || 0) * noches
}
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}

.border-t {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
