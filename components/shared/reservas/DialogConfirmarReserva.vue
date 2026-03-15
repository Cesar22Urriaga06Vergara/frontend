<template>
  <v-dialog :modelValue="modelValue" @update:modelValue="(val) => $emit('update:modelValue', val)" max-width="600" persistent>
    <v-card v-if="habitacion">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Confirmar Reserva</span>
        <v-btn icon="mdi-close" size="small" variant="text" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <v-divider />

      <v-card-text class="py-6">
        <!-- Resumen de la habitación -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Habitación Seleccionada</h4>

          <v-row class="mb-3">
            <v-col v-if="getImagenes(habitacion.imagenes).length > 0" cols="12" md="5">
              <v-img
                :src="getImagenes(habitacion.imagenes)[0]"
                height="200"
                cover
                class="rounded"
              />
            </v-col>

            <v-col cols="12" :md="getImagenes(habitacion.imagenes).length > 0 ? 7 : 12">
              <div class="mb-3">
                <p class="text-caption text-medium-emphasis mb-1">
                  <v-icon icon="mdi-door" size="16" />
                  Habitación {{ habitacion.numeroHabitacion }}
                  <span v-if="habitacion.piso">- Piso {{ habitacion.piso }}</span>
                </p>
                <h3 class="text-h6 font-weight-bold">{{ habitacion.tipoHabitacionNombre }}</h3>
              </div>

              <div class="mb-2">
                <p class="text-body-2">
                  <v-icon icon="mdi-account-multiple" size="16" />
                  Capacidad: {{ habitacion.capacidadPersonas }} persona{{ habitacion.capacidadPersonas > 1 ? 's' : '' }}
                </p>
              </div>

              <div v-if="habitacion.amenidades && habitacion.amenidades.length > 0">
                <p class="text-caption font-weight-medium mb-1">Servicios incluidos:</p>
                <div class="d-flex flex-wrap gap-1">
                  <v-chip
                    v-for="amenidad in habitacion.amenidades.slice(0, 3)"
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

        <!-- Detalles de la reserva -->
        <div class="mb-6">
          <h4 class="text-subtitle-1 font-weight-bold mb-3">Detalles de la Reserva</h4>

          <v-row class="mb-3">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Check-in</p>
              <p class="text-body-2 font-weight-bold">{{ formatDate(checkinFecha) }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Check-out</p>
              <p class="text-body-2 font-weight-bold">{{ formatDate(checkoutFecha) }}</p>
            </v-col>
          </v-row>

          <v-row class="mb-3">
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Noches</p>
              <p class="text-body-2 font-weight-bold">{{ numeroNoches }}</p>
            </v-col>
            <v-col cols="6">
              <p class="text-caption text-medium-emphasis mb-1">Precio por noche</p>
              <p class="text-body-2 font-weight-bold">${{ Number(habitacion.precioBase).toLocaleString() }}</p>
            </v-col>
          </v-row>

          <!-- Número de huéspedes -->
          <v-row class="mb-3">
            <v-col cols="12">
              <v-text-field
                v-model.number="formData.numeroHuespedes"
                label="Número de huéspedes"
                type="number"
                min="1"
                :max="props.habitacion?.capacidadPersonas"
                :rules="[
                  v => !!v || 'Es requerido',
                  v => v >= 1 || 'Mínimo 1 huésped',
                  v => !props.habitacion || v <= props.habitacion.capacidadPersonas || `Máximo ${props.habitacion.capacidadPersonas} huéspedes`,
                ]"
              />
            </v-col>
          </v-row>

          <!-- Observaciones -->
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.observaciones"
                label="Observaciones (opcional)"
                placeholder="Ej: Quiero vista al mar, cama doble..."
                rows="2"
                auto-grow
              />
            </v-col>
          </v-row>
        </div>

        <v-divider class="my-4" />

        <!-- Resumen de precio -->
        <div class="mb-4 bg-primary-lighten-5 pa-4 rounded">
          <v-row>
            <v-col cols="6">
              <p class="text-body-2 text-medium-emphasis">Subtotal ({{ numeroNoches }} × ${{ Number(habitacion.precioBase).toLocaleString() }})</p>
            </v-col>
            <v-col cols="6" class="text-right">
              <p class="text-body-2 font-weight-bold">${{ calcularSubtotal().toLocaleString() }}</p>
            </v-col>
          </v-row>
          <v-divider class="my-2" />
          <v-row>
            <v-col cols="6">
              <p class="text-h6 font-weight-bold">Total</p>
            </v-col>
            <v-col cols="6" class="text-right">
              <p class="text-h6 font-weight-bold text-primary">${{ calcularSubtotal().toLocaleString() }}</p>
            </v-col>
          </v-row>
        </div>

        <!-- Términos -->
        <v-checkbox
          v-model="aceptaTerminos"
          label="Confirmo que los datos ingresados son correctos"
          density="compact"
        />
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="outlined" @click="$emit('update:modelValue', false)">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          size="large"
          :loading="creando"
          :disabled="!aceptaTerminos || !formData.numeroHuespedes"
          @click="confirmarReserva"
        >
          <v-icon start icon="mdi-check-circle" />
          Confirmar Reserva
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { HabitacionDisponibleDto } from '~/types/api'

interface Props {
  modelValue: boolean
  habitacion?: HabitacionDisponibleDto
  checkinFecha?: string
  checkoutFecha?: string
  numeroNoches: number
  creando?: boolean
  idHotel: number
  idCliente: number
}

const props = withDefaults(defineProps<Props>(), {
  creando: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirmar: [data: any]
}>()

const aceptaTerminos = ref(false)

const formData = reactive({
  numeroHuespedes: 1,
  observaciones: '',
})

const getImagenes = (imagenes?: string): string[] => {
  if (!imagenes || !imagenes.trim()) return []
  return imagenes.split(',').map(img => img.trim()).filter(img => img)
}

const formatDate = (fecha?: string): string => {
  if (!fecha) return ''
  const date = new Date(fecha)
  return date.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const calcularSubtotal = (): number => {
  if (!props.habitacion) return 0
  return props.habitacion.precioBase * props.numeroNoches
}

const confirmarReserva = async () => {
  if (!props.habitacion || !props.checkinFecha || !props.checkoutFecha || !aceptaTerminos.value) {
    return
  }

  emit('confirmar', {
    idCliente: props.idCliente,
    idHotel: props.idHotel,
    idTipoHabitacion: props.habitacion.tipoHabitacionId,
    checkinPrevisto: props.checkinFecha,
    checkoutPrevisto: props.checkoutFecha,
    numeroHuespedes: formData.numeroHuespedes,
    observaciones: formData.observaciones || undefined,
  })
}

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      formData.numeroHuespedes = 1
      formData.observaciones = ''
      aceptaTerminos.value = false
    }
  },
)
</script>

<style scoped></style>
