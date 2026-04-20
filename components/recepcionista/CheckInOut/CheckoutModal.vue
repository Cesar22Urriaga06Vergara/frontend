<template>
  <v-dialog v-model="isOpen" max-width="600px" @update:model-value="handleClose">
    <template #activator="{ props }">
      <slot name="activator" :props="props"></slot>
    </template>

    <v-card :title="`Check-out #${reserva?.numeroHabitacion || ''}`">
      <v-card-text>
        <!-- INFO -->
        <v-alert type="info" variant="tonal" density="compact" class="mb-4">
          <strong>Resumen de salida</strong>
        </v-alert>

        <v-row class="mb-4">
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Cliente</div>
            <div class="text-subtitle-1 font-weight-bold">{{ reserva?.nombreCliente }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Habitación</div>
            <div class="text-subtitle-1 font-weight-bold">#{{ reserva?.numeroHabitacion }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Check-in</div>
            <div class="text-subtitle-1">{{ formatearFecha(reserva?.checkinFecha) }}</div>
          </v-col>
          <v-col cols="12" sm="6">
            <div class="text-caption text-medium-emphasis">Check-out programado</div>
            <div class="text-subtitle-1 font-weight-bold">{{ formatearFecha(reserva?.checkoutFecha) }}</div>
          </v-col>
        </v-row>

        <v-divider class="mb-4"></v-divider>

        <!-- VALIDACIONES -->
        <v-alert
          v-if="mostrarAlertaPago"
          type="error"
          variant="tonal"
          density="compact"
          class="mb-4"
          icon="mdi-alert-circle-outline"
        >
          <strong>⚠️ Folio no pagado</strong>
          <div class="text-caption mt-1">
            El folio debe estar pagado antes de confirmar el check-out. Debe validar el pago en Caja.
          </div>
        </v-alert>

        <!-- FORM -->
        <v-form ref="formRef" @submit.prevent="confirmar">
          <v-text-field
            v-model="horaCheckout"
            label="Hora de check-out actual"
            type="time"
            variant="outlined"
            density="compact"
            class="mb-4"
          ></v-text-field>

          <v-select
            v-model="estadoLimpieza"
            label="Estado de la habitación"
            :items="estadosLimpieza"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            class="mb-4"
            :rules="[(v) => !!v || 'Estado es obligatorio']"
          ></v-select>

          <v-textarea
            v-model="notasCheckout"
            label="Notas del check-out (opcional)"
            placeholder="Ej: Daños, objetos olvidados, etc..."
            variant="outlined"
            density="compact"
            rows="3"
          ></v-textarea>
        </v-form>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="handleClose">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="tonal"
          @click="confirmar"
          :loading="loading"
          :disabled="mostrarAlertaPago || !estadoLimpieza"
        >
          Confirmar check-out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReservaParaCheckin, EstadoLimpieza } from '~/types/checkinCheckout'

interface Props {
  reserva?: ReservaParaCheckin | null
  loading?: boolean
  folioPagado?: boolean
}

interface Emits {
  (e: 'confirmar', datos: { estado: EstadoLimpieza; notas?: string; hora?: string }): void
  (e: 'cerrar'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isOpen = ref(true)
const formRef = ref<any>(null)

const horaCheckout = ref('')
const notasCheckout = ref('')
const estadoLimpieza = ref<EstadoLimpieza | ''>('')

const estadosLimpieza = [
  { label: 'Limpio - Sin daños', value: 'LIMPIO' },
  { label: 'Sucio - Se requiere limpieza', value: 'SUCIO' },
  { label: 'Pendiente de limpieza - Asignar personal', value: 'PENDIENTE_LIMPIEZA' },
  { label: 'En limpieza - Actualmente se está limpiando', value: 'EN_LIMPIEZA' }
]

const mostrarAlertaPago = computed(() => !props.folioPagado)

const formatearFecha = (fecha?: string) => {
  if (!fecha) return '-'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-CO', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const confirmar = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  if (!props.folioPagado) {
    return
  }

  emit('confirmar', {
    estado: estadoLimpieza.value as EstadoLimpieza,
    notas: notasCheckout.value || undefined,
    hora: horaCheckout.value || undefined
  })

  if (!props.loading) {
    handleClose()
  }
}

const handleClose = () => {
  isOpen.value = false
  horaCheckout.value = ''
  notasCheckout.value = ''
  estadoLimpieza.value = ''
  emit('cerrar')
}
</script>
