<template>
  <v-dialog v-model="isOpen" max-width="700" persistent>
    <v-card v-if="reserva">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-error-lighten-5">
        <span>
          <v-icon icon="mdi-alert-circle" color="error" class="mr-2" />
          Cancelar Reserva
        </span>
        <v-btn
          icon="mdi-close"
          size="small"
          variant="text"
          :disabled="cancelando"
          @click="isOpen = false"
        />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <!-- ADVERTENCIA -->
        <v-alert type="error" variant="tonal" class="mb-6">
          <p class="font-weight-bold mb-1">⚠️ Esta acción no se puede deshacer</p>
          <p class="text-body-2 mb-0">Una vez cancelada, la reserva se marcará como cancelada.</p>
        </v-alert>

        <!-- CÓDIGO DE CONFIRMACIÓN -->
        <div class="mb-6 pa-4 rounded bg-surface">
          <p class="text-caption text-medium-emphasis mb-1">Código de confirmación</p>
          <p class="text-h6 font-weight-bold font-mono">{{ reserva.codigoConfirmacion }}</p>
        </div>

        <v-divider class="my-4" />

        <!-- HABITACIÓN -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Habitación</h4>

          <v-row>
            <v-col v-if="getImagenes(reserva.habitacion?.imagenes).length > 0" cols="12" md="5">
              <v-img
                :src="getImagenes(reserva.habitacion?.imagenes)[0]"
                height="180"
                cover
                class="rounded"
              />
            </v-col>

            <v-col cols="12" :md="getImagenes(reserva.habitacion?.imagenes).length > 0 ? 7 : 12">
              <p class="text-h6 font-weight-bold">{{ reserva.tipoHabitacion?.nombreTipo }}</p>
              <p class="text-caption text-medium-emphasis mb-2">
                Habitación {{ reserva.habitacion?.numeroHabitacion }}
                <span v-if="reserva.habitacion?.piso ">- Piso {{ reserva.habitacion.piso }}</span>
              </p>

              <p class="text-body-2 mb-2">
                <v-icon icon="mdi-account-multiple" size="16" />
                Capacidad: {{ reserva.tipoHabitacion?.capacidadPersonas }} personas
              </p>

              <p class="text-body-2 font-weight-bold">
                Precio: ${{ Number(reserva.precioNocheSnapshot).toLocaleString() }}/noche
              </p>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4" />

        <!-- FECHAS -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Fechas de Estancia</h4>

          <v-row>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Check-in</p>
              <p class="text-body-2 font-weight-bold">{{ formatDate(reserva.checkinPrevisto) }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Check-out</p>
              <p class="text-body-2 font-weight-bold">{{ formatDate(reserva.checkoutPrevisto) }}</p>
            </v-col>
            <v-col cols="12">
              <p class="text-caption text-medium-emphasis mb-1">Duración</p>
              <p class="text-body-2 font-weight-bold">{{ numeroNoches }} {{ numeroNoches === 1 ? 'noche' : 'noches' }}</p>
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4" />

        <!-- CAMPO DE MOTIVO -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Motivo de Cancelación</h4>

          <v-textarea
            v-model="motivo"
            label="¿Por qué deseas cancelar esta reserva?"
            placeholder="Ej: Cambio de planes, problema personal, viaje cancelado..."
            hint="Esta información nos ayuda a mejorar"
            persistent-hint
            variant="outlined"
            :disabled="cancelando"
            counter="500"
            maxlength="500"
            rows="4"
            class="mb-4"
          />
        </div>

        <!-- CONFIRMACIÓN -->
        <v-checkbox
          v-model="confirmaCancel"
          label="Confirmo que deseo cancelar esta reserva"
          :disabled="cancelando"
          class="mb-6"
        />
      </v-card-text>

      <v-divider />

      <!-- ACCIONES -->
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="isOpen = false"
          :disabled="cancelando"
        >
          Volver
        </v-btn>
        <v-btn
          color="error"
          @click="confirmar"
          :loading="cancelando"
          :disabled="!confirmaCancel || cancelando"
          prepend-icon="mdi-check-circle"
        >
          Sí, Cancelar
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
  cancelando?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cancelando: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmar': [motivo: string]
}>()

const motivo = ref('')
const confirmaCancel = ref(false)

// Computed para manejar v-model correctamente
const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
    // Reset form cuando se cierra el diálogo
    if (!value) {
      motivo.value = ''
      confirmaCancel.value = false
    }
  },
})

// Número de noches
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
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getImagenes = (imagenes?: string): string[] => {
  if (!imagenes || !imagenes.trim()) return []
  return imagenes.split(',').map(img => img.trim()).filter(img => img)
}

const confirmar = () => {
  if (!confirmaCancel.value) return
  emit('confirmar', motivo.value)
  // El padre (mis-reservas) cierra el diálogo después de procesar
}
</script>

<style scoped>
.font-mono {
  font-family: 'Courier New', monospace;
  letter-spacing: 0.05em;
}
</style>

<style scoped></style>
